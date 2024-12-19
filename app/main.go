package main

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"
)

//go:embed web_dist
var web embed.FS

func main() {
	ctx := context.Background()
	fmt.Println("Hello World")
	db, err := OpenMySQL("user", "password", "localhost", 3306, "todo", slog.Default())
	if err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&Todo{}); err != nil {
		panic(err)
	}
	run(ctx, db)
}

func run(ctx context.Context, db *gorm.DB) int {
	logger := slog.Default()
	var eg *errgroup.Group
	eg, ctx = errgroup.WithContext(ctx)

	eg.Go(func() error {
		router := gin.New()
		router.Use(cors.New(cors.Config{
			AllowAllOrigins: true,
			AllowMethods:    []string{"*"},
			AllowHeaders:    []string{"*"},
		}))

		// gin.SetMode(gin.ReleaseMode)

		viteStaticFS, err := fs.Sub(web, "web_dist")
		if err != nil {
			return err
		}

		router.NoRoute(func(c *gin.Context) {
			if strings.HasPrefix(c.Request.RequestURI, "/assets") {
				c.FileFromFS(c.Request.URL.Path, http.FS(viteStaticFS))
				return
			}
			if !strings.HasPrefix(c.Request.URL.Path, "/api") {
				c.FileFromFS("", http.FS(viteStaticFS))
				return
			}
		})

		api := router.Group("api")

		api.GET("ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
		api.GET("todo", func(c *gin.Context) {
			todos := []Todo{}
			if result := db.Find(&todos); result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": result.Error.Error(),
				})
				return
			}
			c.JSON(http.StatusOK, todos)
		})
		api.GET("todo/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
			todo := Todo{}
			if result := db.First(&todo, id); result.Error != nil {
				if errors.Is(result.Error, gorm.ErrRecordNotFound) {
					c.Status(http.StatusNotFound)
					return
				}

				c.JSON(http.StatusInternalServerError, gin.H{
					"error": result.Error.Error(),
				})
				return
			}
			c.JSON(http.StatusOK, todo)
		})
		api.POST("todo", func(c *gin.Context) {
			param := Todo{}
			if err := c.ShouldBindJSON(&param); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
			}
			todo := Todo{
				Text: param.Text,
			}
			result := db.Create(&todo)
			if result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": result.Error.Error(),
				})
			}
			c.JSON(http.StatusCreated, todo)
		})

		api.PUT("todo/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
			param := Todo{}
			if err := c.ShouldBindJSON(&param); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
			}
			todo := Todo{
				ID:         uint(id),
				Text:       param.Text,
				IsComplete: param.IsComplete,
			}
			result := db.Model(&todo).Select("Text", "IsComplete").Updates(&todo)
			if result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": result.Error.Error(),
				})
			}
			c.JSON(http.StatusOK, todo)
		})
		api.DELETE("todo/:id", func(c *gin.Context) {
			id := c.Param("id")
			result := db.Delete(&Todo{}, id)
			if result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": result.Error.Error(),
				})
			}
			c.Status(http.StatusNoContent)
		})

		httpServer := http.Server{
			Addr:    ":8080",
			Handler: router,
		}

		logger.InfoContext(ctx, fmt.Sprintf("http server listening at %v", httpServer.Addr))

		errCh := make(chan error)
		go func() {
			defer close(errCh)
			if err := httpServer.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
				logger.InfoContext(ctx, fmt.Sprintf("failed to ListenAndServe. err: %v", err))
				errCh <- err
			}
		}()

		select {
		case <-ctx.Done():
			shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer shutdownCancel()
			if err := httpServer.Shutdown(shutdownCtx); err != nil {
				logger.InfoContext(ctx, fmt.Sprintf("Server forced to shutdown. err: %v", err))
				return errors.Wrap(err, "httpServer.Shutdown")
			}
			return nil
		case err := <-errCh:
			return errors.Wrap(err, "httpServer.ListenAndServe")
		}
	})
	eg.Go(func() error {
		<-ctx.Done()
		return ctx.Err() // nolint:wrapcheck
	})

	if err := eg.Wait(); err != nil {
		return 1
	}
	return 0
}

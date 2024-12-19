package main

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/pkg/errors"

	"github.com/gin-gonic/gin"
	"golang.org/x/sync/errgroup"
)

//go:embed web_dist
var web embed.FS

func main() {
	ctx := context.Background()
	fmt.Println("Hello World")
	run(ctx)
}

func run(ctx context.Context,

// cfg *config.Config, db *gorm.DB
) int {
	logger := slog.Default()
	var eg *errgroup.Group
	eg, ctx = errgroup.WithContext(ctx)

	// if !cfg.Debug.Gin {
	// 	gin.SetMode(gin.ReleaseMode)
	// }

	eg.Go(func() error {
		router := gin.New()

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
		api.Use(cors.New(cors.Config{
			AllowAllOrigins: true,
			AllowMethods:    []string{"*"},
			AllowHeaders:    []string{"*"},
		}))
		api.GET("ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
		api.GET("todo", func(c *gin.Context) {
			c.JSON(http.StatusOK,
				[]gin.H{
					{"id": 1, "text": "todo1", "isComplete": false},
				},
			)
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

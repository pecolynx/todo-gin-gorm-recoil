package main

import (
	"time"
)

type Todo struct {
	ID         uint      `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
	Text       string    `json:"text"`
	IsComplete bool      `json:"isComplete"`
}

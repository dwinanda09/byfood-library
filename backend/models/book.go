package models

import (
	"time"
	"github.com/google/uuid"
)

type Book struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Title     string    `json:"title" db:"title"`
	Author    string    `json:"author" db:"author"`
	Year      int       `json:"year" db:"year"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateBookRequest struct {
	Title  string `json:"title" validate:"required"`
	Author string `json:"author" validate:"required"`
	Year   int    `json:"year" validate:"required,min=1000,max=2034"`
}

type UpdateBookRequest struct {
	Title  string `json:"title" validate:"required"`
	Author string `json:"author" validate:"required"`
	Year   int    `json:"year" validate:"required,min=1000,max=2034"`
}

type URLProcessRequest struct {
	URL string `json:"url" validate:"required,url"`
}
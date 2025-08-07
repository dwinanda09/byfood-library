package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"byfood-library/models"

	"github.com/gorilla/mux"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type BookHandler struct {
	db     *sql.DB
	logger *zap.Logger
}

func NewBookHandler(db *sql.DB, logger *zap.Logger) *BookHandler {
	return &BookHandler{
		db:     db,
		logger: logger,
	}
}

// @Summary Get all books
// @Description Get all books from the library
// @Tags books
// @Accept json
// @Produce json
// @Success 200 {array} models.Book
// @Failure 500 {object} map[string]string
// @Router /books [get]
func (h *BookHandler) GetBooks(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, title, author, year, created_at, updated_at FROM books ORDER BY created_at DESC`

	rows, err := h.db.Query(query)
	if err != nil {
		h.logger.Error("Failed to query books", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []models.Book
	for rows.Next() {
		var book models.Book
		err := rows.Scan(&book.ID, &book.Title, &book.Author, &book.Year, &book.CreatedAt, &book.UpdatedAt)
		if err != nil {
			h.logger.Error("Failed to scan book", zap.Error(err))
			continue
		}
		books = append(books, book)
	}

	if books == nil {
		books = []models.Book{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

// @Summary Get a book by ID
// @Description Get a single book by its ID
// @Tags books
// @Accept json
// @Produce json
// @Param id path string true "Book ID"
// @Success 200 {object} models.Book
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /books/{id} [get]
func (h *BookHandler) GetBook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	query := `SELECT id, title, author, year, created_at, updated_at FROM books WHERE id = $1`

	var book models.Book
	err = h.db.QueryRow(query, id).Scan(&book.ID, &book.Title, &book.Author, &book.Year, &book.CreatedAt, &book.UpdatedAt)
	if err == sql.ErrNoRows {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}
	if err != nil {
		h.logger.Error("Failed to query book", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// @Summary Create a new book
// @Description Add a new book to the library
// @Tags books
// @Accept json
// @Produce json
// @Param book body models.CreateBookRequest true "Book data"
// @Success 201 {object} models.Book
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /books [post]
func (h *BookHandler) CreateBook(w http.ResponseWriter, r *http.Request) {
	var req models.CreateBookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Author == "" || req.Year < 1000 || req.Year > 2034 {
		http.Error(w, "Invalid book data", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO books (title, author, year, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at`

	var book models.Book
	now := time.Now()
	err := h.db.QueryRow(query, req.Title, req.Author, req.Year, now, now).Scan(&book.ID, &book.CreatedAt, &book.UpdatedAt)
	if err != nil {
		h.logger.Error("Failed to create book", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	book.Title = req.Title
	book.Author = req.Author
	book.Year = req.Year

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}

// @Summary Update a book
// @Description Update an existing book
// @Tags books
// @Accept json
// @Produce json
// @Param id path string true "Book ID"
// @Param book body models.UpdateBookRequest true "Updated book data"
// @Success 200 {object} models.Book
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /books/{id} [put]
func (h *BookHandler) UpdateBook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateBookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Author == "" || req.Year < 1000 || req.Year > 2034 {
		http.Error(w, "Invalid book data", http.StatusBadRequest)
		return
	}

	query := `UPDATE books SET title = $1, author = $2, year = $3, updated_at = $4 WHERE id = $5 RETURNING id, title, author, year, created_at, updated_at`

	var book models.Book
	now := time.Now()
	err = h.db.QueryRow(query, req.Title, req.Author, req.Year, now, id).Scan(&book.ID, &book.Title, &book.Author, &book.Year, &book.CreatedAt, &book.UpdatedAt)
	if err == sql.ErrNoRows {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}
	if err != nil {
		h.logger.Error("Failed to update book", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// @Summary Delete a book
// @Description Delete a book from the library
// @Tags books
// @Accept json
// @Produce json
// @Param id path string true "Book ID"
// @Success 204
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /books/{id} [delete]
func (h *BookHandler) DeleteBook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	query := `DELETE FROM books WHERE id = $1`

	result, err := h.db.Exec(query, id)
	if err != nil {
		h.logger.Error("Failed to delete book", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		h.logger.Error("Failed to get rows affected", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
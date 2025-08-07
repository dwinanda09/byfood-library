package main

import (
    "log"
    "net/http"
    "os"

    "byfood-library/database"
    "byfood-library/handlers"
    _ "byfood-library/docs"

    "github.com/gorilla/mux"
    "github.com/rs/cors"
    httpSwagger "github.com/swaggo/http-swagger"
    "go.uber.org/zap"
)

// @title Book Library API
// @version 1.0
// @description A simple book library management API with UUID support
// @host localhost:8080
// @BasePath /
func main() {
    logger, _ := zap.NewProduction()
    defer logger.Sync()

    db, err := database.InitDB()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    bookHandler := handlers.NewBookHandler(db, logger)
    urlHandler := handlers.NewURLHandler(logger)

    r := mux.NewRouter()
    
    r.HandleFunc("/books", bookHandler.GetBooks).Methods("GET")
    r.HandleFunc("/books", bookHandler.CreateBook).Methods("POST")
    r.HandleFunc("/books/{id}", bookHandler.GetBook).Methods("GET")
    r.HandleFunc("/books/{id}", bookHandler.UpdateBook).Methods("PUT")
    r.HandleFunc("/books/{id}", bookHandler.DeleteBook).Methods("DELETE")
    
    r.HandleFunc("/process-url", urlHandler.ProcessURL).Methods("POST")
    
    r.PathPrefix("/swagger").Handler(httpSwagger.WrapHandler)
    
    r.HandleFunc("/docs", func(w http.ResponseWriter, r *http.Request) {
        http.Redirect(w, r, "/swagger/", http.StatusFound)
    }).Methods("GET")

    r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    }).Methods("GET")

    c := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:3000"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"*"},
    })

    handler := c.Handler(r)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    logger.Info("Server starting", zap.String("port", port))
    log.Fatal(http.ListenAndServe(":"+port, handler))
}
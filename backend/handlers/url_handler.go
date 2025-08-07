package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"byfood-library/models"

	"go.uber.org/zap"
)

type URLHandler struct {
	logger *zap.Logger
}

func NewURLHandler(logger *zap.Logger) *URLHandler {
	return &URLHandler{
		logger: logger,
	}
}

type URLProcessResponse struct {
	OriginalURL string `json:"original_url"`
	CleanedURL  string `json:"cleaned_url"`
	Domain      string `json:"domain"`
	Path        string `json:"path"`
	Query       string `json:"query"`
}

// @Summary Process and cleanup URL
// @Description Process a URL and return cleaned version with components
// @Tags utils
// @Accept json
// @Produce json
// @Param url body models.URLProcessRequest true "URL to process"
// @Success 200 {object} URLProcessResponse
// @Failure 400 {object} map[string]string
// @Router /process-url [post]
func (h *URLHandler) ProcessURL(w http.ResponseWriter, r *http.Request) {
	var req models.URLProcessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.URL == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}

	parsedURL, err := url.Parse(req.URL)
	if err != nil {
		http.Error(w, "Invalid URL format", http.StatusBadRequest)
		return
	}

	query := parsedURL.Query()
	trackingParams := []string{
		"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
		"fbclid", "gclid", "ref", "source", "campaign_id",
	}

	for _, param := range trackingParams {
		query.Del(param)
	}

	cleanedURL := &url.URL{
		Scheme:   parsedURL.Scheme,
		Host:     parsedURL.Host,
		Path:     parsedURL.Path,
		RawQuery: query.Encode(),
	}

	if cleanedURL.Path != "/" && strings.HasSuffix(cleanedURL.Path, "/") {
		cleanedURL.Path = strings.TrimSuffix(cleanedURL.Path, "/")
	}

	response := URLProcessResponse{
		OriginalURL: req.URL,
		CleanedURL:  cleanedURL.String(),
		Domain:      parsedURL.Host,
		Path:        parsedURL.Path,
		Query:       query.Encode(),
	}

	h.logger.Info("URL processed",
		zap.String("original", req.URL),
		zap.String("cleaned", cleanedURL.String()),
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
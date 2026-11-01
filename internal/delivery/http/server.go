package http

import (
	"context"
	"log"
	"net/http"
	"time"
	"errors"
	"fmt"
)

type Server struct {
	server          *http.Server
	shutdownTimeout time.Duration
}

func NewServer(address string, handler http.Handler, timeout time.Duration) *Server {
	return &Server{
		server: &http.Server{
			Addr:              address,
			Handler:           handler,
			ReadHeaderTimeout: 5 * time.Second,
		},
		shutdownTimeout: timeout,
	}
}

func (s *Server) Run(ctx context.Context) error {
	serveErr := make(chan error, 1)

	go func() {
		log.Printf("HTTP server starting on %s", s.server.Addr)
		serveErr <- s.server.ListenAndServe()
	}()

	var runErr error

	select {
	case <-ctx.Done():
		log.Println("Shutdown signal received")
	case err := <-serveErr:
		if !errors.Is(err, http.ErrServerClosed) {
			runErr = fmt.Errorf("HTTP server failed: %w", err)
		}
	}

	log.Println("Shutting down HTTP server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), s.shutdownTimeout * time.Second)

	defer cancel()

	if err := s.server.Shutdown(shutdownCtx); err != nil{
		log.Printf("Graceful shutdown failed: %v", err)

		if closeErr := s.server.Close(); closeErr != nil {
			return errors.Join(
				runErr,
				fmt.Errorf("graceful shutdown failed: %w", err),
				fmt.Errorf("force close failed: %w", closeErr),
			)
		}

		return errors.Join(
			runErr,
			fmt.Errorf("graceful shutdown failed: %w", err),
		)
	}

	log.Println("HTTP server stopped gracefully")

	return nil
}

package apperr

import (
	"errors"
	"fmt"
	"net/http"
)

type ErrorCode string

const (
	ErrInternal     ErrorCode = "INTERNAL_ERROR"
	ErrInvalidInput ErrorCode = "INVALID_INPUT"
	ErrNotFound     ErrorCode = "NOT_FOUND"
	ErrDependency   ErrorCode = "DEPENDENCY_ERROR"
	ErrTimeout      ErrorCode = "TIMEOUT"
	ErrConflict     ErrorCode = "DUPLICATE_ERROR"
	ErrUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrForbidden    ErrorCode = "FORBIDDEN"
)

type AppError struct {
	Status  int
	Code    ErrorCode
	Message string
	Module  string
	Err     error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s/%s] %s: %v",
			e.Module,
			e.Code,
			e.Message,
			e.Err,
		)
	}

	return fmt.Sprintf("[%s/%s] %s",
		e.Module,
		e.Code,
		e.Message,
	)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func New(
	status int,
	code ErrorCode,
	module string,
	message string,
	cause error,
) *AppError {
	return &AppError{
		Status:  status,
		Code:    code,
		Module:  module,
		Message: message,
		Err:     cause,
	}
}

func InvalidInput(module, msg string, cause error) *AppError {
	return New(
		http.StatusBadRequest,
		ErrInvalidInput,
		module,
		msg,
		cause,
	)
}

func Unauthorized(module, msg string, cause error) *AppError {
	return New(
		http.StatusUnauthorized,
		ErrUnauthorized,
		module,
		msg,
		cause,
	)
}

func Forbidden(module, msg string, cause error) *AppError {
	return New(
		http.StatusForbidden,
		ErrForbidden,
		module,
		msg,
		cause,
	)
}

func NotFound(module, msg string, cause error) *AppError {
	return New(
		http.StatusNotFound,
		ErrNotFound,
		module,
		msg,
		cause,
	)
}

func Dependency(module, msg string, cause error) *AppError {
	return New(
		http.StatusServiceUnavailable,
		ErrDependency,
		module,
		msg,
		cause,
	)
}

func Conflict(module, msg string, cause error) *AppError {
	return New(
		http.StatusConflict,
		ErrConflict,
		module,
		msg,
		cause,
	)
}

func Timeout(module, msg string, cause error) *AppError {
	return New(
		http.StatusGatewayTimeout,
		ErrTimeout,
		module,
		msg,
		cause,
	)
}

func Internal(module string, cause error) *AppError {
	return New(
		http.StatusInternalServerError,
		ErrInternal,
		module,
		"internal server error",
		cause,
	)
}

func As(err error) (*AppError, bool) {
	var ae *AppError

	if !errors.As(err, &ae) {
		return nil, false
	}

	return ae, true
}

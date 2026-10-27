package com.examly.springapp.exception;

// Thrown when a record cannot be found by the provided ID -> HTTP 404
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

package com.examly.springapp.exception;

// Thrown when a name field contains non-alphabetic characters or digits -> HTTP 400
public class InvalidNameException extends RuntimeException {
    public InvalidNameException(String message) {
        super(message);
    }
}

package com.examly.springapp.exception;

// Thrown when the same applicant applies to the same programme more than once -> HTTP 409
public class DuplicateApplicationException extends RuntimeException {
    public DuplicateApplicationException(String message) {
        super(message);
    }
}

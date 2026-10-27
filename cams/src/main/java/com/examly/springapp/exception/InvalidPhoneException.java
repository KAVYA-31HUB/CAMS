package com.examly.springapp.exception;

// Thrown when a phone number is not exactly 10 digits -> HTTP 400
public class InvalidPhoneException extends RuntimeException {
    public InvalidPhoneException(String message) {
        super(message);
    }
}

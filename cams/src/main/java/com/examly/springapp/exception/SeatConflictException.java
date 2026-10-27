package com.examly.springapp.exception;

// Thrown when an allocation is attempted against a seat matrix row that has no vacancy -> HTTP 409
public class SeatConflictException extends RuntimeException {
    public SeatConflictException(String message) {
        super(message);
    }
}

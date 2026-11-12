package com.smartqueue.exception;

public class DuplicateQueueException extends RuntimeException {
    public DuplicateQueueException(String message) {
        super(message);
    }
}

package com.fishnote.user;

import org.springframework.http.HttpStatus;

public class KakaoOAuthException extends RuntimeException {

    private final HttpStatus status;

    public KakaoOAuthException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

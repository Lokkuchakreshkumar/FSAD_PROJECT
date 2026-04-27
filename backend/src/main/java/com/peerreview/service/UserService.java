package com.peerreview.service;

import com.peerreview.dto.AuthResponse;
import com.peerreview.dto.LoginRequest;
import com.peerreview.dto.RegisterRequest;
import com.peerreview.dto.UserResponse;

public interface UserService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getProfile(String email);
}

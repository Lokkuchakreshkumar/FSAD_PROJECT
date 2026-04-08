package com.peerreview.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peerreview.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}

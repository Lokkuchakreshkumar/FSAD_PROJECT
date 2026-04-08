package com.peerreview.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peerreview.model.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}

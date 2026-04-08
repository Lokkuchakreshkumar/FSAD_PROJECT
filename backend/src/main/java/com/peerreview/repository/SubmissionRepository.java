package com.peerreview.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peerreview.model.Project;
import com.peerreview.model.Submission;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    @Query("SELECT s FROM Submission s JOIN FETCH s.user JOIN FETCH s.project WHERE s.project = :project ORDER BY s.id ASC")
    List<Submission> findByProjectOrderByIdAsc(@Param("project") Project project);

    @Query("SELECT s FROM Submission s JOIN FETCH s.user JOIN FETCH s.project WHERE s.id = :id")
    Optional<Submission> findByIdWithDetails(@Param("id") Long id);
}

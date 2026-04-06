package com.peerreview.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peerreview.model.Project;
import com.peerreview.model.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByProjectOrderByIdAsc(Project project);
}

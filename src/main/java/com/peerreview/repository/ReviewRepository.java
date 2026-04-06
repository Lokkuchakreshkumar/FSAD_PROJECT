package com.peerreview.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peerreview.model.Review;
import com.peerreview.model.Submission;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findBySubmissionOrderByIdAsc(Submission submission);
}

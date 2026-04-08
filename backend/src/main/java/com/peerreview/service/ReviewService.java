package com.peerreview.service;

import java.util.List;

import com.peerreview.dto.ReviewRequest;
import com.peerreview.dto.ReviewResponse;

public interface ReviewService {

    ReviewResponse addReview(ReviewRequest request);

    List<ReviewResponse> findBySubmissionId(Long submissionId);
}

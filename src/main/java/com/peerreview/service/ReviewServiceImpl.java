package com.peerreview.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peerreview.dto.ReviewRequest;
import com.peerreview.dto.ReviewResponse;
import com.peerreview.exception.BusinessRuleException;
import com.peerreview.exception.ResourceNotFoundException;
import com.peerreview.model.Review;
import com.peerreview.model.Submission;
import com.peerreview.model.User;
import com.peerreview.repository.ReviewRepository;
import com.peerreview.repository.SubmissionRepository;
import com.peerreview.repository.UserRepository;
import com.peerreview.security.SecurityUtils;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.reviewRepository = reviewRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public ReviewResponse addReview(ReviewRequest request) {
        String email = SecurityUtils.requireCurrentUserEmail();
        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (submission.getUser().getId().equals(reviewer.getId())) {
            throw new BusinessRuleException("You cannot review your own submission");
        }

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment() != null ? request.getComment().trim() : null);
        review.setSubmission(submission);
        review.setReviewer(reviewer);

        Review saved = reviewRepository.save(review);

        User author = submission.getUser();
        emailService.sendEmail(
            author.getEmail(),
            "New Review for your Submission",
            "Hi " + author.getName() + ",\n\nYour submission for the project '" + submission.getProject().getTitle() + "' has received a new review from " + reviewer.getName() + ".\nRating: " + review.getRating() + "/5"
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> findBySubmissionId(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        return reviewRepository.findBySubmissionOrderByIdAsc(submission).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getRating(),
                r.getComment(),
                r.getSubmission().getId(),
                r.getReviewer().getId(),
                r.getReviewer().getName());
    }
}

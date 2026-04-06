package com.peerreview.dto;

public class ReviewResponse {

    private Long id;
    private int rating;
    private String comment;
    private Long submissionId;
    private Long reviewerId;
    private String reviewerName;

    public ReviewResponse() {
    }

    public ReviewResponse(Long id, int rating, String comment, Long submissionId, Long reviewerId,
            String reviewerName) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.submissionId = submissionId;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }
}

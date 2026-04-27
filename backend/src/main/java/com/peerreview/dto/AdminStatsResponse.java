package com.peerreview.dto;

public class AdminStatsResponse {
    private long totalUsers;
    private long totalProjects;
    private long totalSubmissions;
    private long totalReviews;

    public AdminStatsResponse() {}

    public AdminStatsResponse(long totalUsers, long totalProjects, long totalSubmissions, long totalReviews) {
        this.totalUsers = totalUsers;
        this.totalProjects = totalProjects;
        this.totalSubmissions = totalSubmissions;
        this.totalReviews = totalReviews;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
    public long getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; }
    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }
}

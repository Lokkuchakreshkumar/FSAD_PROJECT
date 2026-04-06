package com.peerreview.dto;

public class SubmissionResponse {

    private Long id;
    private String content;
    private Long userId;
    private String userName;
    private Long projectId;
    private String projectTitle;

    public SubmissionResponse() {
    }

    public SubmissionResponse(Long id, String content, Long userId, String userName, Long projectId,
            String projectTitle) {
        this.id = id;
        this.content = content;
        this.userId = userId;
        this.userName = userName;
        this.projectId = projectId;
        this.projectTitle = projectTitle;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }
}

package com.peerreview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SubmissionRequest {

    @NotNull(message = "Project id is required")
    private Long projectId;

    @NotBlank(message = "Content is required")
    @Size(max = 10000)
    private String content;

    public SubmissionRequest() {
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}

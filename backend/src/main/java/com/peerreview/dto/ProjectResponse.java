package com.peerreview.dto;

public class ProjectResponse {

    private Long id;
    private String title;
    private String description;
    private Long createdById;
    private String createdByName;

    public ProjectResponse() {
    }

    public ProjectResponse(Long id, String title, String description, Long createdById, String createdByName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdById = createdById;
        this.createdByName = createdByName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
}

package com.peerreview.service;

import java.util.List;

import com.peerreview.dto.ProjectRequest;
import com.peerreview.dto.ProjectResponse;

public interface ProjectService {

    ProjectResponse create(ProjectRequest request);

    List<ProjectResponse> findAll();
}

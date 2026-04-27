package com.peerreview.service;

import java.util.List;
import com.peerreview.dto.AdminStatsResponse;
import com.peerreview.dto.UserResponse;
import com.peerreview.dto.ProjectResponse;

public interface AdminService {
    AdminStatsResponse getStats();
    List<UserResponse> getAllUsers();
    void deleteUser(Long userId);
    List<ProjectResponse> getAllProjects();
    void deleteProject(Long projectId);
}

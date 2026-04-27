package com.peerreview.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peerreview.dto.AdminStatsResponse;
import com.peerreview.dto.ProjectResponse;
import com.peerreview.dto.UserResponse;
import com.peerreview.repository.ProjectRepository;
import com.peerreview.repository.ReviewRepository;
import com.peerreview.repository.SubmissionRepository;
import com.peerreview.repository.UserRepository;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SubmissionRepository submissionRepository;
    private final ReviewRepository reviewRepository;

    public AdminServiceImpl(UserRepository userRepository, 
                            ProjectRepository projectRepository,
                            SubmissionRepository submissionRepository, 
                            ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.submissionRepository = submissionRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
            userRepository.count(),
            projectRepository.count(),
            submissionRepository.count(),
            reviewRepository.count()
        );
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
            .map(p -> new ProjectResponse(p.getId(), p.getTitle(), p.getDescription(), p.getCreatedBy().getId(), p.getCreatedBy().getName()))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }
}

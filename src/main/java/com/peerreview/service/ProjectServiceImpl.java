package com.peerreview.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peerreview.dto.ProjectRequest;
import com.peerreview.dto.ProjectResponse;
import com.peerreview.exception.ResourceNotFoundException;
import com.peerreview.model.Project;
import com.peerreview.model.User;
import com.peerreview.repository.ProjectRepository;
import com.peerreview.repository.UserRepository;
import com.peerreview.security.SecurityUtils;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        String email = SecurityUtils.requireCurrentUserEmail();
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = new Project();
        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        project.setCreatedBy(creator);

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> findAll() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    private ProjectResponse toResponse(Project project) {
        User creator = project.getCreatedBy();
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                creator.getId(),
                creator.getName());
    }
}

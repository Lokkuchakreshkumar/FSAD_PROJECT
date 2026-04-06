package com.peerreview.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peerreview.dto.SubmissionRequest;
import com.peerreview.dto.SubmissionResponse;
import com.peerreview.exception.ResourceNotFoundException;
import com.peerreview.model.Project;
import com.peerreview.model.Submission;
import com.peerreview.model.User;
import com.peerreview.repository.ProjectRepository;
import com.peerreview.repository.SubmissionRepository;
import com.peerreview.repository.UserRepository;
import com.peerreview.security.SecurityUtils;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.submissionRepository = submissionRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public SubmissionResponse submit(SubmissionRequest request) {
        String email = SecurityUtils.requireCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Submission submission = new Submission();
        submission.setContent(request.getContent().trim());
        submission.setUser(user);
        submission.setProject(project);

        Submission saved = submissionRepository.save(submission);

        emailService.sendEmail(
            user.getEmail(),
            "Submission Confirmation",
            "Hi " + user.getName() + ",\n\nYour submission for the project '" + project.getTitle() + "' has been successfully received."
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> findByProjectId(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return submissionRepository.findByProjectOrderByIdAsc(project).stream()
                .map(this::toResponse)
                .toList();
    }

    private SubmissionResponse toResponse(Submission s) {
        return new SubmissionResponse(
                s.getId(),
                s.getContent(),
                s.getUser().getId(),
                s.getUser().getName(),
                s.getProject().getId(),
                s.getProject().getTitle());
    }
}

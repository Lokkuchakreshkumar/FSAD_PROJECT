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
    public SubmissionResponse submit(SubmissionRequest request, String fileName, String fileUrl) {
        String email = SecurityUtils.requireCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Submission submission = new Submission();
        submission.setContent(request.getContent().trim());
        submission.setUser(user);
        submission.setProject(project);
        submission.setFileName(fileName);
        submission.setFileUrl(fileUrl);

        Submission saved = submissionRepository.save(submission);

        
        emailService.sendEmail(
            user.getEmail(),
            "Submission Received: " + project.getTitle(),
            "Hi " + user.getName() + ",\n\nYour submission for the project '" + project.getTitle() + "' has been successfully received.\n" +
            (fileName != null ? "Attached file: " + fileName : "No file attached.") +
            "\n\nGood luck with your peer reviews!"
        );

        
        User owner = project.getCreatedBy();
        emailService.sendEmail(
            owner.getEmail(),
            "New Project Submission: " + project.getTitle(),
            "Hi " + owner.getName() + ",\n\n" + user.getName() + " has just submitted their assignment for your project '" + project.getTitle() + "'.\n" +
            (fileName != null ? "They attached a file: " + fileName : "No file was attached.") +
            "\n\nYou can view and manage all submissions on your project dashboard."
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

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse findById(Long id) {
        Submission submission = submissionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        return toResponse(submission);
    }

    private SubmissionResponse toResponse(Submission s) {
        return new SubmissionResponse(
                s.getId(),
                s.getContent(),
                s.getUser() != null ? s.getUser().getId() : null,
                s.getUser() != null ? s.getUser().getName() : "Unknown User",
                s.getProject() != null ? s.getProject().getId() : null,
                s.getProject() != null ? s.getProject().getTitle() : "Unknown Project",
                s.getFileName(),
                s.getFileUrl());
    }
}

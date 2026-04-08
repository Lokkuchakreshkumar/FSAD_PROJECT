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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import com.peerreview.repository.SubmissionRepository;
import com.peerreview.repository.ReviewRepository;
import com.peerreview.model.Submission;
import com.peerreview.model.Review;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final ReviewRepository reviewRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository, 
                              UserRepository userRepository,
                              SubmissionRepository submissionRepository,
                              ReviewRepository reviewRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.reviewRepository = reviewRepository;
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

    @Override
    @Transactional(readOnly = true)
    public byte[] exportToExcel(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Submissions");

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Submission ID", "Student Name", "Content", "File Name", "Avg Score", "Total Reviews"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            List<Submission> submissions = submissionRepository.findByProjectOrderByIdAsc(project);
            int rowIdx = 1;
            for (Submission s : submissions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getId());
                row.createCell(1).setCellValue(s.getUser().getName());
                row.createCell(2).setCellValue(s.getContent());
                row.createCell(3).setCellValue(s.getFileName() != null ? s.getFileName() : "N/A");

                List<Review> reviews = reviewRepository.findBySubmissionOrderByIdAsc(s);
                double avgScore = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
                row.createCell(4).setCellValue(avgScore);
                row.createCell(5).setCellValue(reviews.size());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
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

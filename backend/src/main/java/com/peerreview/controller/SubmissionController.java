package com.peerreview.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.peerreview.dto.SubmissionRequest;
import com.peerreview.dto.SubmissionResponse;
import com.peerreview.service.SubmissionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.peerreview.service.FileStorageService;

@RestController
@RequestMapping("/api/submissions")
@Tag(name = "Submissions", description = "Endpoints for submission management")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final FileStorageService fileStorageService;

    public SubmissionController(SubmissionService submissionService, FileStorageService fileStorageService) {
        this.submissionService = submissionService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionResponse> submit(
            @RequestPart("request") @Valid SubmissionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        String fileName = null;
        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            fileUrl = fileStorageService.save(file);
            fileName = file.getOriginalFilename();
        }
        SubmissionResponse created = submissionService.submit(request, fileName, fileUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SubmissionResponse>> listByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(submissionService.findByProjectId(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.findById(id));
    }
}

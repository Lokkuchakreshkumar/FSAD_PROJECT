package com.peerreview.service;

import java.util.List;

import com.peerreview.dto.SubmissionRequest;
import com.peerreview.dto.SubmissionResponse;

public interface SubmissionService {

    SubmissionResponse submit(SubmissionRequest request);

    List<SubmissionResponse> findByProjectId(Long projectId);
}

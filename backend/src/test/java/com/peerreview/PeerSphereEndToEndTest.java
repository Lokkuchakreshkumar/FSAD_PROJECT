package com.peerreview;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PeerSphereEndToEndTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Health is public")
    void actuatorHealth_noAuth_ok() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Secured API without token returns 401")
    void projects_withoutToken_unauthorized() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CORS preflight OPTIONS is allowed without JWT")
    void corsPreflight_options_ok() throws Exception {
        mockMvc.perform(options("/api/projects")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Full flow: register → login → project → submission → peer review → list reviews")
    void fullPeerReviewFlow() throws Exception {
        String id = java.util.UUID.randomUUID().toString().substring(0, 8);
        String submitterEmail = "submitter-" + id + "@e2e.test";
        String reviewerEmail = "reviewer-" + id + "@e2e.test";
        String password = "password12";

        register("Submitter", submitterEmail, password);
        register("Reviewer", reviewerEmail, password);

        String submitterToken = login(submitterEmail, password);
        String reviewerToken = login(reviewerEmail, password);

        long projectId = createProject(submitterToken, "E2E Project", "Description");
        long submissionId = submitSubmission(submitterToken, projectId, "https://e2e.test/submission");

        mockMvc.perform(get("/api/submissions/project/" + projectId)
                        .header("Authorization", bearer(submitterToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(submissionId));

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(submitterToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"submissionId": %d, "rating": 5, "comment": "Cannot review own work"}
                                """.formatted(submissionId)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", bearer(reviewerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"submissionId": %d, "rating": 4, "comment": "Great job"}
                                """.formatted(submissionId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.reviewerId").exists());

        mockMvc.perform(get("/api/reviews/submission/" + submissionId)
                        .header("Authorization", bearer(reviewerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].submissionId").value(submissionId))
                .andExpect(jsonPath("$[0].rating").value(4));
    }

    @Test
    @DisplayName("Duplicate registration returns 409")
    void duplicateRegistration_conflict() throws Exception {
        String id = java.util.UUID.randomUUID().toString().substring(0, 8);
        String email = "dup-" + id + "@e2e.test";
        register("First", email, "password12");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterBody("Second", email, "password12"))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Invalid login returns 401")
    void badLogin_unauthorized() throws Exception {
        String id = java.util.UUID.randomUUID().toString().substring(0, 8);
        String email = "bad-" + id + "@e2e.test";
        register("U", email, "password12");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginBody(email, "wrongpassword"))))
                .andExpect(status().isUnauthorized());
    }

    private void register(String name, String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterBody(name, email, password))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginBody(email, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(node.get("token").asText()).isNotBlank();
        return node.get("token").asText();
    }

    private long createProject(String token, String title, String description) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/projects")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ProjectBody(title, description))))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }

    private long submitSubmission(String token, long projectId, String content) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/submissions")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmissionBody(projectId, content))))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private record RegisterBody(String name, String email, String password) {
    }

    private record LoginBody(String email, String password) {
    }

    private record ProjectBody(String title, String description) {
    }

    private record SubmissionBody(long projectId, String content) {
    }
}

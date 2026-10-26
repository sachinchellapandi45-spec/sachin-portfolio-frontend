package com.sachin.portfolio.controller;

import com.sachin.portfolio.dto.ContactMessageDto;
import com.sachin.portfolio.model.ContactMessage;
import com.sachin.portfolio.service.ContactService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /** POST /api/contact - Submit contact form (public) */
    @PostMapping("/api/contact")
    public ResponseEntity<Map<String, Object>> submit(
            @Valid @RequestBody ContactMessageDto dto,
            HttpServletRequest request) {
        ContactMessage saved = contactService.saveMessage(dto, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "success",
                "message", "Thank you! Your message has been received.",
                "id", saved.getId()
        ));
    }

    /** GET /api/admin/contacts - List messages with search/filter (JWT required) */
    @GetMapping("/api/admin/contacts")
    public ResponseEntity<Page<ContactMessage>> getMessages(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(contactService.getMessages(q, isRead, page, size));
    }

    /** PUT /api/admin/contacts/{id}/read - Mark message as read/unread */
    @PutMapping("/api/admin/contacts/{id}/read")
    public ResponseEntity<ContactMessage> markRead(
            @PathVariable Long id,
            @RequestParam Boolean value) {
        return ResponseEntity.ok(contactService.markRead(id, value));
    }

    /** DELETE /api/admin/contacts/{id} - Delete a message */
    @DeleteMapping("/api/admin/contacts/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        contactService.deleteMessage(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }

    /** GET /api/admin/contacts/unread-count - Count of unread messages */
    @GetMapping("/api/admin/contacts/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(Map.of("count", contactService.countUnread()));
    }
}

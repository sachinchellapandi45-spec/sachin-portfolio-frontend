package com.sachin.portfolio.service;

import com.sachin.portfolio.dto.ContactMessageDto;
import com.sachin.portfolio.exception.ResourceNotFoundException;
import com.sachin.portfolio.model.ContactMessage;
import com.sachin.portfolio.repository.ContactMessageRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Contact message service - handles form submissions and admin operations.
 */
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessage saveMessage(ContactMessageDto dto, HttpServletRequest request) {
        String ip = request != null ? request.getRemoteAddr() : null;
        ContactMessage msg = ContactMessage.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .senderIp(ip)
                .isRead(false)
                .build();
        return contactMessageRepository.save(msg);
    }

    public Page<ContactMessage> getMessages(String query, Boolean isRead, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (query != null && !query.isBlank()) {
            return contactMessageRepository.searchMessages(query, pageable);
        }
        if (isRead != null) {
            return contactMessageRepository.findByIsReadOrderByCreatedAtDesc(isRead, pageable);
        }
        return contactMessageRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public ContactMessage markRead(Long id, Boolean isRead) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        msg.setIsRead(isRead);
        return contactMessageRepository.save(msg);
    }

    @Transactional
    public void deleteMessage(Long id) {
        contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        contactMessageRepository.deleteById(id);
    }

    public long countUnread() {
        return contactMessageRepository.countByIsRead(false);
    }
}

package com.sachin.portfolio.repository;

import com.sachin.portfolio.model.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    long countByIsRead(Boolean isRead);

    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT c FROM ContactMessage c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.subject) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.message) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY c.createdAt DESC")
    Page<ContactMessage> searchMessages(@Param("q") String query, Pageable pageable);

    Page<ContactMessage> findByIsReadOrderByCreatedAtDesc(Boolean isRead, Pageable pageable);
}

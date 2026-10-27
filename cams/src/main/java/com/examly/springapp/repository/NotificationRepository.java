package com.examly.springapp.repository;

import com.examly.springapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUser_IdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRecipientUser_EmailOrderByCreatedAtDesc(String email);
    List<Notification> findByRecipientUserIsNullOrderByCreatedAtDesc();
    long countByRecipientUser_IdAndIsReadFalse(Long userId);
    long countByRecipientUser_EmailAndIsReadFalse(String email);
}

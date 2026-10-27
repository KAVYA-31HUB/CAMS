package com.examly.springapp.service;

import com.examly.springapp.dto.NotificationDto;
import com.examly.springapp.entity.Notification;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.NotificationRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification sendNotification(User recipient, String title, String message, String type) {
        Notification notification = new Notification(recipient, title, message, type);
        return notificationRepository.save(notification);
    }

    public Notification sendNotificationToUser(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            return sendNotification(user, title, message, type);
        }
        return null;
    }

    public Notification broadcastNotification(String title, String message, String type) {
        Notification notification = new Notification(null, title, message, type);
        return notificationRepository.save(notification);
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        List<Notification> userSpecific = notificationRepository.findByRecipientUser_IdOrderByCreatedAtDesc(userId);
        List<Notification> broadcasts = notificationRepository.findByRecipientUserIsNullOrderByCreatedAtDesc();

        List<Notification> all = new ArrayList<>(userSpecific);
        all.addAll(broadcasts);

        return all.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(n -> new NotificationDto(
                        n.getId(),
                        n.getTitle(),
                        n.getMessage(),
                        n.getType(),
                        n.getIsRead(),
                        n.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientUser_IdAndIsReadFalse(userId);
    }
}

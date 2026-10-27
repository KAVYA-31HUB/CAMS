package com.examly.springapp.controller;

import com.examly.springapp.dto.NotificationDto;
import com.examly.springapp.entity.Notification;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("unreadCount", 0L));
        }
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        long count = user != null ? notificationService.getUnreadCount(user.getId()) : 0L;
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Notification> broadcast(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String message = body.get("message");
        String type = body.getOrDefault("type", "ANNOUNCEMENT");
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.broadcastNotification(title, message, type));
    }
}

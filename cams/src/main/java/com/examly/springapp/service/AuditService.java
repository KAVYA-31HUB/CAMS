package com.examly.springapp.service;

import com.examly.springapp.entity.AuditLog;
import com.examly.springapp.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Long userId, String userEmail, String userRole, String action,
                    String entityName, String entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog(userId, userEmail, userRole, action, entityName, entityId, details, ipAddress);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}

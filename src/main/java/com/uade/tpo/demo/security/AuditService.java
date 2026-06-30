package com.uade.tpo.demo.security;

import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.SessionAuditLog;
import com.uade.tpo.demo.entity.enums.AuditEventType;
import com.uade.tpo.demo.repository.SessionAuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {

    private final SessionAuditLogRepository sessionAuditLogRepository;
    private final HttpServletRequest request;

    public void logEvent(AuditEventType type, Long userId, String usernameAttempted, boolean success, String details) {
        try {
            String ipAddress = resolveIpAddress();
            String userAgent = request.getHeader("User-Agent");

            SessionAuditLog entry = SessionAuditLog.builder()
                    .userId(userId)
                    .usernameAttempted(usernameAttempted)
                    .eventType(type)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .success(success)
                    .details(details)
                    .build();

            sessionAuditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("No se pudo registrar el evento de auditoria: {}", e.getMessage());
        }
    }

    private String resolveIpAddress() {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isBlank()) {
                return first;
            }
        }
        return request.getRemoteAddr();
    }
}

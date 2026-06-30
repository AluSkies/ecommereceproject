package com.uade.tpo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.demo.entity.SessionAuditLog;

public interface SessionAuditLogRepository extends JpaRepository<SessionAuditLog, Long> {

    List<SessionAuditLog> findByUserIdOrderByTimestampDesc(Long userId);
}

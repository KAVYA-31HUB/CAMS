package com.examly.springapp.controller;

import com.examly.springapp.dto.DashboardStatsDto;
import com.examly.springapp.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportingService reportingService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(reportingService.getDashboardStats());
    }

    @GetMapping("/funnel")
    public ResponseEntity<Map<String, Object>> getFunnelReport() {
        return ResponseEntity.ok(reportingService.getFunnelReport());
    }

    @GetMapping("/aishe")
    public ResponseEntity<List<Map<String, Object>>> getAisheReport() {
        return ResponseEntity.ok(reportingService.getAisheReport());
    }

    @GetMapping("/ugc")
    public ResponseEntity<List<Map<String, Object>>> getUgcReport() {
        return ResponseEntity.ok(reportingService.getUgcReport());
    }
}

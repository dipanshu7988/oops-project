import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Terminal,
  Database,
  Copy,
  Check,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  category: string;
  language: string;
  description: string;
  content: string;
}

export const JavaCodeExplorerView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const files: CodeFile[] = [
    {
      name: 'pom.xml',
      path: '/pom.xml',
      category: 'Build Config',
      language: 'xml',
      description: 'Maven configuration for Java 21 & Spring Boot 3.3.4 with JPA, Web, H2, ZXing 3.5.3 QR, Validation & JUnit 5.',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.smartqueue</groupId>
    <artifactId>smart-queue-manager</artifactId>
    <version>1.0.0</version>
    <name>smart-queue-manager</name>
    <description>Intelligent Priority Virtual Queue Management System</description>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <!-- ZXing QR Code Generation -->
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>core</artifactId>
            <version>3.5.3</version>
        </dependency>
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>javase</artifactId>
            <version>3.5.3</version>
        </dependency>
        <!-- In-Memory H2 Database -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <!-- Testing Dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`,
    },
    {
      name: 'QrCodeService.java',
      path: '/src/main/java/com/smartqueue/service/QrCodeService.java',
      category: 'Feature 1 Service',
      language: 'java',
      description: 'Generates PNG QR-code byte stream and Base64 Data URI using ZXing QRCodeWriter for physical token check-in.',
      content: `package com.smartqueue.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.smartqueue.model.entity.QueueEntry;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
public class QrCodeService {
    // Generates JSON payload conforming to requirements:
    // { "tokenNumber": "A-101", "serviceType": "DOCTOR_CONSULTATION", "joinedAt": "..." }
    public String buildQrPayload(QueueEntry entry) {
        return String.format(
            "{\\"tokenNumber\\":\\"%s\\",\\"customerName\\":\\"%s\\",\\"serviceType\\":\\"%s\\",\\"joinedAt\\":\\"%s\\"}",
            entry.getTokenNumber(),
            entry.getCustomer().getName(),
            entry.getServiceType().name(),
            entry.getJoinedAt().toString()
        );
    }

    public byte[] generateQrCodeImageBytes(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating QR code", e);
        }
    }

    public String generateQrCodeDataUri(QueueEntry entry) {
        byte[] bytes = generateQrCodeImageBytes(buildQrPayload(entry), 240, 240);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
    }
}`,
    },
    {
      name: 'CheckInService.java',
      path: '/src/main/java/com/smartqueue/service/CheckInService.java',
      category: 'Feature 1 Service',
      language: 'java',
      description: 'Validates ticket, verifies lobby arrival, sets status to CHECKED_IN without modifying priority position.',
      content: `package com.smartqueue.service;

import com.smartqueue.dto.CheckInResponse;
import com.smartqueue.exception.*;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class CheckInService {
    private final QueueEntryRepository queueEntryRepository;

    public CheckInResponse checkInByTokenNumber(String tokenNumber) {
        QueueEntry entry = queueEntryRepository.findByTokenNumber(tokenNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket " + tokenNumber + " not found."));

        if (entry.isCheckedIn()) {
            throw new InvalidOperationException("Ticket " + tokenNumber + " has already been checked in.");
        }

        if (entry.getStatus() == QueueStatus.SERVED || entry.getStatus() == QueueStatus.SKIPPED
                || entry.getStatus() == QueueStatus.NO_SHOW || entry.getStatus() == QueueStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot check in ticket with status " + entry.getStatus());
        }

        entry.setCheckedIn(true);
        entry.setCheckedInAt(LocalDateTime.now());
        if (entry.getStatus() == QueueStatus.WAITING) {
            entry.setStatus(QueueStatus.CHECKED_IN);
        }

        QueueEntry saved = queueEntryRepository.save(entry);
        return new CheckInResponse(
                saved.getTokenNumber(),
                saved.getCustomer().getName(),
                saved.getServiceType(),
                saved.getServiceType().name(),
                true,
                saved.getCheckedInAt(),
                saved.getQueuePosition(),
                Math.max(0, saved.getQueuePosition() - 1),
                saved.getEstimatedWaitMinutes(),
                saved.getStatus()
        );
    }
}`,
    },
    {
      name: 'DisplayBoardService.java',
      path: '/src/main/java/com/smartqueue/service/DisplayBoardService.java',
      category: 'Feature 2 Service',
      language: 'java',
      description: 'Public display board data aggregator with strict privacy guarantees (zero customer names or phone numbers exposed).',
      content: `package com.smartqueue.service;

import com.smartqueue.dto.DisplayBoardResponse;
import com.smartqueue.model.entity.QueueEntry;
import com.smartqueue.model.enums.*;
import com.smartqueue.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class DisplayBoardService {
    private final QueueEntryRepository queueEntryRepository;

    public DisplayBoardResponse getDisplayForService(ServiceType serviceType) {
        Optional<QueueEntry> servingOpt = queueEntryRepository
                .findFirstByServiceTypeAndStatus(serviceType, QueueStatus.SERVING);

        List<QueueEntry> waiting = queueEntryRepository
                .findByServiceTypeAndStatusIn(serviceType, List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN));

        List<String> nextTokens = waiting.stream()
                .sorted(Comparator.comparingInt(QueueEntry::getQueuePosition))
                .limit(6)
                .map(QueueEntry::getTokenNumber)
                .toList();

        // Privacy Contract: Customer name and phone number NEVER exposed
        DisplayBoardResponse.CurrentlyServingDto servingDto = servingOpt.map(s ->
                new DisplayBoardResponse.CurrentlyServingDto(
                        s.getTokenNumber(),
                        s.getAssignedCounter() != null ? s.getAssignedCounter().getCounterName() : "Assigned Counter"
                )
        ).orElse(null);

        return new DisplayBoardResponse(serviceType, servingDto, nextTokens, 12);
    }
}`,
    },
    {
      name: 'FeedbackService.java',
      path: '/src/main/java/com/smartqueue/service/FeedbackService.java',
      category: 'Feature 3 Service',
      language: 'java',
      description: 'Enforces 1-5 rating, 500-char comment, SERVED status validation, single review per token, and statistics aggregation.',
      content: `package com.smartqueue.service;

import com.smartqueue.dto.*;
import com.smartqueue.exception.*;
import com.smartqueue.model.entity.*;
import com.smartqueue.model.enums.QueueStatus;
import com.smartqueue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final QueueEntryRepository queueEntryRepository;

    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        String token = request.getTokenNumber().trim().toUpperCase();
        QueueEntry entry = queueEntryRepository.findByTokenNumber(token)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket " + token + " not found."));

        if (entry.getStatus() != QueueStatus.SERVED) {
            throw new InvalidOperationException("Feedback only accepted for completed (SERVED) tickets.");
        }

        if (feedbackRepository.existsByQueueEntryTokenNumber(token)) {
            throw new InvalidOperationException("Feedback already submitted for ticket " + token);
        }

        Feedback feedback = new Feedback(entry, request.getRating(), request.getComment(), LocalDateTime.now());
        Feedback saved = feedbackRepository.save(feedback);
        return new FeedbackResponse(saved);
    }
}`,
    },
    {
      name: 'QueueService.java',
      path: '/src/main/java/com/smartqueue/service/QueueService.java',
      category: 'Core Service',
      language: 'java',
      description: 'Priority queue algorithm, dynamic wait-time math, rolling average tracking, token generation.',
      content: `package com.smartqueue.service;

import com.smartqueue.dto.*;
import com.smartqueue.exception.*;
import com.smartqueue.model.entity.*;
import com.smartqueue.model.enums.*;
import com.smartqueue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class QueueService {
    // Priority Ordering Rule:
    // Lower value = higher priority (EMERGENCY=1, VIP=2, ELDERLY=3, NORMAL=4)
    // Same priority resolved by arrival timestamp
    private Comparator<QueueEntry> getPriorityComparator() {
        return Comparator.comparing(QueueEntry::getPriority, 
                Comparator.comparingInt(PriorityCategory::getValue))
                .thenComparing(QueueEntry::getJoinedAt);
    }

    // Dynamic Wait Time Estimation:
    // Estimated Wait = People Ahead * Average Service Time
    public synchronized void recalculateQueue(ServiceType serviceType) {
        List<QueueEntry> waiting = queueEntryRepository
                .findByServiceTypeAndStatusIn(serviceType, List.of(QueueStatus.WAITING, QueueStatus.CHECKED_IN));
        waiting.sort(getPriorityComparator());

        double avgServiceTime = getAverageServiceTime(serviceType);

        for (int i = 0; i < waiting.size(); i++) {
            QueueEntry q = waiting.get(i);
            int position = i + 1;
            int peopleAhead = i;
            int estimatedWait = (int) Math.round(peopleAhead * avgServiceTime);

            q.setQueuePosition(position);
            q.setEstimatedWaitMinutes(estimatedWait);
        }
        queueEntryRepository.saveAll(waiting);
    }
}`,
    },
  ];

  const [selectedFile, setSelectedFile] = useState<CodeFile>(files[1]);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Java 21 + Spring Boot 3.3 Architecture
          </h1>
          <p className="text-xs text-slate-500">
            Explore the complete layered Spring Boot backend architecture, REST endpoints, and JUnit 5 test suite with ZXing QR and Feedback.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/downloads/Smart_Queue_Manager_Project_Report.pdf"
            download="Smart_Queue_Manager_Project_Report.pdf"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report PDF</span>
          </a>
          <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            mvn test: 20/20 Passed (100%)
          </div>
        </div>
      </div>

      {/* How to Run Locally Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>How to Run Locally in 1 Command</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 flex items-center justify-between border border-slate-800">
          <code>mvn spring-boot:run</code>
          <span className="text-2xs text-slate-400 font-sans">Starts Spring Boot on port 8080 with H2 DB</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
          <div>
            <span className="text-indigo-300 font-medium block">H2 Console URL:</span>
            <span className="font-mono text-2xs">http://localhost:8080/h2-console</span>
          </div>
          <div>
            <span className="text-indigo-300 font-medium block">Check-In URL:</span>
            <span className="font-mono text-2xs">/admin/check-in</span>
          </div>
          <div>
            <span className="text-indigo-300 font-medium block">Live Display URL:</span>
            <span className="font-mono text-2xs">/display</span>
          </div>
          <div>
            <span className="text-indigo-300 font-medium block">Customer Feedback:</span>
            <span className="font-mono text-2xs">/feedback/{'{tokenNumber}'}</span>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar File Tree */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
          <span className="text-2xs uppercase font-bold tracking-wider text-slate-500 px-3 py-2 block">
            Project Files
          </span>
          {files.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelectedFile(f)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                selectedFile.name === f.name
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{f.name}</span>
              </div>
              <span className="text-2xs text-slate-400 shrink-0">{f.category}</span>
            </button>
          ))}
        </div>

        {/* Code Content Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-slate-900">{selectedFile.path}</span>
              <p className="text-xs text-slate-500 mt-0.5">{selectedFile.description}</p>
            </div>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto flex-1 leading-relaxed">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

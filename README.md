# Smart Queue Manager

An intelligent, priority-aware virtual queue management system built for high-throughput service environments such as college canteens, outpatient clinics, university registrar desks, bank counters, and service offices.

Built with **Java 21**, **Spring Boot 3.3.4**, **Spring Data JPA**, **H2 Database**, **ZXing QR Engine**, and a modern responsive web client.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [New Enhancements (Features 1, 2, 3)](#-new-enhancements)
  - [1. QR Token Check-In](#1-qr-token-check-in)
  - [2. Live Queue Display Board](#2-live-queue-display-board)
  - [3. Customer Feedback Rating](#3-customer-feedback-rating)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Priority Queue Logic](#-priority-queue-logic)
- [Dynamic Waiting-Time Estimation](#-dynamic-waiting-time-estimation)
- [Rule-Based No-Show Risk Prediction](#-rule-based-no-show-risk-prediction)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [H2 In-Memory Database Console](#-h2-in-memory-database-console)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 🎯 Project Overview

In busy service settings, physical lines cause crowding, customer frustration, and inefficient counter utilization. **Smart Queue Manager** solves this with a virtual token ticketing pipeline that:
1. Segregates traffic into dedicated, independent service queues.
2. Orders waiting customers by a strict multi-tier priority model (Emergency > VIP > Elderly > Normal).
3. Automatically computes live queue positions and real-time estimated waiting times using actual rolling service durations.
4. Generates unique digital QR tokens that can be scanned for physical check-in at the lobby.
5. Projects a high-visibility, privacy-compliant "Now Serving" public display board for waiting hall TVs.
6. Collects 1-to-5 star customer ratings and suggestions after consultations to measure service quality.
7. Alerts administrators with a rule-based **No-Show Risk Indicator** (Low, Medium, High) based on customer history, preventing idle counter time while preserving human control.
8. Provides an administrative control deck for serving, completing, skipping, or cancelling tickets, as well as managing physical counters.

---

## ✨ Key Features

### 1. Customer Kiosk
- Select service type: **Food Order**, **Doctor Consultation**, **Document Verification**, **Payment Counter**.
- Register with Name, 10–15 digit Phone Number, Service, and Priority Category.
- Receive an alphanumeric token (e.g. `D-101`, `F-102`) with an embedded unique QR code.
- Prevents duplicate active tickets for the same customer in the same service.

### 2. Live Token Tracker & Confirmation
- Real-time display of **Token Number**, **People Ahead**, **Estimated Waiting Time**, **Assigned Counter**, and **Priority Status**.
- Download QR code image to device gallery.
- Real-time check-in status badge (`Checked In` / `Not Checked In`).
- Direct link to leave 1-to-5 star feedback once marked as `SERVED`.

---

## 🌟 New Enhancements

### 1. QR Token Check-In
When a customer joins the queue, the backend generates a ZXing QR Code image containing:
```json
{
  "tokenNumber": "A-101",
  "customerName": "John Doe",
  "serviceType": "DOCTOR_CONSULTATION",
  "joinedAt": "2026-11-12T10:30:00"
}
```

- **ZXing QR Code Generator:** Uses `com.google.zxing:core:3.5.3` and `javase:3.5.3` to render clean PNG byte streams and Base64 data URIs.
- **Dedicated Staff Portal (`/admin/check-in`):**
  - Manual token number input.
  - Optical camera scanner simulation for reading customer screens.
  - Quick-action buttons to verify and check in physical arrivals with 1 click.
- **Queue Status `CHECKED_IN`:**
  - Preserves the customer's exact priority position (does not jump line or auto-serve).
  - Displays check-in time on the admin console.
  - Displays distinct `Checked In` / `Not Checked In` badges next to waiting tickets.
- **Admin Warning for Missing Arrivals:**
  - If a customer is in position 1 or 2 and has not checked in physically (`!checkedIn`), the admin console displays:
    > "Warning: Customer has not checked in yet."

### 2. Live Queue Display Board (`/display`)
A dedicated high-visibility public display view designed for waiting area televisions, monitors, or projectors:
- **Large, High-Contrast Typography:** Readable from a distance across crowded halls.
- **5-to-10 Second Polling:** Auto-refreshes silently without page reloading.
- **Strict Privacy Guarantee:** Does **not** display customer names, phone numbers, or history. Only tokens and counters appear.
- **Service Section Tabs:** View all counters or filter by Food Order, Doctor Consultation, Document Verification, or Payment Counter.
- **Now Serving Callout:** Prominently highlights the currently called token and counter name.
- **Animated Guidance Banner:**
  > "Please proceed to the assigned counter."
- **Fallback Callout:** When no customer is active:
  > "No customer is currently being served."
- **Audio Chime:** Synthetic Web Audio ding-dong notification when new tokens are called.

### 3. Customer Feedback Rating (`/feedback/{tokenNumber}`)
After a ticket is marked `SERVED`, customers can rate their counter experience:
- **1 to 5 Star Rating:** Interactive visual star selector with qualitative descriptions.
- **Optional Comments:** Up to 500 characters with live character counter.
- **Strict Business Validation:**
  - Feedback is accepted **only** for tickets in `SERVED` status.
  - Enforces exactly **one** feedback submission per token.
- **Admin Analytics Deck:**
  - Average satisfaction rating (e.g. `4.7 / 5.0`).
  - Rating distribution breakdown across 5★, 4★, 3★, 2★, and 1★.
  - Real-time list of recent customer reviews and comments.

---

## 🛠 Technology Stack

- **Language:** Java 21 (LTS)
- **Framework:** Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Validation)
- **QR Code Engine:** ZXing (Zebra Crossing) 3.5.3 (`com.google.zxing:core` and `javase`)
- **Database:** H2 In-Memory Database (zero external setup required)
- **Testing:** JUnit 5, Mockito, Spring Boot Starter Test (20/20 automated tests passing)
- **Build Tool:** Apache Maven 3.8+
- **Frontend:** Responsive React SPA + Tailwind CSS + Lucide Icons (with embedded Java Architecture Explorer)

---

## 🏛 System Architecture

The Java codebase strictly adheres to clean layered enterprise architecture:

```text
smart-queue-manager/
├── pom.xml
├── README.md
├── src/
│   ├── main/
│   │   ├── java/com/smartqueue/
│   │   │   ├── SmartQueueApplication.java       # Spring Boot main entry
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java              # Cross-origin API policies
│   │   │   │   └── DataInitializer.java         # Seed counters, demo tickets & initial reviews
│   │   │   ├── controller/
│   │   │   │   ├── QueueRestController.java     # Customer & queue actions endpoints
│   │   │   │   ├── AdminRestController.java     # Admin console, stats, and counters
│   │   │   │   ├── CheckInRestController.java   # /api/queue/{tokenNumber}/check-in & QR
│   │   │   │   ├── DisplayRestController.java   # /api/display public board APIs
│   │   │   │   └── FeedbackRestController.java  # /api/feedback rating endpoints
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java             # Standard JSON API envelope
│   │   │   │   ├── JoinQueueRequest.java        # Validated customer input
│   │   │   │   ├── CheckInResponse.java         # Check-in confirmation payload
│   │   │   │   ├── DisplayBoardResponse.java    # Privacy-safe TV display payload
│   │   │   │   ├── FeedbackRequest.java         # 1-5 star rating & comment validation
│   │   │   │   ├── FeedbackResponse.java        # Feedback confirmation payload
│   │   │   │   ├── FeedbackStatisticsResponse.java # Aggregated rating distribution
│   │   │   │   ├── QueueEntryResponse.java      # Comprehensive queue ticket payload
│   │   │   │   ├── CustomerStatusResponse.java  # Concise customer card payload
│   │   │   │   └── DailyStatisticsResponse.java # Aggregated metrics
│   │   │   ├── exception/
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── DuplicateQueueException.java
│   │   │   │   ├── InvalidOperationException.java
│   │   │   │   └── GlobalExceptionHandler.java  # RestControllerAdvice error handler
│   │   │   ├── model/
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Customer.java            # Visits and no-show history
│   │   │   │   │   ├── QueueEntry.java          # Live queue tickets with checkedIn & qrCodePath
│   │   │   │   │   ├── Feedback.java            # 1-5 star ratings & comments
│   │   │   │   │   ├── ServiceCounter.java      # Physical/virtual service desks
│   │   │   │   │   └── QueueHistory.java        # Completed ticket audit logs
│   │   │   │   └── enums/
│   │   │   │       ├── ServiceType.java         # FO, DC, DV, PC
│   │   │   │       ├── PriorityCategory.java    # EMERGENCY (1) to NORMAL (4)
│   │   │   │       ├── QueueStatus.java         # WAITING, CHECKED_IN, SERVING, etc.
│   │   │   │       └── NoShowRisk.java          # LOW, MEDIUM, HIGH
│   │   │   ├── repository/
│   │   │   │   ├── CustomerRepository.java
│   │   │   │   ├── QueueEntryRepository.java
│   │   │   │   ├── FeedbackRepository.java
│   │   │   │   ├── ServiceCounterRepository.java
│   │   │   │   └── QueueHistoryRepository.java
│   │   │   └── service/
│   │   │       ├── QrCodeService.java           # ZXing QR image generation
│   │   │       ├── CheckInService.java          # Physical check-in validation
│   │   │       ├── DisplayBoardService.java     # TV display board privacy aggregation
│   │   │       ├── FeedbackService.java         # Review validation & rating metrics
│   │   │       ├── CustomerService.java         # No-show risk scoring logic
│   │   │       ├── CounterService.java          # Counter desk lifecycle
│   │   │       ├── QueueService.java            # Priority sorting & wait time math
│   │   │       └── StatisticsService.java       # Daily analytics & reset day
│   │   └── resources/
│   │       └── application.properties           # Server port & H2 config
│   └── test/
│       └── java/com/smartqueue/
│           ├── SmartQueueIntegrationTest.java   # Full end-to-end integration test
│           └── service/
│               ├── QrCodeServiceTest.java       # QR PNG byte stream & payload tests
│               ├── CheckInServiceTest.java      # Check-in validation & state tests
│               ├── DisplayBoardServiceTest.java # TV privacy contract tests
│               ├── FeedbackServiceTest.java     # Rating bounds & duplicate guards
│               ├── CustomerServiceTest.java     # Unit tests for risk rules
│               ├── QueueServiceTest.java        # Unit tests for priority & wait time
│               └── StatisticsServiceTest.java   # Unit tests for daily metrics
```

---

## ⚖️ Priority Queue Logic

Queue ordering is implemented via multi-level comparative ordering:

| Priority Category | Value | Precedence |
|---|:---:|---|
| **Emergency** | `1` | Served first immediately (medical emergency, critical desk) |
| **VIP** | `2` | Served after emergencies (faculty, priority cardholders) |
| **Elderly / Senior** | `3` | Served after VIP (accessibility priority) |
| **Normal** | `4` | Standard FIFO queue |

### Resolution Rules
1. **Lower value means higher priority** (`EMERGENCY: 1` < `VIP: 2` < `ELDERLY: 3` < `NORMAL: 4`).
2. If two customers hold the identical priority tier, the **earlier arrival timestamp (`joinedAt`) is served first**.
3. Physical check-in confirms lobby presence, but **preserves original priority position**.
4. Each service type operates an **independent FIFO priority line**.

---

## ⏱ Dynamic Waiting-Time Estimation

Estimated waiting time is calculated using:

$$\text{Estimated Wait (minutes)} = \text{People Ahead} \times \text{Average Service Time}$$

- **Default Average Service Time:** `3 minutes`.
- **Adaptive Rolling Average:** When a staff member marks a ticket as `SERVED`, actual service duration is recorded in `QueueHistory`, updating the rolling average for that department.
- **Immediate Recalculation:** All waiting customers in that queue recalculate their estimated wait time immediately.

---

## 🔍 Rule-Based No-Show Risk Prediction

- **HIGH Risk:** $\ge 2$ past no-shows (`totalNoShows >= 2`).
  - *Admin Alert:* Prominent red warning banner:
    > "Warning: This customer has a high chance of not arriving."
- **MEDIUM Risk:** Exactly 1 past no-show (`totalNoShows == 1`).
- **LOW Risk:** 0 past no-shows (`totalNoShows == 0`).

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Java 21** or later (`java -version`)
- **Apache Maven 3.8+** (`mvn -v`)

### Run Application
From the project root:

```bash
mvn spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

### Run Test Suite
To execute all 20 automated unit and integration tests:

```bash
mvn clean test
```

---

## 🗄 H2 In-Memory Database Console

Spring Boot includes an embedded web console for inspecting database tables:

1. Open your browser to: **`http://localhost:8080/h2-console`**
2. Parameters:
   - **JDBC URL:** `jdbc:h2:mem:smartqueuedb`
   - **User Name:** `sa`
   - **Password:** *(leave blank)*
3. Tables available: `CUSTOMERS`, `QUEUE_ENTRIES`, `FEEDBACK`, `SERVICE_COUNTERS`, `QUEUE_HISTORIES`.

---

## 📡 REST API Reference

### Check-In Operations (Feature 1)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/queue/{tokenNumber}/qr` | Returns ZXing QR code image PNG bytes |
| `POST` | `/api/queue/{tokenNumber}/check-in` | Validates ticket and marks physical arrival (`CHECKED_IN`) |
| `GET` | `/api/admin/check-in-status` | Returns check-in status of all active tickets |

### Live Display Board Operations (Feature 2)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/display/current` | Returns currently serving token & counter per service (privacy-safe) |
| `GET` | `/api/display/next` | Returns next upcoming tokens in waiting line |
| `GET` | `/api/display/service/{serviceType}` | Returns complete display payload for a specific department |

### Customer Feedback Operations (Feature 3)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/feedback` | Submit 1–5 star rating and comment for a `SERVED` token |
| `GET` | `/api/feedback/{tokenNumber}` | Retrieve feedback submitted for a specific token |
| `GET` | `/api/admin/feedback/statistics` | Returns average rating and star distribution breakdown |
| `GET` | `/api/admin/feedback/recent` | Returns 20 most recent customer reviews |

### Core Queue Operations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/queue/join` | Join a queue with customer name, phone, service, and priority |
| `GET` | `/api/queue/token/{tokenNumber}` | Get full details of a specific ticket |
| `POST` | `/api/queue/{tokenNumber}/serve?counterId={id}` | Start serving a waiting ticket |
| `POST` | `/api/queue/{tokenNumber}/complete` | Mark serving ticket as completed |
| `POST` | `/api/queue/{tokenNumber}/skip` | Mark ticket as skipped |
| `POST` | `/api/queue/{tokenNumber}/no-show` | Record no-show and update customer risk |
| `POST` | `/api/queue/{tokenNumber}/cancel` | Cancel waiting ticket |

---

## 🧪 Testing & Quality Assurance

The project includes 20 automated tests:
1. **`QrCodeServiceTest` (2 tests):** Confirms ZXing PNG generation and JSON QR payload structure.
2. **`CheckInServiceTest` (3 tests):** Validates check-in by token, duplicate prevention, and terminal status rejection.
3. **`DisplayBoardServiceTest` (1 test):** Validates privacy-safe TV payloads without names/phones.
4. **`FeedbackServiceTest` (5 tests):** Validates rating boundaries (1–5), comment limits (500 chars), `SERVED` status guards, and single-review constraints.
5. **`CustomerServiceTest` (4 tests):** Validates rule-based no-show risk calculations.
6. **`QueueServiceTest` (3 tests):** Validates multi-tier priority sorting, dynamic wait-time formulas, and duplicate ticket prevention.
7. **`StatisticsServiceTest` (1 test):** Validates daily metric aggregations and reset operations.
8. **`SmartQueueIntegrationTest` (1 test):** Full end-to-end integration test validating priority jumps, servicing, dynamic wait updates, and no-show risk elevation.

All 20 tests pass with **`BUILD SUCCESS`** (`mvn test`).

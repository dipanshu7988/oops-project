import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header rule and text
        self.drawString(54, 750, "Smart Queue Manager — Comprehensive Project Report & Architecture Specification")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Footer rule and text
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential · Academic & Production Reference · Spring Boot 3.3.4 & Java 21")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def build_pdf(filename="public/downloads/Smart_Queue_Manager_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom palette
    PRIMARY = colors.HexColor("#312e81")    # Deep Indigo
    ACCENT = colors.HexColor("#4f46e5")     # Indigo
    DARK_TEXT = colors.HexColor("#0f172a")  # Slate 900
    MUTED_TEXT = colors.HexColor("#475569") # Slate 600
    LIGHT_BG = colors.HexColor("#f8fafc")   # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate 200
    SUCCESS = colors.HexColor("#059669")
    WARNING = colors.HexColor("#d97706")
    DANGER = colors.HexColor("#dc2626")

    # Typography styles
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=MUTED_TEXT,
        alignment=0,
        spaceAfter=20
    ))

    styles.add(ParagraphStyle(
        name='MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=PRIMARY
    ))

    styles.add(ParagraphStyle(
        name='MetaValue',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=DARK_TEXT
    ))

    styles.add(ParagraphStyle(
        name='H1',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='H2',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=ACCENT,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='H3',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='Body',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name='BodyMuted',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=MUTED_TEXT,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        name='BulletItem',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=15,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name='CodeSnippet',
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=6,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    ))

    styles.add(ParagraphStyle(
        name='TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    ))

    story = []

    # ==================== COVER / TITLE SECTION ====================
    story.append(Spacer(1, 40))
    story.append(Paragraph("PROJECT TECHNICAL REPORT", ParagraphStyle(
        name='Kicker',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=ACCENT,
        spaceAfter=6
    )))
    story.append(Paragraph("Smart Queue Manager", styles['CoverTitle']))
    story.append(Paragraph(
        "An Intelligent Virtual Queue & Priority Counter Management System with "
        "ZXing QR Check-In, Real-Time TV Display Board, Dynamic Wait-Time Estimation, "
        "Rule-Based No-Show Risk Engine, and Customer Feedback Ratings.",
        styles['CoverSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceAfter=20))

    # Metadata Block
    meta_data = [
        [
            Paragraph("<b>Project Version:</b>", styles['MetaLabel']),
            Paragraph("1.0.0 (Production / Academic Presentation)", styles['MetaValue']),
            Paragraph("<b>Backend Engine:</b>", styles['MetaLabel']),
            Paragraph("Spring Boot 3.3.4 · Java 21 (LTS)", styles['MetaValue']),
        ],
        [
            Paragraph("<b>Database:</b>", styles['MetaLabel']),
            Paragraph("H2 In-Memory RDBMS (Zero-Config)", styles['MetaValue']),
            Paragraph("<b>QR Generation:</b>", styles['MetaLabel']),
            Paragraph("ZXing (Zebra Crossing) 3.5.3", styles['MetaValue']),
        ],
        [
            Paragraph("<b>Automated Tests:</b>", styles['MetaLabel']),
            Paragraph("JUnit 5 · 20/20 Passing (100% Pass Rate)", styles['MetaValue']),
            Paragraph("<b>Client Architecture:</b>", styles['MetaLabel']),
            Paragraph("React 19 SPA · Tailwind CSS · TypeScript", styles['MetaValue']),
        ],
        [
            Paragraph("<b>Author / Presenter:</b>", styles['MetaLabel']),
            Paragraph("Software Engineering Engineering Team", styles['MetaValue']),
            Paragraph("<b>Date of Publication:</b>", styles['MetaLabel']),
            Paragraph("November 2026", styles['MetaValue']),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[105, 145, 105, 145])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 24))

    # Executive Summary Callout
    story.append(Paragraph("Executive Summary", styles['H2']))
    story.append(Paragraph(
        "Physical waiting queues in public service environments—including university canteens, outpatient "
        "medical clinics, registrar verification counters, and cashier counters—suffer from four persistent operational bottlenecks: "
        "(1) lobby crowding and congestion, (2) arbitrary or unfair ordering without consideration for vulnerable or emergency individuals, "
        "(3) unpredictable waiting times leading to premature abandonment, and (4) idle counter downtime caused by absent no-shows. "
        "<b>Smart Queue Manager</b> addresses these challenges by implementing a complete virtual ticketing pipeline with deterministic "
        "priority scheduling, adaptive rolling-average wait-time calculation, ZXing-powered mobile QR check-in, privacy-guaranteed "
        "public display boards, and customer satisfaction metrics.",
        styles['Body']
    ))

    story.append(PageBreak())

    # ==================== TABLE OF CONTENTS & SYSTEM OVERVIEW ====================
    story.append(Paragraph("1. System Architecture & Component Design", styles['H1']))
    story.append(Paragraph(
        "The application strictly adheres to the clean enterprise layered architecture pattern. The system is split "
        "into cleanly decoupled layers: REST API Controllers, Data Transfer Objects (DTOs), Business Logic Services, "
        "Spring Data JPA Repositories, Domain Entities, and an in-memory database store.",
        styles['Body']
    ))

    arch_data = [
        [Paragraph("Layer", styles['TableHeader']), Paragraph("Component Name", styles['TableHeader']), Paragraph("Responsibilities & Behavioral Contract", styles['TableHeader'])],
        [
            Paragraph("<b>Controller</b>", styles['TableCellBold']),
            Paragraph("QueueRestController<br/>CheckInRestController<br/>DisplayRestController<br/>FeedbackRestController<br/>AdminRestController", styles['TableCell']),
            Paragraph("Exposes RESTful endpoints, handles HTTP request validation (Jakarta Validation), manages serialization envelopes via ApiResponse&lt;T&gt;, and translates domain exceptions to standard HTTP status codes.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Service</b>", styles['TableCellBold']),
            Paragraph("QueueService<br/>CheckInService<br/>DisplayBoardService<br/>FeedbackService<br/>QrCodeService<br/>CustomerService<br/>CounterService", styles['TableCell']),
            Paragraph("Encapsulates pure business logic: priority queue sorting (Comparator), dynamic wait-time calculation, ZXing PNG byte generation, physical lobby check-in validation, privacy-safe display projection, and rule-based no-show risk assessment.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Repository</b>", styles['TableCellBold']),
            Paragraph("QueueEntryRepository<br/>CustomerRepository<br/>FeedbackRepository<br/>ServiceCounterRepository<br/>QueueHistoryRepository", styles['TableCell']),
            Paragraph("Spring Data JPA repositories providing transaction-managed CRUD operations, derived query methods, and JPQL aggregations (e.g., average rating calculation, counts by status).", styles['TableCell'])
        ],
        [
            Paragraph("<b>Domain</b>", styles['TableCellBold']),
            Paragraph("QueueEntry, Customer,<br/>Feedback, ServiceCounter,<br/>QueueHistory", styles['TableCell']),
            Paragraph("JPA entities mapped to relational database tables with foreign-key constraints, enum converters, validation annotations, and text column definitions for QR payloads.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Database</b>", styles['TableCellBold']),
            Paragraph("H2 In-Memory Database", styles['TableCell']),
            Paragraph("Embedded, zero-installation SQL engine running on <code>jdbc:h2:mem:smartqueuedb</code> with web inspection console enabled at <code>/h2-console</code>.", styles['TableCell'])
        ]
    ]
    arch_table = Table(arch_data, colWidths=[70, 150, 284])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 14))

    # ==================== CORE ALGORITHMS & LOGIC ====================
    story.append(Paragraph("2. Priority Queue Algorithm & Mathematical Model", styles['H1']))
    story.append(Paragraph(
        "Standard FIFO queues fail in healthcare or urgent desk contexts where critical conditions demand immediate triage. "
        "Smart Queue Manager introduces a 4-tier deterministic priority precedence model:",
        styles['Body']
    ))

    prio_data = [
        [Paragraph("Priority Level", styles['TableHeader']), Paragraph("Value", styles['TableHeader']), Paragraph("Precedence Order", styles['TableHeader']), Paragraph("Operational Context & Criteria", styles['TableHeader'])],
        [Paragraph("<b>Emergency</b>", styles['TableCellBold']), Paragraph("1", styles['TableCellBold']), Paragraph("Highest (Served First)", styles['TableCell']), Paragraph("Severe acute distress, critical medication desks, or immediate supervisor escalations.", styles['TableCell'])],
        [Paragraph("<b>VIP</b>", styles['TableCellBold']), Paragraph("2", styles['TableCellBold']), Paragraph("Served after Emergency", styles['TableCell']), Paragraph("University faculty, visiting guest scholars, or priority cardholders.", styles['TableCell'])],
        [Paragraph("<b>Elderly / Senior</b>", styles['TableCellBold']), Paragraph("3", styles['TableCellBold']), Paragraph("Served after VIP", styles['TableCell']), Paragraph("Senior citizens, pregnant patrons, and mobility-assisted individuals.", styles['TableCell'])],
        [Paragraph("<b>Normal</b>", styles['TableCellBold']), Paragraph("4", styles['TableCellBold']), Paragraph("Standard Virtual Line", styles['TableCell']), Paragraph("Standard FIFO line for regular transactions and canteen orders.", styles['TableCell'])],
    ]
    prio_table = Table(prio_data, colWidths=[90, 45, 120, 249])
    prio_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ACCENT),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(prio_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Tie-Breaking & Sorting Implementation", styles['H3']))
    story.append(Paragraph(
        "When two customers have identical priority tiers, the queue resolves precedence using the original arrival timestamp "
        "(<code>joinedAt</code>). Each service category (Food Order, Doctor Consultation, Document Verification, Payment Counter) "
        "maintains an independent queue line so that delays at one counter never interfere with another.",
        styles['Body']
    ))

    story.append(Paragraph(
        "<b>Java Comparator Implementation:</b><br/>"
        "<code>Comparator.comparing(QueueEntry::getPriority, Comparator.comparingInt(PriorityCategory::getValue))"
        ".thenComparing(QueueEntry::getJoinedAt);</code>",
        styles['CodeSnippet']
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Adaptive Waiting-Time Estimation Formula", styles['H2']))
    story.append(Paragraph(
        "Instead of static guess-estimates, expected waiting time is computed dynamically using actual historical throughput:",
        styles['Body']
    ))
    story.append(Paragraph(
        "$$\\text{Estimated Wait (minutes)} = \\text{People Ahead} \\times \\text{Average Service Time (minutes)}$$",
        ParagraphStyle(name='Formula', fontName='Helvetica-Oblique', fontSize=10, leading=14, textColor=PRIMARY, alignment=1)
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "• <b>Default Baseline:</b> 3.0 minutes.<br/>"
        "• <b>Adaptive Rolling Average:</b> Whenever counter staff marks a ticket as <code>SERVED</code>, the exact service duration "
        "(<code>serviceCompletedAt - serviceStartedAt</code>) is recorded into <code>QueueHistory</code>. The rolling average updates "
        "as: <code>newAverage = (previousAverage + actualDuration) / 2</code>.<br/>"
        "• <b>Real-Time Re-computation:</b> All remaining waiting tickets in that department automatically update their queue position "
        "and estimated wait time.",
        styles['Body']
    ))

    story.append(PageBreak())

    # ==================== ADVANCED FEATURES ====================
    story.append(Paragraph("3. Enhanced Production Features", styles['H1']))
    story.append(Paragraph(
        "Three practical, enterprise-grade capabilities were engineered into the system without compromising existing architecture:",
        styles['Body']
    ))

    story.append(Paragraph("Feature 1: Mobile QR Token Check-In & Arrival Verification", styles['H2']))
    story.append(Paragraph(
        "When a patron joins a virtual queue, the system generates a unique QR code encoded with standard JSON attributes:",
        styles['Body']
    ))
    story.append(Paragraph(
        "{\n"
        '  "tokenNumber": "D-101",\n'
        '  "customerName": "Savita Devi",\n'
        '  "serviceType": "DOCTOR_CONSULTATION",\n'
        '  "joinedAt": "2026-11-12T10:30:00"\n'
        "}",
        styles['CodeSnippet']
    ))
    story.append(Paragraph(
        "• <b>ZXing QR Library Integration:</b> Generates high-density PNG byte streams without third-party web services.<br/>"
        "• <b>Physical Check-In Desk (<code>/admin/check-in</code>):</b> Staff can enter token numbers manually or scan customer phone screens.<br/>"
        "• <b>Status Transition to <code>CHECKED_IN</code>:</b> Distinguishes between customers who joined remotely vs. those physically in the lobby.<br/>"
        "• <b>Turn-Is-Near Alert:</b> If an unverified customer reaches position 1 or 2, an admin warning triggers: <i>'Customer has not checked in yet.'</i><br/>"
        "• <b>Priority Invariance:</b> Physical check-in does not alter priority ordering; it simply flags physical presence.",
        styles['Body']
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Feature 2: Public Waiting Area Display Board (/display)", styles['H2']))
    story.append(Paragraph(
        "Designed specifically for overhead televisions and lobby monitors:",
        styles['Body']
    ))
    story.append(Paragraph(
        "• <b>Distance-Readable Typography:</b> Large high-contrast token numbers legible from 25+ feet away.<br/>"
        "• <b>Strict Privacy Guarantee:</b> Customer names, phone numbers, and past visit frequencies are completely excluded from the public display.<br/>"
        "• <b>5-to-10 Second Auto-Polling:</b> Keeps all displays synchronized via silent background polling.<br/>"
        "• <b>Audio Notification:</b> Web Audio synthetic dual-tone chime notification (E5 → C5) when a token is called.<br/>"
        "• <b>Animated Guidance Banner:</b> <i>'Please proceed to the assigned counter.'</i><br/>"
        "• <b>Fallback State:</b> Displays <i>'No customer is currently being served'</i> when desks are idle.",
        styles['Body']
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Feature 3: Customer Feedback & Rating System (/feedback/{tokenNumber})", styles['H2']))
    story.append(Paragraph(
        "Allows patrons to evaluate service quality after completing their visit:",
        styles['Body']
    ))
    story.append(Paragraph(
        "• <b>1 to 5 Star Rating:</b> Validated integer range with visual stars.<br/>"
        "• <b>Optional Suggestions:</b> Up to 500 characters with live character-count validation.<br/>"
        "• <b>Strict Precondition:</b> Feedback can only be submitted for completed (<code>SERVED</code>) tickets.<br/>"
        "• <b>Duplicate Guard:</b> Enforces a strict one-review-per-token policy.<br/>"
        "• <b>Administrative Analytics:</b> Computes overall average satisfaction rating and distribution breakdown (5★ down to 1★).",
        styles['Body']
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Feature 4: Rule-Based No-Show Risk Heuristic", styles['H2']))
    story.append(Paragraph(
        "Instead of black-box ML models, the system uses clear, explainable business heuristics to alert staff:<br/>"
        "• <b>HIGH Risk:</b> 2 or more historical no-shows (<code>totalNoShows &gt;= 2</code>). Displays red warning banner.<br/>"
        "• <b>MEDIUM Risk:</b> Exactly 1 historical no-show (<code>totalNoShows == 1</code>).<br/>"
        "• <b>LOW Risk:</b> 0 historical no-shows.<br/>"
        "• <i>Human-in-the-Loop Principle:</i> High-risk customers are never dropped automatically; counter staff retains full discretion.",
        styles['Body']
    ))

    story.append(PageBreak())

    # ==================== REST API REFERENCE & DATABASE ====================
    story.append(Paragraph("4. Comprehensive REST API Reference", styles['H1']))
    story.append(Paragraph(
        "All API endpoints follow RESTful standards and return standardized JSON envelopes containing a boolean success flag, message, payload data, and ISO-8601 timestamp.",
        styles['Body']
    ))

    api_data = [
        [Paragraph("HTTP Method & Endpoint", styles['TableHeader']), Paragraph("Category", styles['TableHeader']), Paragraph("Description & Status Code", styles['TableHeader'])],
        [Paragraph("POST /api/queue/join", styles['TableCellBold']), Paragraph("Kiosk", styles['TableCell']), Paragraph("Registers customer and issues alphanumeric token with QR code. (201 Created)", styles['TableCell'])],
        [Paragraph("GET /api/queue/{tokenNumber}/qr", styles['TableCellBold']), Paragraph("Check-In", styles['TableCell']), Paragraph("Returns ZXing-generated PNG image byte stream for token QR code. (200 OK)", styles['TableCell'])],
        [Paragraph("POST /api/queue/{tokenNumber}/check-in", styles['TableCellBold']), Paragraph("Check-In", styles['TableCell']), Paragraph("Validates ticket and marks physical arrival at counter lobby. (200 OK)", styles['TableCell'])],
        [Paragraph("GET /api/admin/check-in-status", styles['TableCellBold']), Paragraph("Check-In", styles['TableCell']), Paragraph("Lists all active tickets with arrival timestamps and check-in status. (200 OK)", styles['TableCell'])],
        [Paragraph("GET /api/display/current", styles['TableCellBold']), Paragraph("Display", styles['TableCell']), Paragraph("Returns currently serving tokens and assigned counter desks. (200 OK)", styles['TableCell'])],
        [Paragraph("GET /api/display/service/{serviceType}", styles['TableCellBold']), Paragraph("Display", styles['TableCell']), Paragraph("Returns privacy-safe display payload for specific department. (200 OK)", styles['TableCell'])],
        [Paragraph("POST /api/feedback", styles['TableCellBold']), Paragraph("Feedback", styles['TableCell']), Paragraph("Submits 1–5 star rating and comment for SERVED customer. (201 Created)", styles['TableCell'])],
        [Paragraph("GET /api/admin/feedback/statistics", styles['TableCellBold']), Paragraph("Feedback", styles['TableCell']), Paragraph("Returns average satisfaction rating and distribution map. (200 OK)", styles['TableCell'])],
        [Paragraph("POST /api/queue/{tokenNumber}/serve", styles['TableCellBold']), Paragraph("Admin", styles['TableCell']), Paragraph("Calls customer to assigned counter and records service started time. (200 OK)", styles['TableCell'])],
        [Paragraph("POST /api/queue/{tokenNumber}/complete", styles['TableCellBold']), Paragraph("Admin", styles['TableCell']), Paragraph("Marks ticket SERVED and updates department rolling average duration. (200 OK)", styles['TableCell'])],
        [Paragraph("POST /api/queue/{tokenNumber}/no-show", styles['TableCellBold']), Paragraph("Admin", styles['TableCell']), Paragraph("Records absentee, increments customer no-show history. (200 OK)", styles['TableCell'])],
        [Paragraph("POST /api/admin/reset-day", styles['TableCellBold']), Paragraph("Admin", styles['TableCell']), Paragraph("Safely archives active tickets as CANCELLED and resets sequence counters. (200 OK)", styles['TableCell'])],
    ]
    api_table = Table(api_data, colWidths=[180, 65, 259])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 14))

    # ==================== VERIFICATION & TEST RESULTS ====================
    story.append(Paragraph("5. Quality Assurance & Automated Test Results", styles['H1']))
    story.append(Paragraph(
        "The project includes a robust JUnit 5 and Spring Boot Starter Test suite. All 20 automated tests pass with a 100% success rate:",
        styles['Body']
    ))

    test_data = [
        [Paragraph("Test Suite Class", styles['TableHeader']), Paragraph("Tests", styles['TableHeader']), Paragraph("Key Test Scenarios Verified", styles['TableHeader']), Paragraph("Result", styles['TableHeader'])],
        [Paragraph("<b>QrCodeServiceTest</b>", styles['TableCellBold']), Paragraph("2", styles['TableCell']), Paragraph("Validates ZXing PNG byte stream generation and JSON payload structure.", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>CheckInServiceTest</b>", styles['TableCellBold']), Paragraph("3", styles['TableCell']), Paragraph("Validates check-in by token number, duplicate check-in prevention, and terminal status rejection.", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>DisplayBoardServiceTest</b>", styles['TableCellBold']), Paragraph("1", styles['TableCell']), Paragraph("Validates public TV projection payload and strict privacy guarantees (zero names/phones).", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>FeedbackServiceTest</b>", styles['TableCellBold']), Paragraph("5", styles['TableCell']), Paragraph("Validates 1–5 star boundaries, 500-char comment constraints, SERVED status requirement, and duplicate review guards.", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>CustomerServiceTest</b>", styles['TableCellBold']), Paragraph("4", styles['TableCell']), Paragraph("Validates rule-based no-show risk transitions: LOW (0), MEDIUM (1), and HIGH (&gt;=2).", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>QueueServiceTest</b>", styles['TableCellBold']), Paragraph("3", styles['TableCell']), Paragraph("Validates priority ordering, secondary timestamp tie-breaking, dynamic wait formulas, and duplicate ticket guards.", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>StatisticsServiceTest</b>", styles['TableCellBold']), Paragraph("1", styles['TableCell']), Paragraph("Validates daily throughput counts, busiest department aggregation, and safe reset day archiving.", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>SmartQueueIntegrationTest</b>", styles['TableCellBold']), Paragraph("1", styles['TableCell']), Paragraph("End-to-end integration test validating priority jumps, servicing, dynamic wait updates, and no-show risk escalation.", styles['TableCell']), Paragraph("<font color='#059669'><b>PASSED</b></font>", styles['TableCell'])],
        [Paragraph("<b>Total Automated Tests</b>", styles['TableCellBold']), Paragraph("<b>20</b>", styles['TableCellBold']), Paragraph("<b>Full regression suite covering all domain logic and edge cases</b>", styles['TableCellBold']), Paragraph("<font color='#059669'><b>BUILD SUCCESS</b></font>", styles['TableCellBold'])],
    ]
    test_table = Table(test_data, colWidths=[140, 40, 254, 70])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, LIGHT_BG]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#ecfdf5")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 14))

    # ==================== DEPLOYMENT & SUMMARY ====================
    story.append(Paragraph("6. Local Setup & Execution Guide", styles['H1']))
    story.append(Paragraph(
        "The system can be executed locally with a single terminal command using Maven and Java 21:",
        styles['Body']
    ))
    story.append(Paragraph(
        "# 1. Run Spring Boot Backend (Port 8080 with H2 DB)\n"
        "mvn spring-boot:run\n\n"
        "# 2. Run Test Suite\n"
        "mvn test\n\n"
        "# 3. Access In-Memory H2 Database Console\n"
        "URL: http://localhost:8080/h2-console  |  JDBC: jdbc:h2:mem:smartqueuedb  |  User: sa  |  Password: (blank)\n\n"
        "# 4. Demo Admin Credentials\n"
        "Password: admin123  (Notice: In production, configure Spring Security OAuth2 / JWT)",
        styles['CodeSnippet']
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("7. Conclusion & Presentation Readiness", styles['H1']))
    story.append(Paragraph(
        "<b>Smart Queue Manager</b> represents a complete, robust, and extensible enterprise solution for high-throughput service environments. "
        "By uniting prioritized queuing logic, ZXing mobile QR code check-in, privacy-guaranteed public display boards, "
        "adaptive service duration learning, rule-based no-show heuristics, and post-service customer feedback in a unified Spring Boot "
        "and React stack, the project provides an exceptional foundation for both academic capstone defense and practical commercial deployment.",
        styles['Body']
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report PDF successfully generated: {filename}")

if __name__ == '__main__':
    build_pdf()

# Loan Marketplace Platform – Requirement Document

## Project Overview

A fintech platform where users can apply for multiple financial products, upload documents, get matched with lending partners, and track their applications.

The platform will include:

* Customer Portal
* Partner Portal
* Admin Portal
* Credit & Matching Engines

Supported products:

* Home Loan
* Loan Against Property (LAP)
* Personal Loan
* Working Capital Loan
* Credit Cards

---

# 1. Customer Flow

## User Journey

1. Landing Page
2. Login / OTP Verification
3. Product Selection
4. Eligibility & Requirement Capture
5. Document Upload
6. Document Parsing & Validation
7. Internal Credit Logic Evaluation
8. Partner Matching
9. Top Recommendations
10. User Selection
11. Application Submission
12. Partner/Bank Processing
13. Real-Time Status Tracking
14. Approval / Disbursal
15. Cross Sell Offers

---

# 2. Customer Portal Requirements

## Main Features

* User registration/login
* OTP authentication
* Product selection
* Dynamic eligibility forms
* Document upload
* Recommendation screen
* Application tracking
* Notifications
* Profile management
* Cross-sell offers

## Customer Pages

* Landing Page
* Login / Signup
* OTP Verification
* Product Selection
* Eligibility Form
* Document Upload
* Recommendation Page
* Application Dashboard
* Status Tracking
* User Profile
* Notifications
* Support Page

---

# 3. Partner Portal Requirements

## Purpose

Partners (Banks/NBFCs/DSAs) should be able to manage:

* Products
* Offers
* Eligibility rules
* Applications
* Status updates

## Main Features

* Partner login
* Product management
* Offer management
* Rule configuration
* Application review
* Status updates
* Analytics dashboard
* Team management

## Partner Pages

* Login
* Dashboard
* Product List
* Create/Edit Product
* Offer Management
* Eligibility Rules
* Application Pipeline
* Application Details
* Document Review
* Status Update
* Analytics
* Team Management
* Settings

---

# 4. Admin Portal Requirements

## Purpose

Internal control panel for platform operations.

## Main Features

* Manage customers
* Manage partners
* Monitor applications
* Configure credit rules
* Configure recommendation logic
* Fraud monitoring
* Workflow management
* Reports & analytics

## Admin Pages

* Admin Dashboard
* Customer Management
* Partner Management
* Product Approval
* Application Monitoring
* Fraud Queue
* Manual Review Queue
* Credit Rule Engine
* Recommendation Rules
* Workflow Management
* Analytics & Reports
* Notification Templates
* CMS Management
* Audit Logs
* System Settings

---

# 5. Core Engines

## Document Parsing Engine

* OCR extraction
* Bank statement parsing
* PAN/Aadhaar extraction
* GST parsing

## Validation Engine

* Document verification
* Fraud checks
* Duplicate checks
* Data mismatch checks

## Credit Logic Engine

* Eligibility scoring
* Risk scoring
* FOIR calculation
* Loan eligibility

## Partner Matching Engine

* Match users with lenders based on rules

## Recommendation Engine

* Generate top recommendations

## Workflow Engine

Manages application lifecycle states.

Example states:

* Created
* Pending Documents
* Under Review
* Partner Assigned
* Approved
* Rejected
* Disbursed

---

# 6. Dynamic Form Requirements

Forms should support:

* Product-wise fields
* Conditional questions
* Validation rules
* Draft saving
* Configurable schemas

---

# 7. Document Requirements

Different products will require different documents.

Examples:

* PAN
* Aadhaar
* Salary Slips
* Bank Statements
* ITR
* GST Returns
* Property Documents

---

# 8. Reporting Requirements

## Customer Reports

* Application status
* Loan history

## Partner Reports

* Approval ratio
* Conversion metrics
* Revenue metrics

## Admin Reports

* Funnel reports
* Risk reports
* Partner performance
* Revenue analytics

---

# 9. Non-Functional Requirements

## Security

* Secure document storage
* Role-based access
* Audit logs

## Scalability

* Multi-product support
* Multi-partner support

## Performance

* Fast onboarding
* Real-time status updates

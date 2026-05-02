# 📅 BookSync — Smart Appointment Booking System

A full-stack, role-based appointment scheduling platform built for seamless coordination between **Organizers**, **Customers**, and **Admins**. Designed to handle real-world booking scenarios with real-time updates and secure transactions.

---

## ✨ Key Features

### 🔐 Authentication & Roles
- Unified login system supporting **three distinct roles**: Customer, Organizer, and Admin
- Secure JWT-based session management
- OTP-based email verification for account activation
- Password recovery with reset flow

### 🗓️ Service & Slot Management (Organizer)
- Create and manage appointment services with flexible rules
- Define weekly availability with configurable time intervals
- Auto-generate bookable time slots based on availability rules
- Publish/unpublish services to control visibility
- **Share private appointment links** for invite-only bookings

### 📋 Smart Booking Engine (Customer)
- Browse published services and book appointments in real-time
- Dynamic slot availability — only open slots are shown
- Concurrency-safe booking with database-level row locking
- Duplicate booking prevention per user per slot
- Pre-consultation meeting support (Online/Offline)

### 💳 Integrated Payment Gateway
- Razorpay integration with UPI, Cards, and Wallet support
- Secure payment verification using cryptographic signature validation
- Automatic booking confirmation upon successful payment
- Sandbox/Mock mode for development and testing

### 🔔 Real-Time Notifications
- Instant push notifications via WebSockets (Socket.io)
- Booking confirmations, cancellations, and payment alerts
- Notification center with read/unread management

### 🛡️ Admin Panel
- Platform-wide dashboard with key metrics
- Service moderation — approve or reject organizer submissions
- User management with role promotion and account control
- Booking oversight with admin-level cancellation

### 📊 Analytics & Reports
- Organizer dashboard with booking statistics and revenue tracking
- Calendar view for visual appointment management
- Peak hour analysis and service performance metrics

---

## 🛠️ Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| **Frontend**  | React 19, TypeScript, Vite      |
| **Backend**   | Node.js, Express.js, TypeScript |
| **Database**  | PostgreSQL                      |
| **Real-Time** | Socket.io                       |
| **Auth**      | JWT, bcrypt                     |
| **Payments**  | Razorpay SDK                    |
| **Video**     | Jitsi Meet (embedded)           |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gayatribakle/Appointment-App-Odoo.git
   cd Appointment-App-Odoo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=organizer_db
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your_secret_key
   ```

4. **Initialize the database**
   ```bash
   psql -U postgres -f server/init.sql
   ```

5. **Run the application**
   ```bash
   # Terminal 1 — Backend
   npm run server

   # Terminal 2 — Frontend
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

---

## 👥 Team

| Name              | Role                  |
| ----------------- | --------------------- |
| **Om Jejurkar**   | Full-Stack Developer  |
| **Gayatri Bakle** | Project Lead & Design |
| **Kirti Joshi**   | Frontend Developer    |
| **Anushka Bhor**  | Frontend Developer    |

---

## 📄 License

This project was built as part of a hackathon submission. All rights reserved.

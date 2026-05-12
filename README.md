# ⏰ AI Reminder Scheduler

A full-stack web application that lets you schedule smart reminders delivered via **Email** and **SMS**. Type a plain-English sentence and let **Google Gemini AI** auto-fill all the details for you.

![AI Reminder Scheduler](https://img.shields.io/badge/Stack-React%20%2B%20Node.js-blueviolet?style=for-the-badge)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange?style=for-the-badge)
![Twilio](https://img.shields.io/badge/SMS-Twilio-red?style=for-the-badge)

---

## ✨ Features

- 🧠 **AI Smart Fill** — Type a natural sentence like *"Remind me at 5pm tomorrow about the meeting"* and Gemini fills in all form fields automatically
- 📧 **Email Notifications** — Sends a confirmation email on signup + a reminder email 30 minutes before the event
- 📱 **SMS Notifications** — Optional Twilio SMS alerts to any phone number
- 🎨 **3D Glassmorphism UI** — Deep-space themed, fully responsive design
- ⚡ **Real-time Cron Scheduling** — Node.js cron job checks every minute and fires reminders on time

---

## 🗂️ Project Structure

```
Remainder/
├── backend/              # Node.js + Express API
│   ├── server.js         # Main server (routes, Gemini, Twilio, Nodemailer)
│   ├── .env.example      # Template for environment variables
│   └── package.json
│
└── reminder-frontend/    # React + Vite frontend
    ├── src/
    │   ├── App.jsx       # Main app component
    │   ├── App.css       # 3D glassmorphism styles
    │   └── index.css     # Global styles & animated background
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords)
- A [Twilio account](https://console.twilio.com) (free trial works)
- A [Gemini API key](https://aistudio.google.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Reminder-.git
cd Reminder-
```

### 2. Setup the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Setup the Frontend

```bash
cd ../reminder-frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/parse-reminder` | Parses a natural language sentence using Gemini AI |
| `POST` | `/api/reminders` | Schedules a reminder (email + optional SMS) |

### POST `/api/parse-reminder`
```json
// Request
{ "prompt": "Remind john@gmail.com at 3pm tomorrow about the standup" }

// Response
{
  "success": true,
  "data": {
    "email": "john@gmail.com",
    "phone": null,
    "purpose": "Meeting",
    "message": "Standup reminder",
    "scheduledTime": "2025-05-13T15:00:00"
  }
}
```

### POST `/api/reminders`
```json
// Request
{
  "email": "you@example.com",
  "phone": "+919876543210",
  "purpose": "Meeting",
  "message": "Team standup",
  "scheduledTime": "2025-05-13T15:00:00"
}

// Response
{ "success": true, "message": "Reminder scheduled!", "remindAt": "2025-05-13T14:30:00.000Z" }
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Vanilla CSS |
| Backend | Node.js, Express |
| AI | Google Gemini 1.5 Flash |
| Email | Nodemailer + Gmail SMTP |
| SMS | Twilio |
| Scheduling | node-cron |

---

## ⚠️ Important Notes

- Reminders fire **30 minutes before** the scheduled time
- Reminders are stored **in-memory** — they reset when the server restarts
- The phone number must be in **E.164 format** (e.g. `+919876543210`)
- On Twilio free trial, you can only send SMS to verified numbers

---

## 📄 License

MIT © [Navin Bharath](https://github.com/YOUR_USERNAME)

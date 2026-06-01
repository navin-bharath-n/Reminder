const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const cors = require("cors");
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const reminders = [];

// ✅ Replace your existing transporter with this
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

// Configure Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Function to send SMS
const sendSMS = async (phone, messageText) => {
  try {
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      console.warn("⚠️ Twilio credentials are not set. Cannot send SMS.");
      return;
    }

    const message = await twilioClient.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log("📱 SMS sent successfully:", message.sid);
  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
  }
};

// POST /api/parse-reminder — Gemini AI natural language parser
app.post("/api/parse-reminder", async (req, res) => {
  const { prompt, currentLocalTime } = req.body;
  if (!prompt) return res.status(400).json({ success: false, message: "No prompt provided." });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ success: false, message: "Gemini API key not configured." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const now = currentLocalTime || new Date().toString();
    const systemPrompt = `
You are a reminder parsing assistant. The user's current date/time and timezone is ${now}.
Extract reminder details from the user's sentence and return ONLY a valid JSON object (no markdown, no explanation).

JSON format:
{
  "email": "string or null",
  "phone": "string in E.164 format like +919876543210 or null",
  "purpose": "short category like Meeting, Deadline, Birthday, etc. or null",
  "message": "short descriptive reminder message",
  "scheduledTime": "ISO 8601 datetime string e.g. 2025-05-13T15:00:00"
}

User sentence: "${prompt}"
`;

    const result = await model.generateContent(systemPrompt);
    const rawText = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```json\n?|```$/g, "").trim();
    const parsed = JSON.parse(jsonText);

    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error("❌ Gemini parse error:", err.message);
    return res.status(500).json({ success: false, message: "AI parsing failed: " + err.message });
  }
});

// POST /api/reminders
app.post("/api/reminders", async (req, res) => {
  const { email, phone, message, scheduledTime } = req.body;

  if (!email || !message || !scheduledTime) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  const scheduledDate = new Date(scheduledTime);

  // 30 minutes before reminder
  const remindAt = new Date(scheduledDate.getTime() - 30 * 60000);

  const reminder = {
    email,
    phone,
    message,
    scheduledTime: scheduledDate,
    remindAt,
    sent: false,
  };

  reminders.push(reminder);

  // Send confirmation email
  transporter.sendMail(
    {
      from: process.env.GMAIL_USER || process.env.EMAIL_USER,
      to: email,
      subject: "Reminder Registered ✅",
      text: `Your reminder is set for ${scheduledDate.toLocaleString()}.\n\nMessage: ${message}`,
    },
    (err, info) => {
      if (err) {
        console.error("❌ Error sending confirmation email:", err);
      } else {
        console.log("✅ Confirmation email sent:", info.response);
      }
    }
  );

  // Send confirmation SMS
  if (phone) {
    await sendSMS(
      phone,
      `Reminder Set: ${message.substring(0, 30)}... Scheduled: ${scheduledDate.toLocaleString()}`
    );
  }

  res.status(200).json({
    success: true,
    message: "Reminder scheduled successfully!",
    remindAt: remindAt,
  });
});

// CRON job runs every minute
cron.schedule("* * * * *", () => {
  const now = new Date();

  reminders.forEach(async (reminder) => {
    if (!reminder.sent && now >= reminder.remindAt) {
      console.log(
        "⏱️ Sending reminder for:",
        reminder.scheduledTime.toLocaleString()
      );

      // Send Email Reminder
      transporter.sendMail(
        {
          from: process.env.GMAIL_USER || process.env.EMAIL_USER,
          to: reminder.email,
          subject: "⏰ Upcoming Reminder!",
          text: `Reminder: ${reminder.message}\nScheduled at: ${reminder.scheduledTime.toLocaleString()}`,
        },
        (err, info) => {
          if (err) {
            console.error("❌ Error sending reminder email:", err);
          } else {
            console.log("📧 Reminder email sent to", reminder.email);
          }
        }
      );

      // Send SMS Reminder
      if (reminder.phone) {
        await sendSMS(
          reminder.phone,
          `Reminder Alert: ${reminder.message.substring(
            0,
            50
          )}... Target Time: ${reminder.scheduledTime.toLocaleString()}`
        );
      }

      reminder.sent = true;
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
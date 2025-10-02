import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// Bulk email endpoint
app.post("/send-bulk", async (req, res) => {
  try {
    const { senderName, senderEmail, senderPass, recipients, subject, html } = req.body;

    // ✅ Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: senderEmail,
        pass: senderPass, // Gmail App Password
      },
    });

    let results = [];
    for (let email of recipients) {
      if (!email || !email.trim()) continue;

      const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,     // TLS port
  secure: false, // TLS requires false here
  auth: {
    user: senderEmail,
    pass: senderPass,
  },
});


      results.push(info.messageId);
    }

    res.json({ success: true, sent: results.length });
  } catch (err) {
    console.error("❌ Email Send Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

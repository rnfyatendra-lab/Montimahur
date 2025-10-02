import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// SMTP transporter (set values in Render/ENV)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// API endpoint
app.post("/send-bulk", async (req, res) => {
  try {
    const { recipients, subject, html } = req.body;
    let results = [];

    for (let email of recipients) {
      const info = await transporter.sendMail({
        from: `"Web Mailer" <${process.env.SMTP_USER}>`,
        to: email.trim(),
        subject,
        html
      });
      results.push(info.messageId);
    }

    res.json({ success: true, sent: results.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

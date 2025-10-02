import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// ✅ Bulk email endpoint with dynamic sender info
app.post("/send-bulk", async (req, res) => {
  try {
    const { senderName, senderEmail, senderPass, recipients, subject, html } = req.body;

    // create transporter dynamically with sender credentials
    const transporter = nodemailer.createTransport({
      service: "gmail", // for Gmail SMTP (can be changed to host/port)
      auth: {
        user: senderEmail,
        pass: senderPass
      }
    });

    let results = [];
    for (let email of recipients) {
      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
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
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));

import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// SMTP Transport (अपने SMTP settings डालें)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your_email@gmail.com",  // अपना mail
    pass: "your_app_password"      // Gmail App Password
  }
});

// Bulk Mail API
app.post("/send-bulk", async (req, res) => {
  const { recipients, subject, body } = req.body;

  if (!recipients || recipients.length === 0) {
    return res.status(400).json({ error: "Recipients missing" });
  }

  let sentCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const mailOptions = {
      from: "your_email@gmail.com",
      to: recipients[i],
      subject: subject,
      text: body
    };

    try {
      await transporter.sendMail(mailOptions);
      sentCount++;
      console.log(`✅ Sent to ${recipients[i]}`);
    } catch (err) {
      console.log(`❌ Failed to ${recipients[i]} : ${err}`);
    }

    // Delay 0.4–0.5 sec
    await new Promise(resolve => setTimeout(resolve, 450));
  }

  res.json({ message: `Sent ${sentCount} / ${recipients.length} emails` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

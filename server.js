import express from "express";
import session from "express-session";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Use a secure session store in production (Redis/etc). This is for demo.
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

app.use(express.static(path.join(__dirname, "public")));

// Helper: require login middleware
function requireLogin(req, res, next) {
  if (!req.session || !req.session.sendgridKey || !req.session.senderEmail) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  // set sgMail apiKey dynamically for this request
  sgMail.setApiKey(req.session.sendgridKey);
  next();
}

// Login route - stores sendgrid API key and sender email in session
app.post("/api/login", (req, res) => {
  const { apiKey, senderEmail } = req.body;
  if (!apiKey || !senderEmail) {
    return res.status(400).json({ success: false, error: "apiKey and senderEmail required" });
  }

  // lightweight validation
  if (typeof senderEmail !== "string" || !senderEmail.includes("@")) {
    return res.status(400).json({ success: false, error: "Invalid senderEmail" });
  }

  // save in session (for demo). In prod use encrypted store.
  req.session.sendgridKey = apiKey;
  req.session.senderEmail = senderEmail;
  req.session.save(err => {
    if (err) return res.status(500).json({ success: false, error: "Session save failed" });
    return res.json({ success: true });
  });
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, error: "Logout failed" });
    res.clearCookie("connect.sid");
    return res.json({ success: true });
  });
});

// Check auth
app.get("/api/me", (req, res) => {
  if (req.session && req.session.senderEmail) {
    return res.json({ authenticated: true, senderEmail: req.session.senderEmail });
  }
  return res.json({ authenticated: false });
});

// Bulk send endpoint — requireLogin
app.post("/api/send-bulk", requireLogin, async (req, res) => {
  try {
    const { subject, html, recipients, batchSize = 100, concurrency = 4 } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: "recipients array required" });
    }

    // Basic validation/sanitization
    const cleanRecipients = recipients
      .map(r => typeof r === "string" ? r.trim() : "")
      .filter(r => r && r.includes("@"));

    if (cleanRecipients.length === 0) {
      return res.status(400).json({ success: false, error: "No valid recipients provided" });
    }

    // Use batching to avoid huge payloads. SendGrid rate/limits depend on plan.
    const batches = [];
    for (let i = 0; i < cleanRecipients.length; i += batchSize) {
      batches.push(cleanRecipients.slice(i, i + batchSize));
    }

    let totalSent = 0;
    // process batches with limited concurrency
    for (let i = 0; i < batches.length; i += concurrency) {
      const chunk = batches.slice(i, i + concurrency);

      // each batch -> create a single send request containing multiple personalizations
      const promises = chunk.map(batchRecipients => {
        // build personalizations: send a single message with multiple 'to' recipients
        const msg = {
          personalizations: [
            {
              to: batchRecipients.map(r => ({ email: r })),
              subject: subject || "(no subject)"
            }
          ],
          from: { email: req.session.senderEmail },
          content: [{ type: "text/html", value: html || "" }]
        };
        return sgMail.send(msg);
      });

      // await all promises in this concurrency window
      const results = await Promise.allSettled(promises);
      results.forEach(r => {
        if (r.status === "fulfilled") {
          // SendGrid returns array or object — we count success as batch size
          // conservative: count successes as batchSize for this promise
          totalSent += batchSize; // approximate; adapt if you want exact tracking using webhooks
        } else {
          console.error("Send error for a batch:", r.reason);
        }
      });
    }

    return res.json({ success: true, sentApprox: cleanRecipients.length, note: "sent (approx). Use webhooks for exact delivery/bounces." });

  } catch (err) {
    console.error("Bulk send error:", err);
    return res.status(500).json({ success: false, error: err.message || "Send failed" });
  }
});

// Fallback: serve dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Fast Paid Mailer running on ${PORT}`));

app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    // Recipients cleanup (comma, newline, semicolon सब handle)
    let recipientList = recipients
      .split(/[\n,;]+/)   // comma, newline या ; से अलग करेगा
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipient emails found." });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    // ✅ Bulk recipients को एक साथ भेजना
    let mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientList,   // अब सबको भेजेगा
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `✅ Mail sent successfully to ${recipientList.length} recipients!` });
  } catch (err) {
    console.error("Mail Error:", err.message);
    res.json({ success: false, message: "❌ Mail sending failed: " + err.message });
  }
});

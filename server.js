app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    // ✅ split recipients by comma, newline, semicolon
    let recipientList = recipients
      .split(/[\n,;]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipients provided." });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    // ✅ send all at once using BCC
    let mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      bcc: recipientList,
      subject,
      text: message
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `✅ Mail sent successfully to ${recipientList.length} recipients!` });
  } catch (err) {
    res.json({ success: false, message: "❌ Mail sending failed: " + err.message });
  }
});

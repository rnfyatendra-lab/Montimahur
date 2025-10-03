app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    // recipients को array में split करके join कर दो
    let recipientList = recipients.split(",").map(r => r.trim()).filter(r => r);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    let mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientList,  // ✅ एक साथ सबको भेजेगा
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

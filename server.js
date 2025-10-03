const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, subject, message, recipients } = req.body;

    const msg = {
      to: recipients.split(","),
      from: { name: senderName, email: senderEmail }, 
      subject: subject,
      text: message
    };

    await sgMail.sendMultiple(msg);
    res.json({ success: true, message: "Mail sent successfully via SendGrid!" });
  } catch (err) {
    res.json({ success: false, message: "Mail sending failed: " + err.message });
  }
});

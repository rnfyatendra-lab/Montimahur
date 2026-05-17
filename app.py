from flask import Flask, render_template, request, redirect, url_for, session
from email.mime.text import MIMEText
import smtplib

app = Flask(__name__)

app.secret_key = "fastmailer"


# LOGIN
@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        if username == "&&&&" and password == "&&&&":

            session["user"] = username

            return redirect(url_for("launcher"))

    return render_template("login.html")


# MAILER
@app.route("/launcher", methods=["GET", "POST"])
def launcher():

    if "user" not in session:
        return redirect(url_for("login"))

    # DEFAULT VALUES
    data = {
        "sender_name": "",
        "gmail": "",
        "app_password": "",
        "subject": "",
        "body": "",
        "recipients": ""
    }

    message = ""
    total_sent = 0

    if request.method == "POST":

        sender_name = request.form.get("sender_name")
        gmail = request.form.get("gmail")
        app_password = request.form.get("app_password")
        subject = request.form.get("subject")
        body = request.form.get("body")
        recipients = request.form.get("recipients")

        # SAVE OLD DATA
        data = {
            "sender_name": sender_name,
            "gmail": gmail,
            "app_password": app_password,
            "subject": subject,
            "body": body,
            "recipients": recipients
        }

        try:

            emails = []

            # SPLIT EMAILS
            for line in recipients.splitlines():

                if "," in line:

                    parts = line.split(",")

                    for p in parts:

                        p = p.strip()

                        if p:
                            emails.append(p)

                else:

                    line = line.strip()

                    if line:
                        emails.append(line)

            # SMTP
            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls()

            server.login(gmail, app_password)

            sent = 0

            for receiver in emails:

                html = f"""
                <html>
                <body>

                <h3>Hello</h3>

                <p>{body}</p>

                <br>

                <p>
                Thanks<br>
                {sender_name}
                </p>

                </body>
                </html>
                """

                msg = MIMEText(html, "html")

                msg["Subject"] = subject
                msg["From"] = gmail
                msg["To"] = receiver

                server.sendmail(
                    gmail,
                    receiver,
                    msg.as_string()
                )

                sent += 1

            server.quit()

            total_sent = sent

            message = f"Send {sent}"

        except Exception as e:

            message = f"Error: {str(e)}"

    return render_template(
        "launcher.html",
        message=message,
        total_sent=total_sent,
        data=data
    )


# LOGOUT
@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login"))


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=10000
    )

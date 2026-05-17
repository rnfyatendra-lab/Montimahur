from flask import Flask, render_template, request, redirect, url_for, session, flash
from email.mime.text import MIMEText
import smtplib
import ssl
import time

app = Flask(__name__)

app.secret_key = "fastmailer"


# LIMIT SETTINGS
MAX_PER_HOUR = 28

# SAFE SPEED
DELAY_BETWEEN_MAILS = 25


# LOGIN
@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        if username == "&&&&" and password == "&&&&":

            session["user"] = username

            return redirect(url_for("launcher"))

        else:

            flash("Wrong Login")

    return render_template("login.html")


# MAILER
@app.route("/launcher", methods=["GET", "POST"])
def launcher():

    if "user" not in session:
        return redirect(url_for("login"))

    # DEFAULT DATA
    data = {
        "sender_name": "",
        "gmail": "",
        "app_password": "",
        "subject": "",
        "body": "",
        "recipients": ""
    }

    total_sent = 0

    if request.method == "POST":

        sender_name = request.form.get("sender_name", "").strip()
        gmail = request.form.get("gmail", "").strip()
        app_password = request.form.get("app_password", "").strip()
        subject = request.form.get("subject", "").strip()
        body = request.form.get("body", "").strip()
        recipients = request.form.get("recipients", "").strip()

        # SAVE CURRENT DATA
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

            # LIMIT CHECK
            if len(emails) > MAX_PER_HOUR:

                flash(f"Limit Full ({MAX_PER_HOUR} per hour)")

                return render_template(
                    "launcher.html",
                    data=data,
                    total_sent=0
                )

            # SMTP
            context = ssl.create_default_context()

            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls(context=context)

            server.login(gmail, app_password)

            sent = 0

            for receiver in emails:

                html = f"""
                <html>
                <body style="font-family:Arial;font-size:16px;color:#222;line-height:1.6;">

                <p>{body.replace(chr(10), "<br>")}</p>

                </body>
                </html>
                """

                msg = MIMEText(html, "html")

                msg["Subject"] = subject

                # ONLY NAME SHOW
                msg["From"] = f"{sender_name} <{gmail}>"

                msg["To"] = receiver

                server.sendmail(
                    gmail,
                    receiver,
                    msg.as_string()
                )

                sent += 1

                # SAFE DELAY
                time.sleep(DELAY_BETWEEN_MAILS)

            server.quit()

            total_sent = sent

            flash(f"Send {sent}")

        except Exception as e:

            flash(f"Error: {str(e)}")

    return render_template(
        "launcher.html",
        data=data,
        total_sent=total_sent
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

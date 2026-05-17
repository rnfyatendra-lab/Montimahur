from flask import Flask, render_template, request, redirect, url_for, session, flash
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import time
import re
import random

app = Flask(__name__)

app.secret_key = "fastmailer"


# =========================
# ULTRA SAFE SETTINGS
# =========================

BATCH_SIZE = 2

# RANDOM SAFE DELAY
MIN_DELAY = 8
MAX_DELAY = 15

# 1 HOUR LIMIT
HOURLY_LIMIT = 28


# =========================
# MAIL TRACKER
# =========================

mail_tracker = {}

# =========================
# CLEAN MESSAGE
# =========================

def clean_message(text):

    result = text

    for bad, good in SAFE_WORDS.items():

        pattern = re.compile(re.escape(bad), re.IGNORECASE)

        result = pattern.sub(good, result)

    return result


# =========================
# LOGIN
# =========================

@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        if username == "&&&&" and password == "&&&&":

            session["user"] = username

            return redirect(url_for("launcher"))

        flash("Invalid Login")

    return render_template("login.html")


# =========================
# MAILER
# =========================

@app.route("/launcher", methods=["GET", "POST"])
def launcher():

    if "user" not in session:
        return redirect(url_for("login"))

    data = {
        "sender_name": "",
        "gmail": "",
        "app_password": "",
        "subject": "",
        "body": "",
        "recipients": ""
    }

    if request.method == "POST":

        sender_name = request.form.get("sender_name")
        gmail = request.form.get("gmail")
        app_password = request.form.get("app_password")
        subject = request.form.get("subject")
        body = request.form.get("body")
        recipients = request.form.get("recipients")

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

            current_time = time.time()

            # NEW ACCOUNT
            if gmail not in mail_tracker:

                mail_tracker[gmail] = {
                    "count": 0,
                    "start": current_time
                }

            # RESET AFTER 1 HOUR
            elapsed = current_time - mail_tracker[gmail]["start"]

            if elapsed > 3600:

                mail_tracker[gmail]["count"] = 0
                mail_tracker[gmail]["start"] = current_time

            # EMAIL LIST
            emails = []

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
            current_count = mail_tracker[gmail]["count"]

            if current_count + len(emails) > HOURLY_LIMIT:

                flash("Limit Full")

                return render_template(
                    "launcher.html",
                    data=data
                )

            # CLEAN BODY
            cleaned_body = clean_message(body)

            # KEEP SAME LINES
            html_body = cleaned_body.replace("\n", "<br>")

            # SMTP
            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls()

            server.login(gmail, app_password)

            sent = 0

            for receiver in emails:

                html = f"""
                <html>
                <body style="font-family:Arial;font-size:16px;line-height:1.6;color:#222;">

                {html_body}

                </body>
                </html>
                """

                # MULTIPART
                msg = MIMEMultipart("alternative")

                # PLAIN TEXT
                msg.attach(MIMEText(cleaned_body, "plain"))

                # HTML
                msg.attach(MIMEText(html, "html"))

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

                mail_tracker[gmail]["count"] += 1

                # SAFE RANDOM DELAY
                if sent % BATCH_SIZE == 0:

                    delay = random.randint(MIN_DELAY, MAX_DELAY)

                    time.sleep(delay)

            server.quit()

            flash(f"Send {sent}")

        except Exception as e:

            flash(f"Error: {str(e)}")

    return render_template(
        "launcher.html",
        data=data
    )


# =========================
# LOGOUT
# =========================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login"))


# =========================
# RUN
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=10000
    )

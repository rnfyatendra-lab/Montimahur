from flask import Flask, render_template, request, redirect, url_for, session
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import time
import random
import re

app = Flask(__name__)

app.secret_key = "fastmailer"

# SAFE SPEED
BATCH_SIZE = 3
BATCH_DELAY = 1000
DAILY_LIMIT = 100


# SAFE WORDS
SAFE_WORDS = {
    "free": "complimentary",
    "urgent": "important",
    "buy now": "learn more",
    "click here": "view details",
    "winner": "selected",
    "cheap": "affordable",
    "guarantee": "assurance",
    "act now": "respond soon"
}

# CLEAN MESSAGE
def clean_message(text):

    result = text

    for bad, good in SAFE_WORDS.items():

        pattern = re.compile(re.escape(bad), re.IGNORECASE)

        result = pattern.sub(good, result)

    return result


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

    data = {
        "sender_name": "",
        "gmail": "",
        "app_password": "",
        "subject": "",
        "body": "",
        "recipients": ""
    }

    message = ""

    if request.method == "POST":

        sender_name = request.form.get("sender_name")
        gmail = request.form.get("gmail")
        app_password = request.form.get("app_password")
        subject = request.form.get("subject")
        body = request.form.get("body")
        recipients = request.form.get("recipients")

        # KEEP DATA
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

            # EMAIL SPLIT
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

            emails = emails[:DAILY_LIMIT]

            # CLEAN BODY
            cleaned_body = clean_message(body)

            # KEEP LINE STRUCTURE
            html_body = cleaned_body.replace("\n", "<br>")

            # SMTP
            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls()

            server.login(gmail, app_password)

            sent = 0

            for receiver in emails:

                # RANDOM OPENER
                opener = random.choice(OPENERS)

                final_html = f"""
                <html>
                <body style="font-family:Arial;font-size:16px;line-height:1.6;color:#222;">

                <p>{opener}</p>

                <p>{html_body}</p>

                <br>

                <p style="font-size:12px;color:gray;">
                If you'd prefer not to receive future emails,
                reply with unsubscribe.
                </p>

                </body>
                </html>
                """

                # MULTIPART EMAIL
                msg = MIMEMultipart("alternative")

                plain_text = f"""
{opener}

{cleaned_body}

"""

                msg.attach(MIMEText(plain_text, "plain"))
                msg.attach(MIMEText(final_html, "html"))

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
                if sent % BATCH_SIZE == 0:

                    time.sleep(BATCH_DELAY / 1000)

            server.quit()

            message = f"Send {sent}"

        except Exception as e:

            message = f"Error: {str(e)}"

    return render_template(
        "launcher.html",
        message=message,
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

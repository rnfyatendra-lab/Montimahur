from flask import Flask, render_template, request, redirect, url_for, session, flash
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl
import time
import re

app = Flask(__name__)
app.secret_key = "fastmailer"


# SAFE RATE LIMITS
BATCH_SIZE = 5
BATCH_DELAY = 5
DAILY_LIMIT = 100


@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if username == "&&&&" and password == "&&&&":

            session["user"] = username

            return redirect(url_for("launcher"))

        flash("Wrong Login")

    return render_template("login.html")


def valid_email(email):

    pattern = r'^[^@]+@[^@]+\.[^@]+$'

    return re.match(pattern, email)


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

    total_sent = 0

    if request.method == "POST":

        sender_name = request.form.get("sender_name", "").strip()
        gmail = request.form.get("gmail", "").strip()
        app_password = request.form.get("app_password", "").strip()
        subject = request.form.get("subject", "").strip()
        body = request.form.get("body", "").strip()
        recipients = request.form.get("recipients", "").strip()

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

            for line in recipients.splitlines():

                if "," in line:

                    parts = line.split(",")

                    for p in parts:

                        p = p.strip()

                        if p and valid_email(p):
                            emails.append(p)

                else:

                    line = line.strip()

                    if line and valid_email(line):
                        emails.append(line)

            emails = list(dict.fromkeys(emails))

            emails = emails[:DAILY_LIMIT]

            if len(emails) == 0:

                flash("No valid recipients")

                return render_template(
                    "launcher.html",
                    data=data,
                    total_sent=0
                )

            context = ssl.create_default_context()

            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls(context=context)

            server.login(gmail, app_password)

            sent = 0

            for receiver in emails:

                msg = MIMEMultipart("alternative")

                plain_text = body

                html_body = body.replace("\n", "<br>")

                html = f"""
                <html>
                <body style="font-family:Arial;font-size:16px;line-height:1.6;color:#222;">

                {html_body}

                </body>
                </html>
                """

                msg.attach(MIMEText(plain_text, "plain"))
                msg.attach(MIMEText(html, "html"))

                msg["Subject"] = subject
                msg["From"] = f"{sender_name} <{gmail}>"
                msg["To"] = receiver

                msg["Reply-To"] = gmail

                server.sendmail(
                    gmail,
                    receiver,
                    msg.as_string()
                )

                sent += 1

                if sent % BATCH_SIZE == 0:
                    time.sleep(BATCH_DELAY)

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


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login"))


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=10000
    )

from flask import Flask, render_template, request, redirect, url_for, session, flash
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import time
import re

app = Flask(__name__)

app.secret_key = "fastmailer"


# SAFE SETTINGS
BATCH_SIZE = 1
BATCH_DELAY = 25
HOURLY_LIMIT = 28


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

        else:

            flash("Wrong Login")

    return render_template("login.html")


# MAILER
@app.route("/launcher", methods=["GET", "POST"])
def launcher():

    if "user" not in session:

        return redirect(url_for("login"))

    # KEEP VALUES
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

        # SAVE INPUTS
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

                line = line.strip()

                if line:

                    if "," in line:

                        parts = line.split(",")

                        for p in parts:

                            p = p.strip()

                            if p:
                                emails.append(p)

                    else:

                        emails.append(line)

            # LIMIT
            if len(emails) > HOURLY_LIMIT:

                flash("Limit Full")

                return render_template(
                    "launcher.html",
                    data=data
                )

            # CLEAN BODY
            cleaned_body = clean_message(body)

            # KEEP TEMPLATE LINES
            html_body = cleaned_body.replace("\n", "<br>")

            # SMTP
            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls()

            server.login(gmail, app_password)

            sent = 0

            for receiver in emails:

                # EMAIL
                msg = MIMEMultipart("alternative")

                msg["Subject"] = subject

                # ONLY NAME SHOW
                msg["From"] = f"{sender_name} <{gmail}>"

                msg["To"] = receiver

                # HTML TEMPLATE
                html = f"""
                <html>
                <body style="
                font-family:Arial;
                font-size:16px;
                color:#222;
                line-height:1.6;
                ">

                {html_body}

                </body>
                </html>
                """

                # PLAIN TEXT
                plain = cleaned_body

                msg.attach(MIMEText(plain, "plain"))

                msg.attach(MIMEText(html, "html"))

                # SEND
                server.sendmail(
                    gmail,
                    receiver,
                    msg.as_string()
                )

                sent += 1

                # SAFE SLOW DELAY
                if sent % BATCH_SIZE == 0:

                    time.sleep(BATCH_DELAY)

            server.quit()

            flash(f"Send {sent}")

        except Exception as e:

            flash(f"Error: {str(e)}")

    return render_template(
        "launcher.html",
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

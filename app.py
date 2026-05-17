from flask import Flask, render_template, request, redirect, url_for, session, flash
from email.mime.text import MIMEText
import smtplib
import ssl
import time

app = Flask(__name__)

app.secret_key = "fastmailer"


# =========================
# SPEED SETTINGS
# =========================
BATCH_SIZE = 5
BATCH_DELAY = 300
DAILY_LIMIT = 500


# =========================
# LOGIN
# =========================
@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if username == "&&&&" and password == "&&&&":

            session["user"] = username

            return redirect(url_for("launcher"))

        else:

            flash("Wrong Login")

    return render_template("login.html")


# =========================
# MAILER
# =========================
@app.route("/launcher", methods=["GET", "POST"])
def launcher():

    if "user" not in session:
        return redirect(url_for("login"))

    # KEEP DATA
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

        # SAVE CURRENT VALUES
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

            # REMOVE DUPLICATES
            emails = list(dict.fromkeys(emails))

            # DAILY LIMIT
            emails = emails[:DAILY_LIMIT]

            if len(emails) == 0:

                flash("No Recipients Found")

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

                # KEEP SAME TEMPLATE LINES
                html_body = body.replace("\n", "<br>")

                html = f"""
                <html>
                <body style="font-family:Arial;font-size:16px;color:#222;line-height:1.6;">

                {html_body}

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

                # SPEED CONTROL
                if sent % BATCH_SIZE == 0:

                    time.sleep(BATCH_DELAY / 1000)

            server.quit()

            total_sent = sent

            # SUCCESS POPUP
            flash(f"Send {sent}")

        except Exception as e:

            flash(f"Error: {str(e)}")

    return render_template(
        "launcher.html",
        data=data,
        total_sent=total_sent
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

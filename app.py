from flask import Flask, render_template, request, redirect, url_for, session
from email.mime.text import MIMEText
import smtplib
import time

app = Flask(__name__)

app.secret_key = "fastmailer"


# SPEED SETTINGS
BATCH_SIZE = 5
BATCH_DELAY = 300
DAILY_LIMIT = 500


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

        # SAVE DATA
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

                        if p:
                            emails.append(p)

                else:

                    line = line.strip()

                    if line:
                        emails.append(line)

            # LIMIT
            emails = emails[:DAILY_LIMIT]

            # SMTP
            server = smtplib.SMTP("smtp.gmail.com", 587)

            server.starttls()

            server.login(gmail, app_password)

            sent = 0

            for index, receiver in enumerate(emails):

                html = f"""
                <html>
                <body>

                <p>{body}</p>

                </body>
                </html>
                """

                msg = MIMEText(html, "html")

                msg["Subject"] = subject

                # ONLY NAME
                msg["From"] = f"{sender_name} <{gmail}>"

                msg["To"] = receiver

                server.sendmail(
                    gmail,
                    receiver,
                    msg.as_string()
                )

                sent += 1

                # BATCH DELAY
                if sent % BATCH_SIZE == 0:
                    time.sleep(BATCH_DELAY / 1000)

            server.quit()

            # AUTO RESET AFTER SEND
            data = {
                "sender_name": "",
                "gmail": "",
                "app_password": "",
                "subject": "",
                "body": "",
                "recipients": ""
            }

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

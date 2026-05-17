from flask import Flask, render_template, request
from email.mime.text import MIMEText
import smtplib
import os
import time
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")


@app.route("/", methods=["GET", "POST"])
def home():

    message = ""

    if request.method == "POST":

        subject = request.form.get("subject")
        body = request.form.get("body")

        try:

            # Read emails
            with open("emails.txt", "r") as file:
                emails = file.readlines()

            # Gmail SMTP
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()

            server.login(EMAIL, PASSWORD)

            sent = 0

            for receiver in emails:

                receiver = receiver.strip()

                if receiver == "":
                    continue

                # Personalized email
                final_message = f"""
Hello,

{body}

Thanks
"""

                msg = MIMEText(final_message)

                msg["Subject"] = subject
                msg["From"] = EMAIL
                msg["To"] = receiver

                server.sendmail(
                    EMAIL,
                    receiver,
                    msg.as_string()
                )

                print(f"Sent to {receiver}")

                sent += 1

                # Safe delay
                time.sleep(5)

            server.quit()

            message = f"Successfully sent {sent} emails"

        except Exception as e:

            message = f"Error: {str(e)}"

    return render_template(
        "index.html",
        message=message
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )

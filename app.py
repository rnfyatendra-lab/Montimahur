from flask import Flask, render_template, request
from email.mime.text import MIMEText
import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")


@app.route("/", methods=["GET", "POST"])
def home():

    message = ""

    if request.method == "POST":

        subject = request.form["subject"]
        body = request.form["body"]

        try:

            with open("emails.txt", "r") as file:
                emails = file.readlines()

            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()

            server.login(EMAIL, PASSWORD)

            for receiver in emails:

                receiver = receiver.strip()

                msg = MIMEText(body)

                msg["Subject"] = subject
                msg["From"] = EMAIL
                msg["To"] = receiver

                server.sendmail(
                    EMAIL,
                    receiver,
                    msg.as_string()
                )

                print("Sent to", receiver)

            server.quit()

            message = "Emails Sent Successfully"

        except Exception as e:
            message = str(e)

    return render_template(
        "index.html",
        message=message
    )


if __name__ == "__main__":
    app.run(debug=True)

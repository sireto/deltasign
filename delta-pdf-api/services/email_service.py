import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from env import EMAIL_SMTP_SERVER, EMAIL_SMTP_PORT, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_SERVICE_TEST_MODE


# TODO ADD SCHEDULER SERVICE FOR FAILED EMAILS

class EmailService:

    def __init__(self, smtp_server=None, smtp_port=None, username=None, password=None, test_mode=None):
        self.logger = logging.getLogger(__name__)
        self.smtp_server = smtp_server if smtp_server else EMAIL_SMTP_SERVER
        self.smtp_port = smtp_port if smtp_port else EMAIL_SMTP_PORT
        self.username = username if username else EMAIL_USERNAME
        self.password = password if password else EMAIL_PASSWORD
        self.server = None
        self.test_mode = test_mode if test_mode else EMAIL_SERVICE_TEST_MODE

    def init_connection(self):
        self.server = smtplib.SMTP(self.smtp_server, self.smtp_port)
        if not self.username or not self.password:
            raise Exception("Email username/password is not set")
        self.server.ehlo()
        self.server.starttls()
        self.server.ehlo()
        self.server.login(self.username, self.password)

    def sendmail(self, receiver, subject, text_body=None, html_body=None):
        print(f"Sending email to : {receiver}")
        self.logger.info(f"Sending email \nReceiver: {receiver}\nSubject: {subject}\nBody: {text_body}\nHTML:{html_body}")
        if self.test_mode:
            self.logger.info(f"Email Service Test mode: Email should be sent at this point: {receiver}")
            return

        # Initialize session
        self.init_connection()

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.username
        message["To"] = receiver

        # Turn these into plain/html MIMEText objects
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")

        # Add HTML/plain-text parts to MIMEMultipart message
        # The email client will try to render the last part first
        message.attach(part1)
        message.attach(part2)

        # send email
        self.server.sendmail(self.username, receiver, message.as_string())

        # Quit session
        self.server.quit()

    def email_login_code(self, receiver, login_code):
        subject = "Delta Sign - Login code"
        text_body = f"""\
        Hi there,
        
        Login code for DeltaSign : {login_code}
        The code is valid for 5 minutes.
        
        If it is not you who tried to login or signup on DeltaSign App, 
        please report at abuse@deltasign.io.
        
        Kind Regards,
        DeltaSign Team
        """
        html_body = f"""\
        <html>
          <body>
            <p>Hi there,<br><br/>
               Login code for DeltaSign : <strong>{login_code}</strong><br>
               The code is valid for 5 minutes. <br/><br/>
               
               If it is not you who tried to login or signup on DeltaSign App,<br/>
               please report at <i>abuse@deltasign.io</i><br/>
               <br/>
               Kind Regards,<br/>
               DeltaSign Team
            </p>
          </body>
        </html>"""

        return self.sendmail(receiver, subject, text_body=text_body, html_body=html_body)

    def email_contract(self, sender, receiver, contract_name, message):
        subject = f"Delta Sign - {contract_name}"
        text_body = f"""\
        Hi there,

        {sender} has sent you a Delta Sign contract.
        File: ({contract_name})
        Message: "{message}"
        
        You can view and sign the PDF via DeltaSign App available at PlayStore.

        If you're not the intended receiver or you do not know the sender,
        please report at abuse@deltasign.io.
        
        Kind Regards,
        DeltaSign Team
        """
        style = """
            blockquote {
                border-left: 4px solid #98989840;
                margin: 0;
                padding: 8px 12px;
                background-color: #f7f7f7;
                border-radius: 1px;
            }
        """
        html_body = f"""\
        <html>
          <head>
          <style>{style}</style>
          </head>
          <body>
            <p>Hi there,<br><br/>
               <strong>{sender}</strong> has sent you a Delta Sign contract.
               <br/><br/>
               <strong>{contract_name}</strong><br/>
               <blockquote>{message}</blockquote>
               <br/><br/>

               You can view and sign the PDF via DeltaSign App available at PlayStore. 
               <br/><br/>
                
               If you're not the intended receiver or you do not know the sender<br/>
               please report at <i>abuse@deltasign.io</i><br/>
               <br/>
               Kind Regards,<br/>
               DeltaSign Team
            </p>
          </body>
        </html>"""

        return self.sendmail(receiver, subject, text_body=text_body, html_body=html_body)

    def email_notification_of_beta_application(self, applicant_email):
        subject = f"Delta Sign - Beta registration: {applicant_email}"
        text_body = f"""\
        Hi there,

        {applicant_email} has applied for beta access.

        Kind Regards,
        DeltaSign Team
        """
        style = """
            blockquote {
                border-left: 4px solid #98989840;
                margin: 0;
                padding: 8px 12px;
                background-color: #f7f7f7;
                border-radius: 1px;
            }
        """
        html_body = f"""\
        <html>
          <head>
          <style>{style}</style>
          </head>
          <body>
            <p>Hi there,<br><br/>
               <strong>{applicant_email}</strong>  has applied for beta access..
               <br/>
               Kind Regards,<br/>
               DeltaSign Team
            </p>
          </body>
        </html>"""

        return self.sendmail("info@deltasign.io", subject, text_body=text_body, html_body=html_body)

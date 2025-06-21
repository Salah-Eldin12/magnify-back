const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");

// nodemailer create transport
const transporter = nodemailer.createTransport({
  host: `smtp.hostinger.com`,
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASS,
  },
});

function SendEmail(req, res, next) {
  // routes that need to send email
  const routes = ["resetPassword", "verifyEmail"];

  const EmailsOptions = [
    {
      emailType: "uploadProjectFiles",
      to: req.ToEmail,
      cc: [req.CcEmails && req.CcEmails],
      emailFile: "uploadProjectFiles",
      subject: "Project Files Uploaded",
    },
    {
      emailType: "filesUpload",
      to: process.env.PROJECT_UPLOAD_EMAIL,
      subject: "New Files Uploaded",
      emailFile: "filesUpload",
      replacement: {
        projectName: req.body.project_name,
        folderName: req.body.folderName,
      },
    },
    {
      emailType: "resetPassword",
      to: req.userEmail,
      subject: "Reset Password",
      emailFile: "resetPassword",
      replacement: {
        name: req.userName,
        passToken:
          `${process.env.WEBSITE_URL}/reset-password/` + req.verifyLink,
      },
    },
    {
      emailType: "verifyEmail",
      to: req.userEmail,
      subject: "Account Verification",
      emailFile: "verifyEmail",
      replacement: {
        name: req.userName,
        passToken:
          `${process.env.WEBSITE_URL}/create-password/` + req.verifyLink,
      },
    },
  ];

  const emailOption = EmailsOptions.find(
    (emailType) => emailType.emailType === req.body.emailType
  );

  if (!emailOption) {
    // Unknown email type, skip or handle as needed
    return res.status(400).json({ message: "Invalid email type" });
  }

  const { to, subject, replacement, emailFile, cc } = emailOption;

  let source;
  try {
    source = fs
      .readFileSync(`email/${emailFile}/email.html`, "utf-8")
      .toString();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Email template not found", error: err.message });
  }

  const template = handlebars.compile(source);
  const htmlToSend = template(replacement);

  const mailOptions = {
    from: ` Magnifyportal ${process.env.EMAIL_USERNAME}`,
    to: to,
    subject: subject,
    html: htmlToSend,
    cc: cc && cc,
    attachments: [
      {
        filename: "mainLogo.png",
        path: "email/assets/mainLogo.png",
        cid: "logo",
      },
      {
        filename: "icon.png",
        path: "email/assets/icon.png",
        cid: "icon",
      },
    ],
  };
  try {
    transporter.sendMail(mailOptions, (err) => {
      if (routes.includes(req.body.emailType)) {
        return res
          .status(200)
          .json({ message: "email send", verifyLink: req.verifyLink });
      } else {
        next();
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to send email", error: error });
  }
}

module.exports = { SendEmail };

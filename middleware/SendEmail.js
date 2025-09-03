import nodemailer from "nodemailer";
import env from "../config/env.js";
import { fileURLToPath } from "url";
import path from "path";
import hbs from "nodemailer-express-handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// nodemailer create transport
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Handlebars
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      layoutsDir: path.join(__dirname, "..", "emails"),
      defaultLayout: false,
    },
    viewPath: path.join(__dirname, "..", "emails"),
    extName: ".hbs",
  })
);

function SendEmail(req, res, next) {
  // routes that need to send email
  const routes = [
    "resetPassword",
    "verifyEmail",
    "userCreated",
    "uploadProjectFiles",
  ];
  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  const EmailsOptions = [
    {
      emailType: "uploadProjectFiles",
      to: req?.ToEmail,
      ar_temp: false,
      cc: [req?.CcEmails && req?.CcEmails],
      emailFile: "uploadProjectFiles",
      subject: `Virtual Tour Ready for ${req?.projectName}`,
      replacement: {
        link: `${env.WEBSITE_URL}`,
        projectName: req?.projectName,
        projectDate:
          req?.projectDate &&
          new Date(req?.projectDate).toISOString().split("T")[0],
        company: "magnify",
        year: new Date().getFullYear(),
      },
    },
    {
      emailType: "filesUpload",
      to: env.PROJECT_UPLOAD_EMAIL,
      subject: "New Files Uploaded",
      emailFile: "filesUpload",
      ar_temp: false,
      replacement: {
        projectName: req?.body?.project_name,
        folderName: req?.body?.folderName,
        company: "magnify",
        year: new Date().getFullYear(),
      },
    },
    {
      emailType: "resetPassword",
      to: req?.userEmail,
      ar_temp: true,
      subject: getText("Reset Password", "اعادة تعيين كلمة مرور"),
      emailFile: "resetPassword",
      replacement: {
        name: req?.fullName,
        passToken: `${env.WEBSITE_URL}/reset-password/` + req?.verifyLink,
        company: "magnify",
        year: new Date().getFullYear(),
      },
    },
    {
      emailType: "verifyEmail",
      to: req?.userEmail,
      ar_temp: true,
      subject: getText(
        "Verify Your magnify Account",
        "تحقق من حسابك على magnify"
      ),
      emailFile: "verifyEmail",
      replacement: {
        name: req?.userName,
        passToken: `${env.WEBSITE_URL}/create-password/` + req?.verifyLink,
        company: "magnify",
        year: new Date().getFullYear(),
      },
    },
    {
      emailType: "userCreated",
      to: req.userEmail,
      ar_temp: false,
      subject: "Your Magnify account has been created",
      emailFile: "userCreated",
      replacement: {
        name: req?.data?.userName,
        company: "magnify",
        loginLink: `${env.WEBSITE_URL}/`,
        email: req.userEmail,
        year: new Date().getFullYear(),
      },
    },
  ];
  // target the wanted email template
  const emailOption = EmailsOptions.find(
    (email) => email.emailType === req.body.emailType
  );
  // if email template not found
  if (!emailOption) {
    return res.status(400).json({ message: "Invalid email type" });
  }

  const { to, subject, replacement, emailFile, cc, ar_temp } = emailOption;

  const templatePath = ar_temp
    ? `${emailFile}/${lang === "en" ? "/email" : "/email_ar"}`
    : `${emailFile}/${"/email"}`;

  const mailOptions = {
    from: `"Magnifyportal" <${env.SMTP_USER}>`,
    to: to,
    subject: subject,
    template: templatePath,
    context: replacement,
    cc: cc && cc,
    attachments: [
      {
        filename: "mainLogo.png",
        path: "emails/assets/mainLogo.png",
        cid: "logo@cid",
      },
      {
        filename: "icon.png",
        path: "emails/assets/icon.png",
        cid: "icon@cid",
      },
    ],
  };

  // send email

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).send({ message: "email not send" });
    } else {
      if (routes.includes(req.body.emailType)) {
        if (req.body.emailType === "uploadProjectFiles") {
          return res
            .status(200)
            .send({ message: "file uploaded and extracted" });
        }
        const verifyLink = req.verifyLink;
        const data = req.data;
        return res
          .status(200)
          .json({ message: "email send", verifyLink, data });
      } else {
        next();
      }
    }
  });
}

export { SendEmail };

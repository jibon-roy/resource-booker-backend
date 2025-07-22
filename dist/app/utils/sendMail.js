"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
// export const sendEmail = async (to: string, html: string, subject: string) => {
//   console.log(to);
//   try {
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         // TODO: replace `user` and `pass` values from <https://forwardemail.net>
//         user: config.mail,
//         pass: config.mail_password,
//       },
//     });
//     const result = await transporter.sendMail({
//       from: 'akonhasan680@gmail.com', // sender address
//       to, // list of receivers
//       subject, // Subject line
//       text: '', // plain text body
//       html, // html body
//     });
//     console.log(result);
//   } catch (error) {}
// };
const sendEmail = (to, html, subject) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(to);
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 587,
            secure: false,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: config_1.default.mail,
                pass: config_1.default.mail_password,
            },
        });
        const result = yield transporter.sendMail({
            from: 'devemdad@gmail.com', // sender address
            to, // list of receivers
            subject, // Subject line
            text: '', // plain text body
            html, // html body
        });
        console.log(result);
    }
    catch (error) { }
});
exports.sendEmail = sendEmail;
const sendBulkEmail = (recipients, html, subject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 587,
            secure: false,
            auth: {
                user: config_1.default.mail,
                pass: config_1.default.mail_password,
            },
        });
        // Convert the recipients array into a single comma-separated string
        const to = recipients.join(',');
        const result = yield transporter.sendMail({
            from: 'devemdad@gmail.com', // sender address
            to, // list of receivers
            subject, // Subject line
            text: '', // plain text body
            html, // HTML body
        });
        console.log(result);
    }
    catch (error) {
        console.error('Error sending bulk email:', error);
    }
});
exports.sendBulkEmail = sendBulkEmail;
class Email {
    constructor(user) {
        this.to = user.email || 'admin@gmail.com';
        this.firstName = user.firstName || 'admin';
        this.from = `WSF <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //Sending real email with ZOHO
            return nodemailer_1.default.createTransport({
                host: process.env.ZOHO_HOST,
                port: process.env.ZOHO_PORT,
                secure: false,
                auth: {
                    user: process.env.ZOHO_USER,
                    pass: process.env.ZOHO_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
        }
        //Sending dummy emails to mailtrap for development
        return nodemailer_1.default.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });
    }
    //Send the actual email
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            //01. Render HTML using the PUG template from the arguments
            const html = template;
            //02. Define mail options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
            };
            //03. Create a transporter and send the mail
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendEmailVerificationLink(subject, link) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #8dc63f; font-weight: bold; text-transform: capitalize;">Email Verification</h2>
        <p style="font-size: 16px; color: #333;">Kindly verify your email to complete your account registration.</p>
        <a href="${link}" style="display: inline-block; padding: 12px 20px; background-color: black; color: white; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">VERIFY NOW</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">Alternatively, you can copy this URL to your browser:</p>
        <p style="font-size: 14px; word-wrap: break-word;"><a href="${link}" style="color: #007bff; text-decoration: none;">${link}</a></p>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">The link will be valid for the next 1 hours.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Thank you for using our service.</p>
      </div>
    </body>
    </html>`;
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
            };
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendWelcome() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('welcome', 'Welcome to XYZ');
        });
    }
    /*
  send email for password reset
  */
    sendPasswordReset(OTP) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
        </div>
        <div style="padding: 20px 12px; text-align: center;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
            <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${OTP}</p>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
            yield this.send(html, 'Reset your password');
        });
    }
    sendContactMail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = `<h1 style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">Hello I want to send you a message.</p>
        </h1>`;
            yield this.send(template, 'Contact Message');
        });
    }
}
exports.default = Email;

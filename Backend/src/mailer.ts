import nodemailer from "nodemailer";

let transporterPromise = nodemailer.createTestAccount().then(account => {
  console.log("📧 Ethereal account created");
  console.log("   User:", account.user);

  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
});

export async function sendEmail(
  to: string,
  subject: string,
  body: string
) {
  const transporter = await transporterPromise;
  const info = await transporter.sendMail({
    from: '"Scheduler" <no-reply@test.com>',
    to,
    subject,
    html: body
  });

  const preview = nodemailer.getTestMessageUrl(info);

  console.log("✉️ Email sent to:", to);
  console.log("🔗 Preview URL:", preview);
}

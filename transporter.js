import nodemailer from "nodemailer";
import * as fs from "node:fs/promises";
import pc from "picocolors";

export async function toTransporter(emails, html, email, pass) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: pass,
    },
  });

  for (const receiver of emails) {
    await transporter.sendMail({
      from: email,
      to: receiver,
      subject: "Você recebeu um jogo grátis!",
      html: html,
    });

    console.log(`\n${pc.bgGreen(" LOG ")} Phishing was sent to ${receiver}\n`);
  }
}

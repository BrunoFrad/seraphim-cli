import nodemailer from "nodemailer";
import { emails, html } from "../seraphim-cli/caminho.js";
import "dotenv/config";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

for(const email of emails){
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Você recebeu um jogo grátis!",
        html: html
    });
}
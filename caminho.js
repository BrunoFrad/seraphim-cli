import * as fs from "node:fs/promises";
import path from "node:path";

// Caminho do html

const html_path = path.join(process.cwd(), "public", "steam2.html");

export const html = await fs.readFile(html_path);

// Caminho do e-mail

const email_path = path.join(process.cwd(), "public", "emails.txt");

const content_email = await fs.readFile(email_path, "utf-8");

export const emails = content_email
  .split("\n")
  .map((email) => email.trim())
  .filter((email) => email.length > 0);

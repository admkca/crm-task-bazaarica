import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Sadece POST istekleri kabul edilir." });
  }

  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email zorunludur." });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await db.execute("UPDATE users SET verification_code = ? WHERE email = ?", [
      verificationCode,
      email,
    ]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Yeni Giriş Kodu",
      text: `Yeni doğrulama kodunuz: ${verificationCode}`,
    });

    return res.status(200).json({
      success: true,
      message: "Yeni kod başarıyla gönderildi.",
    });
  } catch (error) {
    console.error("Resend-code hata:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
}

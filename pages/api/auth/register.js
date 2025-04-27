import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Sadece POST istekleri kabul edilir." });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email ve şifre zorunludur." });
  }

  try {
    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Bu email zaten kayıtlı." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await db.execute(
      "INSERT INTO users (email, password, verification_code, is_verified) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, verificationCode, false]
    );

    const linkToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-link?token=${linkToken}`;

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
      subject: "Kayıt Doğrulama Kodunuz ve Giriş Linkiniz",
      html: `
        <p>Kaydınızı tamamlamak için aşağıdaki doğrulama kodunu kullanabilirsiniz:</p>
        <h2>${verificationCode}</h2>
        <p>Veya doğrudan linke tıklayın:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p><strong>Not:</strong> Bu link 10 dakika içinde geçerlidir.</p>
      `,
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Kayıt başarılı! Kod ve link gönderildi.",
      });
  } catch (error) {
    console.error("Register hata:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
}

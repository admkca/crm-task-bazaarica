import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

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
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Şifre yanlış." });
    }

    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message: "Lütfen önce hesabınızı doğrulayın.",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    );

    return res.status(200).json({ success: true, message: "Giriş başarılı." });
  } catch (error) {
    console.error("Login hata:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
}

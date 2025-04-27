import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Sadece POST istekleri kabul edilir." });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email ve kod zorunludur." });
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

    const user = rows[0];

    if (user.verification_code !== code.trim()) {
      return res
        .status(401)
        .json({ success: false, message: "Kod hatalı ya da süresi geçmiş." });
    }

    await db.execute(
      "UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?",
      [email]
    );

    const authToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      serialize("token", authToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    );

    return res.status(200).json({
      success: true,
      message: "Doğrulama başarılı, giriş yapıldı.",
    });
  } catch (error) {
    console.error("Verify-code hata:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
}

import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { db } from "@/lib/db";

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token eksik" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.email) {
      return res.status(400).json({ message: "Geçersiz token verisi" });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      decoded.email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const user = rows[0];

    await db.execute(
      "UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?",
      [user.email]
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

    res.writeHead(302, { Location: "/dashboard" });
    res.end();
  } catch (error) {
    console.error("Doğrulama linki hatası:", error);
    res.writeHead(302, { Location: "/login?error=gecersiz" });
    res.end();
  }
}

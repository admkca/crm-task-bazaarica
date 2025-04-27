import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Sadece GET istekleri kabul edilir." });
  }

  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Giriş yapılmamış." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute(
      "SELECT id, email FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Me API hata:", error);
    return res
      .status(401)
      .json({ success: false, message: "Token geçersiz veya süresi dolmuş." });
  }
}

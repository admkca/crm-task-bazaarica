import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Sadece POST istekleri kabul edilir" });
  }

  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Giriş yapılmamış" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Başlık zorunludur" });
    }

    await db.execute(
      "INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)",
      [decoded.id, title, description]
    );

    return res.status(200).json({ message: "Görev başarıyla eklendi" });
  } catch (error) {
    console.error("Görev ekleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
}

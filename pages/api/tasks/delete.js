import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res
      .status(405)
      .json({ message: "Sadece DELETE istekleri kabul edilir." });
  }

  const { id } = req.body;
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Yetkisiz erişim." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await db.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
      id,
      decoded.id,
    ]);

    return res.status(200).json({ message: "Görev silindi." });
  } catch (error) {
    console.error("Task silme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
}

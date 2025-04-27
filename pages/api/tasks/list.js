import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ message: "Sadece GET istekleri kabul edilir" });
  }

  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Giriş yapılmamış" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [tasks] = await db.execute(
      "SELECT id, title, description, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [decoded.id]
    );

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Görev listeleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
}

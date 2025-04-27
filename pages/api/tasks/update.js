import { db } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Sadece PUT isteği kabul edilir." });
  }

  const { id, title, description } = req.body;

  if (!id || !title) {
    return res.status(400).json({ message: "ID ve Başlık zorunludur." });
  }

  try {
    await db.execute(
      "UPDATE tasks SET title = ?, description = ? WHERE id = ?",
      [title, description, id]
    );

    return res.status(200).json({ message: "Görev başarıyla güncellendi." });
  } catch (error) {
    console.error("Update Task Hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
}

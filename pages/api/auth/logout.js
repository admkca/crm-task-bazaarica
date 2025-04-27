import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Sadece POST istekleri kabul edilir." });
  }

  const expiredCookie = serialize("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // hemen sil
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.setHeader("Set-Cookie", expiredCookie);
  return res.status(200).json({ success: true, message: "Çıkış yapıldı." });
}

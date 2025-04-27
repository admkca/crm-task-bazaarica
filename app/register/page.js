"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("email", email); // ✅ Emaili localStorage'a kaydet
        setMessage(
          "✅ Kayıt başarılı! Kod ve link gönderildi. Şimdi doğrulama ekranına yönlendiriliyorsunuz..."
        );
        setTimeout(() => {
          router.push("/verify"); // ✅ verify sayfasına yönlendir
        }, 1500);
      } else {
        setMessage(data.message || "❌ Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kayıt sırasında hata:", error);
      setMessage("❌ Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container d-flex justify-content-center align-items-center min-vh-100'>
      <div
        className='card p-4 shadow'
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className='text-center mb-4'>Kayıt Ol</h2>
        <form onSubmit={handleRegister}>
          <div className='mb-3'>
            <label className='form-label'>Email</label>
            <input
              type='email'
              className='form-control'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='mb-3'>
            <label className='form-label'>Şifre</label>
            <input
              type='password'
              className='form-control'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type='submit'
            className='btn btn-success w-100'
            disabled={loading}
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>
        {message && <div className='alert alert-info mt-3'>{message}</div>}
      </div>
    </div>
  );
}

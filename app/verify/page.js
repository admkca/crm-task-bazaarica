"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/login"); // ✅ Email yoksa giriş ekranına yönlendir
    }
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Doğrulama başarılı, yönlendiriliyorsunuz...");
        localStorage.removeItem("email"); // ✅ Email bilgisini artık silebiliriz
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setMessage(data.message || "❌ Kod yanlış veya süresi doldu.");
      }
    } catch (error) {
      console.error("Doğrulama hatası:", error);
      setMessage("❌ Sunucu hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Yeni kod başarıyla gönderildi.");
      } else {
        setMessage(data.message || "❌ Kod gönderilemedi.");
      }
    } catch (error) {
      console.error("Kod gönderme hatası:", error);
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
        <h3 className='text-center mb-3'>Doğrulama Kodu</h3>
        <p className='text-muted text-center'>
          {email} adresine gönderilen kodu giriniz.
        </p>
        <form onSubmit={handleVerify}>
          <div className='mb-3'>
            <input
              type='text'
              className='form-control text-center'
              placeholder='6 Haneli Kod'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button
            type='submit'
            className='btn btn-primary w-100'
            disabled={loading}
          >
            {loading ? "Doğrulanıyor..." : "Doğrula"}
          </button>
        </form>
        <button
          onClick={handleResendCode}
          className='btn btn-link mt-3'
          disabled={loading}
        >
          Kodu Tekrar Gönder
        </button>
        {message && (
          <div className='alert alert-info mt-3 text-center'>{message}</div>
        )}
      </div>
    </div>
  );
}

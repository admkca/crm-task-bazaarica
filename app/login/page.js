"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Kullanıcı zaten giriş yaptıysa dashboard'a yönlendir
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          router.push("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        setCheckingAuth(false);
      }
    };

    checkLogin();
  }, [router]);

  // Giriş işlemi
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Giriş başarılı, yönlendiriliyorsunuz...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000); // 1 saniye bekleyip yönlendir
      } else {
        setMessage(data.message || "❌ Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Login hatası:", error);
      setMessage("❌ Sunucu hatası.");
    }
  };

  if (checkingAuth) {
    return (
      <div className='container text-center mt-5'>
        <div className='spinner-border text-primary' role='status' />
        <p className='mt-3'>Oturum kontrol ediliyor...</p>
      </div>
    );
  }

  return (
    <div className='container d-flex justify-content-center align-items-center min-vh-100'>
      <div
        className='card p-4 shadow'
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className='text-center mb-4'>Giriş Yap</h2>
        <form onSubmit={handleLogin}>
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
          <button type='submit' className='btn btn-primary w-100'>
            Giriş Yap
          </button>
        </form>
        {message && <div className='alert alert-info mt-3'>{message}</div>}
      </div>
    </div>
  );
}

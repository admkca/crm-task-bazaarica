"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Giriş kontrolü
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      setIsLoggedIn(res.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        localStorage.removeItem("email");
        setIsLoggedIn(false);
        router.push("/login");
      } else {
        console.error("Çıkış başarısız.");
      }
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <nav className='navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm'>
      <div className='container'>
        <Link href='/' className='navbar-brand fw-bold'>
          CRM App
        </Link>

        <div className='d-flex gap-2'>
          {isLoggedIn ? (
            <>
              <Link href='/dashboard' className='btn btn-outline-primary'>
                Dashboard
              </Link>
              <button onClick={handleLogout} className='btn btn-danger'>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link href='/login' className='btn btn-primary'>
                Giriş Yap
              </Link>
              <Link href='/register' className='btn btn-outline-secondary'>
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

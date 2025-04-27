"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className='container d-flex justify-content-center align-items-center min-vh-100'>
      <div className='text-center'>
        <h1 className='mb-4 fw-bold'>CRM Giriş Sistemi</h1>
        <p className='lead mb-4'>
          {user
            ? `Hoş geldin ${user.email}! Dashboard’a gitmek için butona tıkla.`
            : "Devam etmek için lütfen giriş yapınız."}
        </p>
        {user ? (
          <button
            onClick={() => router.push("/dashboard")}
            className='btn btn-primary'
          >
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className='btn btn-outline-primary'
          >
            Giriş Yap
          </button>
        )}
      </div>
    </div>
  );
}

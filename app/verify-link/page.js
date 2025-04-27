"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/login?error=gecersiz");
      return;
    }

    // Token varsa backend verify-link API'ye yönlendiriyoruz
    window.location.href = `/api/auth/verify-link?token=${token}`;
  }, [router, searchParams]);

  return (
    <div className='container text-center mt-5'>
      <div className='spinner-border text-primary' role='status' />
      <p className='mt-3'>Doğrulama yapılıyor, lütfen bekleyin...</p>
    </div>
  );
}

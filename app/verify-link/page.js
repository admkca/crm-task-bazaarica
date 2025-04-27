"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Yeni Component: VerifyLinkContent
function VerifyLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/login?error=gecersiz");
      return;
    }

    // Token varsa backend verify-link API'ye yönlendiriyoruz
    window.location.href = `/api/auth/verify-link?token=${token}`;
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className='container text-center mt-5'>
        <div className='spinner-border text-primary' role='status' />
        <p className='mt-3'>Doğrulama yapılıyor, lütfen bekleyin...</p>
      </div>
    );
  }

  return null;
}

export default function VerifyLinkPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <VerifyLinkContent />
    </Suspense>
  );
}

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function TestKoneksiPage() {
  const [status, setStatus] = useState("Menghubungkan...")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? `Gagal: ${error.message}` : "Terhubung ke Supabase")
    })
  }, [])

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Test Koneksi Supabase</h1>
      <p>{status}</p>
      <p style={{ color: "#888", fontSize: 12 }}>
        URL project: {process.env.NEXT_PUBLIC_SUPABASE_URL}
      </p>
    </main>
  )
}

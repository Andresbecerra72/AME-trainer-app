"use client"

import { supabaseBrowserClient } from "@/lib/supabase/client"

export async function triggerParseImportJobClient(jobId: string) {
  
  const supabase = supabaseBrowserClient
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-import-job`
  const res = await supabase.functions.invoke('parse-import-job', 
    {
       body: { name: jobId },
    })



  if (res.error) {
   
    throw new Error(res.error.message ?? `Failed to trigger parse job (${res.response?.status})`)
  }

  return res.data
}


export async function triggerParseImportJobTOKEN(jobId: string) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-import-job`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY}`,
      apikey: process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY || "",
    },
    body: JSON.stringify({ jobId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? `Failed to trigger parse job (${res.status})`)
  }

  return await res.json()
}

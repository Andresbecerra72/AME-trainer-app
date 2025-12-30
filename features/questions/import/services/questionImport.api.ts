"use client"

import { supabaseBrowserClient } from "@/lib/supabase/client"
import type { QuestionImportJob } from "../types"

export async function createImportJob(input: {
  userId: string
  filePath: string
  fileName?: string
  fileMime?: string
}): Promise<QuestionImportJob> {
  const { data, error } = await supabaseBrowserClient
    .from("question_imports")
    .insert({
      user_id: input.userId,
      file_path: input.filePath,
      file_name: input.fileName ?? null,
      file_mime: input.fileMime ?? null,
      status: "pending",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return data as QuestionImportJob
}

export async function getImportJob(jobId: string): Promise<QuestionImportJob> {
  const { data, error } = await supabaseBrowserClient
    .from("question_imports")
    .select("*")
    .eq("id", jobId)
    .single()

  if (error) throw new Error(error.message)
  return data as QuestionImportJob
}

export async function uploadImportFile(input: {
  userId: string
  file: File
  jobId: string
}) {
  const path = `${input.userId}/${input.jobId}/${input.file.name}`

  const { error } = await supabaseBrowserClient.storage
    .from("question-imports")
    .upload(path, input.file, { upsert: true })

  if (error) throw new Error(error.message)
  return { path }
}
//sbp_2af83c25c987bfa83ce92043cc8be93bc4af64d0
//my_token
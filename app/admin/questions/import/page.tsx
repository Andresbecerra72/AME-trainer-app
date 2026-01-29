"use client"

import { QuestionImportForm } from "@/features/questions/import"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Info } from "lucide-react"

export default function QuestionImportPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Import Questions</h1>
        <p className="text-muted-foreground">
          Upload PDF files containing exam questions to automatically extract and process them.
        </p>
      </div>

      {/* Notification Permission Alert */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Enable browser notifications to receive alerts when your import completes, 
          even if you navigate away from this page.
        </AlertDescription>
      </Alert>

      {/* Import Form */}
      <QuestionImportForm />

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5" />
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground">1. Upload PDF</p>
            <p>Select a PDF file containing exam questions. The file will be processed locally first.</p>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-foreground">2. Text Extraction</p>
            <p>Text is extracted from the PDF using advanced OCR technology.</p>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-foreground">3. AI Processing</p>
            <p>
              Our AI analyzes the text to identify questions, answers, and explanations. 
              Large files are processed in batches (2 pages at a time).
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-foreground">4. Review & Approve</p>
            <p>Once complete, you can review the extracted questions before adding them to your question bank.</p>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="font-medium text-yellow-900">⚠️ Note:</p>
            <p className="mt-1 text-yellow-800">
              Some pages may timeout if processing takes longer than 60 seconds. 
              Don't worry - the system will continue processing remaining pages and you'll see warnings if this occurs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

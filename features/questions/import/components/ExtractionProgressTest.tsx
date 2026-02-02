"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { extractTextFromFile, type ExtractionProgress } from "../utils/textExtraction"
import { ExtractionProgressBar } from "./ExtractionProgressBar"

/**
 * Componente de prueba standalone para verificar que el progreso de extracción funciona
 * Usar este componente para debuggear problemas con la extracción
 */
export function ExtractionProgressTest() {
  const [progress, setProgress] = useState<ExtractionProgress | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsExtracting(true)
    setError("")
    setResult("")
    
    // Initialize progress
    setProgress({
      currentPage: 0,
      totalPages: 0,
      percentage: 0,
      method: 'pdf',
      message: 'Starting extraction...'
    })

    try {
      console.log('🚀 Starting extraction for:', file.name)
      
      const extractionResult = await extractTextFromFile(file, (prog) => {
        console.log('📊 Progress update:', prog)
        setProgress(prog)
      })

      console.log('✅ Extraction complete:', {
        textLength: extractionResult.text.length,
        pagesCount: extractionResult.pages?.length,
        method: extractionResult.method
      })

      setResult(`✅ Success!\n\nMethod: ${extractionResult.method}\nText Length: ${extractionResult.text.length} chars\nPages: ${extractionResult.pages?.length || 1}`)
      setIsExtracting(false)
      
      // Keep progress visible for 2 seconds
      setTimeout(() => setProgress(null), 2000)
    } catch (err: any) {
      console.error('❌ Extraction error:', err)
      setError(err.message || 'Extraction failed')
      setIsExtracting(false)
      setProgress(null)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">🧪 Extraction Progress Test</h2>
        <p className="text-sm text-muted-foreground">
          Use this component to test text extraction progress independently
        </p>
      </div>

      <div>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileSelect}
          disabled={isExtracting}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {progress && (
        <ExtractionProgressBar progress={progress} />
      )}

      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>📝 Instructions:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Open browser DevTools (F12) → Console tab</li>
          <li>Select a PDF or image file</li>
          <li>Watch the console logs and progress bar</li>
          <li>If you see logs but no progress bar, there's a rendering issue</li>
          <li>If you don't see logs, there's an extraction issue</li>
        </ul>
      </div>
    </Card>
  )
}

/**
 * Ejemplo de Implementación del Cliente
 * Hook para importar preguntas con polling automático
 */

import { useState, useCallback, useRef } from 'react'
import { uploadTextExtract, pollImportJobStatus } from '../server/questionImport.actions'

interface ImportProgress {
  jobId: string | null
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'failed'
  progress: number // 0-100
  questionsExtracted: number
  error: string | null
  background: boolean // true si está procesando en background
}

export function useQuestionImport() {
  const [state, setState] = useState<ImportProgress>({
    jobId: null,
    status: 'idle',
    progress: 0,
    questionsExtracted: 0,
    error: null,
    background: false
  })
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Limpiar polling al desmontar
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])
  
  // Polling del estado del job
  const startPolling = useCallback((jobId: string) => {
    stopPolling()
    
    const poll = async () => {
      try {
        const status = await pollImportJobStatus(jobId)
        
        setState(prev => ({
          ...prev,
          status: status.status as any,
          progress: status.progress?.percentage || 0,
          questionsExtracted: status.questionsExtracted || 0,
          error: status.error || null
        }))
        
        if (status.done) {
          stopPolling()
          
          if (status.status === 'failed') {
            console.error('Import failed:', status.error)
          } else {
            console.log(`Import completed: ${status.questionsExtracted} questions extracted`)
          }
        }
      } catch (error: any) {
        console.error('Polling error:', error)
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: error.message || 'Polling failed'
        }))
        stopPolling()
      }
    }
    
    // Polling inicial inmediato
    poll()
    
    // Polling cada 2 segundos
    pollingIntervalRef.current = setInterval(poll, 2000)
  }, [stopPolling])
  
  // Función principal de importación
  const importQuestions = useCallback(async (
    file: File,
    userId: string,
    rawText: string,
    rawPages?: string[]
  ) => {
    try {
      setState({
        jobId: null,
        status: 'uploading',
        progress: 0,
        questionsExtracted: 0,
        error: null,
        background: false
      })
      
      // 1. Subir archivo y crear job
      const job = await uploadTextExtract({
        file,
        userId,
        rawText,
        rawPages,
        extractionMethod: file.type === 'application/pdf' ? 'pdf' : 'ocr'
      })
      
      console.log('Job created:', job.id)
      
      setState(prev => ({
        ...prev,
        jobId: job.id,
        status: 'processing'
      }))
      
      // 2. Iniciar polling del estado
      startPolling(job.id)
      
      return job
      
    } catch (error: any) {
      console.error('Import error:', error)
      
      setState({
        jobId: null,
        status: 'failed',
        progress: 0,
        questionsExtracted: 0,
        error: error.message || 'Upload failed',
        background: false
      })
      
      throw error
    }
  }, [startPolling])
  
  // Reset del estado
  const reset = useCallback(() => {
    stopPolling()
    setState({
      jobId: null,
      status: 'idle',
      progress: 0,
      questionsExtracted: 0,
      error: null,
      background: false
    })
  }, [stopPolling])
  
  return {
    ...state,
    importQuestions,
    reset,
    isLoading: state.status === 'uploading' || state.status === 'processing'
  }
}

/**
 * Ejemplo de uso en un componente
 */
export function ImportQuestionsExample() {
  const { 
    status, 
    progress, 
    questionsExtracted, 
    error, 
    isLoading,
    importQuestions,
    reset 
  } = useQuestionImport()
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      // Extraer texto del PDF (usando PDF.js o similar)
      const { text, pages } = await extractTextFromPDF(file)
      
      // Importar con el hook
      await importQuestions(file, 'user-id', text, pages)
      
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  return (
    <div>
      <input 
        type="file" 
        accept=".pdf,.txt"
        onChange={handleFileSelect}
        disabled={isLoading}
      />
      
      {status === 'processing' && (
        <div>
          <p>Procesando archivo...</p>
          <progress value={progress} max={100} />
          <p>{progress}% - {questionsExtracted} preguntas extraídas</p>
        </div>
      )}
      
      {status === 'ready' && (
        <div>
          <p>✅ Completado: {questionsExtracted} preguntas</p>
          <button onClick={reset}>Importar otro archivo</button>
        </div>
      )}
      
      {status === 'failed' && (
        <div>
          <p>❌ Error: {error}</p>
          <button onClick={reset}>Reintentar</button>
        </div>
      )}
    </div>
  )
}

// Helper para extraer texto de PDF (implementar con PDF.js)
async function extractTextFromPDF(file: File): Promise<{ text: string; pages: string[] }> {
  // Implementación con PDF.js
  // Ver: https://mozilla.github.io/pdf.js/
  throw new Error('Implement PDF.js extraction')
}

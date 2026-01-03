/**
 * Text Extraction Utilities
 * Provides client-side text extraction for PDFs and images using:
 * - pdfjs-dist: PDF text extraction (loaded dynamically)
 * - tesseract.js: OCR for images (loaded dynamically)
 */

/**
 * Extract text from a PDF file
 * Uses pdf.js to parse all pages and extract text content
 * Falls back to OCR if the PDF is image-based
 * @param file - PDF file to extract text from
 * @returns Object with fullText (all pages combined) and pages array (individual pages)
 */
export async function extractPdfText(file: File): Promise<{
  fullText: string
  pages: string[]
}> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Configure pdf.js worker using local static file
    // Worker is served from public folder for better performance and reliability
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    console.log(`PDF loaded: ${pdf.numPages} pages`)
    
    // Extract text from all pages
    const textPromises: Promise<string>[] = []
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      textPromises.push(
        pdf.getPage(pageNum).then(async (page) => {
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          
          console.log(`Page ${pageNum}: extracted ${pageText.length} characters`)
          return pageText
        })
      )
    }
    
    // Wait for all pages to be processed
    const pageTexts = await Promise.all(textPromises)
    
    // Filter out empty pages
    const nonEmptyPages = pageTexts.filter(text => text.trim().length > 0)
    
    // Combine all pages with double line break separator
    const fullText = nonEmptyPages.join('\n\n')
    
    console.log(`Total extracted: ${fullText.length} characters from ${pdf.numPages} pages`)
    console.log(`Pages breakdown: ${nonEmptyPages.map((p, i) => `P${i+1}:${p.length}ch`).join(', ')}`)
    
    // Check if PDF is image-based (no text extracted)
    if (fullText.trim().length === 0) {
      console.warn('⚠️ No text extracted - PDF appears to be image-based. Attempting OCR...')
      return await extractPdfWithOCR(file, pdf)
    }
    
    return {
      fullText,
      pages: nonEmptyPages
    }
  } catch (error: any) {
    console.error('PDF text extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Extract text from image-based PDF using OCR
 * Renders each page as an image and applies Tesseract OCR
 */
async function extractPdfWithOCR(file: File, pdf: any): Promise<{
  fullText: string
  pages: string[]
}> {
  console.log('🔍 Starting OCR extraction for image-based PDF...')
  
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR progress: ${Math.round(m.progress * 100)}%`)
      }
    },
  })
  
  try {
    const pages: string[] = []
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`📄 Processing page ${pageNum}/${pdf.numPages} with OCR...`)
      
      // Get page
      const page = await pdf.getPage(pageNum)
      
      // Set up canvas for rendering
      const scale = 2.0 // Higher scale = better OCR accuracy
      const viewport = page.getViewport({ scale })
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png')
      })
      
      const imageUrl = URL.createObjectURL(blob)
      
      // Perform OCR on rendered page
      const { data } = await worker.recognize(imageUrl)
      URL.revokeObjectURL(imageUrl)
      
      const pageText = data.text.trim()
      console.log(`✓ Page ${pageNum}: OCR extracted ${pageText.length} characters (confidence: ${Math.round(data.confidence)}%)`)
      
      if (pageText.length > 0) {
        pages.push(pageText)
      }
    }
    
    await worker.terminate()
    
    const fullText = pages.join('\n\n')
    console.log(`✓ OCR complete: ${fullText.length} total characters from ${pages.length} pages`)
    
    if (fullText.length === 0) {
      throw new Error('No text could be extracted even with OCR. The PDF might be corrupted or contain no readable content.')
    }
    
    return {
      fullText,
      pages
    }
  } catch (error: any) {
    await worker.terminate()
    throw new Error(`OCR extraction failed: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Extract text from an image file using OCR
 * Uses Tesseract.js for optical character recognition
 * @param file - Image file to extract text from
 * @returns Extracted text from image
 */
export async function extractImageText(file: File): Promise<string> {
  let worker: Awaited<ReturnType<typeof import('tesseract.js').createWorker>> | null = null
  
  try {
    console.log('Initializing Tesseract OCR worker...')
    
    // Dynamic import to avoid SSR issues
    const { createWorker } = await import('tesseract.js')
    
    // Create and initialize Tesseract worker
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })
    
    // Convert File to image data
    const imageData = await file.arrayBuffer()
    const blob = new Blob([imageData], { type: file.type })
    const imageUrl = URL.createObjectURL(blob)
    
    console.log('Starting OCR recognition...')
    
    // Perform OCR
    const { data } = await worker.recognize(imageUrl)
    
    // Clean up
    URL.revokeObjectURL(imageUrl)
    await worker.terminate()
    
    const extractedText = data.text.trim()
    console.log(`OCR completed: extracted ${extractedText.length} characters`)
    console.log(`Confidence: ${Math.round(data.confidence)}%`)
    
    if (extractedText.length === 0) {
      throw new Error('No text could be extracted from the image')
    }
    
    if (data.confidence < 30) {
      console.warn(`Low OCR confidence: ${Math.round(data.confidence)}%`)
    }
    
    return extractedText
  } catch (error: any) {
    console.error('Image OCR error:', error)
    
    // Clean up worker if it exists
    if (worker) {
      try {
        await worker.terminate()
      } catch {
        // Ignore termination errors
      }
    }
    
    throw new Error(`Failed to extract text from image: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Extract text from any supported file (PDF or image)
 * Automatically detects file type and uses appropriate extraction method
 * @param file - File to extract text from (PDF or image)
 * @returns Extracted text and metadata
 */
export async function extractTextFromFile(file: File): Promise<{
  text: string
  method: 'pdf' | 'ocr'
  pages?: string[]
  confidence?: number
}> {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  // Determine file type
  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
  const isImage = fileType.startsWith('image/')
  
  if (!isPdf && !isImage) {
    throw new Error(`Unsupported file type: ${file.type}. Only PDF and image files are supported.`)
  }
  
  if (isPdf) {
    console.log('Detected PDF file, using pdf.js extraction')
    const { fullText, pages } = await extractPdfText(file)
    return {
      text: fullText,
      method: 'pdf',
      pages, // Include individual pages array
    }
  } else {
    console.log('Detected image file, using Tesseract OCR')
    const text = await extractImageText(file)
    return {
      text,
      method: 'ocr',
      pages: [text], // Single page for images
    }
  }
}

/**
 * Validate extracted text for question parsing
 * Ensures text is suitable for question extraction
 * @param text - Extracted text to validate
 * @returns Validation result with suggestions
 */
export function validateExtractedText(text: string): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check minimum length
  if (text.length < 50) {
    issues.push('Text is too short (less than 50 characters)')
    suggestions.push('Ensure the file contains readable text content')
  }
  
  // Check for common question indicators
  const hasQuestionMarks = (text.match(/\?/g) || []).length >= 1
  const hasOptions = /[A-D][\)\.]/.test(text) || /option [A-D]/i.test(text)
  
  if (!hasQuestionMarks && !hasOptions) {
    issues.push('No question patterns detected')
    suggestions.push('Ensure the document contains questions with options (A, B, C, D)')
  }
  
  // Check for excessive gibberish (OCR artifacts)
  const words = text.split(/\s+/)
  const shortWords = words.filter(w => w.length <= 2).length
  const gibberishRatio = shortWords / words.length
  
  if (gibberishRatio > 0.5) {
    issues.push('High amount of unreadable text detected (possible OCR errors)')
    suggestions.push('Try using a higher quality image or PDF with clear text')
  }
  
  // Check for reasonable line breaks
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 3) {
    issues.push('Very few line breaks detected')
    suggestions.push('Document might need better formatting or structure')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  }
}

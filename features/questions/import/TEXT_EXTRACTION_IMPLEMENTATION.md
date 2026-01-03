# Text Extraction Implementation

## Overview

This implementation uses **client-side text extraction** for PDFs and images before sending the text to the Edge Function for question parsing. This approach provides:

- ✅ **Better Performance**: Text extraction happens in the browser, reducing server load
- ✅ **Privacy**: File content is processed locally before uploading
- ✅ **Reliability**: Works with any file type (PDFs and images)
- ✅ **Simplicity**: Edge Function only needs to parse text, not handle files

## Architecture

```
User Browser                    Next.js Server              Supabase Edge Function
    │                                  │                             │
    ├─► 1. Select PDF/Image            │                             │
    │                                  │                             │
    ├─► 2. Extract text locally        │                             │
    │   (pdf.js or Tesseract)          │                             │
    │                                  │                             │
    ├─► 3. Send extracted text ────────►                             │
    │                                  │                             │
    │                                  ├─► 4. Create job             │
    │                                  │   with raw_text             │
    │                                  │                             │
    │                                  ├─► 5. Trigger Edge ──────────►
    │                                  │      Function               │
    │                                  │                             │
    │                                  │                         6. Parse
    │                                  │                         questions
    │                                  │                         (OpenAI)
    │                                  │                             │
    │                                  ◄─────── 7. Return results ───┤
    │                                  │                             │
    ◄──────── 8. Poll for results ─────┤                             │
    │                                  │                             │
    └─► 9. Review & submit             │                             │
```

## Components

### 1. Text Extraction Utilities
**File**: `features/questions/import/utils/textExtraction.ts`

Provides functions for extracting text from files:

- `extractPdfText(file)` - Uses **pdf.js** to extract text from PDFs
- `extractImageText(file)` - Uses **Tesseract.js** for OCR on images
- `extractTextFromFile(file)` - Auto-detects file type and uses appropriate method
- `validateExtractedText(text)` - Validates extracted text before sending

```typescript
import { extractTextFromFile } from '@/features/questions/import/utils/textExtraction'

// Extract text from any file
const result = await extractTextFromFile(file)
console.log('Method:', result.method) // 'pdf' or 'ocr'
console.log('Text:', result.text)
```

### 2. Client Hook
**File**: `features/questions/import/hooks/useQuestionImportJob.ts`

Manages the file upload flow with client-side extraction:

```typescript
const { 
  job,              // Current import job
  isExtracting,     // Extracting text from file
  isUploading,      // Uploading to server
  extractionProgress, // Progress message
  error,            // Error message if any
  startUpload       // Function to start upload
} = useQuestionImportJob()

// Usage
await startUpload(pdfFile)
```

**Flow**:
1. Extract text from file (client-side)
2. Validate extracted text
3. Send text + metadata to server
4. Poll for results

### 3. Server Action
**File**: `features/questions/import/server/questionImport.actions.ts`

New function: `uploadTextExtract()`

```typescript
await uploadTextExtract({
  file: File,           // Original file (for reference)
  userId: string,       // User ID
  rawText: string,      // Pre-extracted text
  extractionMethod: 'pdf' | 'ocr'  // Method used
})
```

**Flow**:
1. Create import job with `raw_text`
2. Upload file to Storage (for audit/reference)
3. Trigger Edge Function with job ID

### 4. Edge Function
**File**: `supabase/functions/parse-import-job/index.ts`

**Simplified**: Only processes `raw_text`, no file handling.

**Requirements**:
- `raw_text` must be provided and non-empty
- Uses `gpt-4-turbo-preview` for text-only processing
- Returns parsed questions in JSON format

## Usage

### In React Component

```tsx
import { useQuestionImportJob } from '@/features/questions/import/hooks/useQuestionImportJob'

function UploadComponent() {
  const { 
    job, 
    isExtracting, 
    isUploading, 
    extractionProgress, 
    error, 
    startUpload 
  } = useQuestionImportJob()

  const handleFileSelect = async (file: File) => {
    await startUpload(file)
  }

  return (
    <div>
      <input 
        type="file" 
        accept="application/pdf,image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        disabled={isExtracting || isUploading}
      />
      
      {isExtracting && <p>Extracting: {extractionProgress}</p>}
      {isUploading && <p>Uploading...</p>}
      {error && <p className="error">{error}</p>}
      
      {job?.status === 'ready' && (
        <p>Found {job.result?.length} questions!</p>
      )}
    </div>
  )
}
```

## Configuration

### PDF.js Worker

The worker is loaded from CDN automatically:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

For offline use, download the worker and update the path.

### Tesseract.js

Language: English (`eng`)  
Logger: Enabled (shows progress)

To add more languages:

```typescript
const worker = await createWorker(['eng', 'spa'], 1)
```

## Dependencies

Added to `package.json`:

```json
{
  "dependencies": {
    "pdfjs-dist": "^4.x.x",    // PDF text extraction
    "tesseract.js": "^5.x.x"    // Image OCR
  }
}
```

Install: `npm install pdfjs-dist tesseract.js`

## Error Handling

The implementation includes comprehensive error handling:

### Extraction Errors
- PDF without text → "No text could be extracted from the PDF. The PDF might be image-based."
- Image without text → "No text could be extracted from the image"
- Low OCR confidence → Warning logged

### Validation Errors
- Text too short (< 50 chars)
- No question patterns detected
- High gibberish ratio (OCR artifacts)

### Edge Function Errors
- Missing `raw_text` → 400 error with clear message
- OpenAI API errors → Detailed error messages
- Truncated responses → Detected and reported

## Performance

### PDF Extraction (pdf.js)
- **Speed**: ~1-2 seconds per 10-page document
- **Memory**: Low (streams page by page)
- **Quality**: Excellent for text-based PDFs

### Image OCR (Tesseract.js)
- **Speed**: ~3-5 seconds per image
- **Memory**: Moderate (loads model once)
- **Quality**: 70-95% confidence depending on image quality

### Tips for Best Results
- Use clear, high-resolution images
- Avoid handwritten text
- Ensure good contrast
- Use text-based PDFs when possible

## Testing

### Test PDF Upload

```typescript
const pdfFile = new File([pdfBlob], 'questions.pdf', { 
  type: 'application/pdf' 
})

await startUpload(pdfFile)
```

### Test Image Upload (OCR)

```typescript
const imageFile = new File([imageBlob], 'questions.jpg', { 
  type: 'image/jpeg' 
})

await startUpload(imageFile)
```

### Expected Results
- PDF: Text extracted from all pages
- Image: Text extracted via OCR
- Both: Questions parsed by OpenAI

## Troubleshooting

### "No text extracted"
- **PDF**: May be image-based (scanned). Use OCR or convert to text-based PDF.
- **Image**: May have poor quality. Try higher resolution or better contrast.

### "Text validation failed"
- Check that document contains questions with options (A, B, C, D)
- Ensure text is not corrupted or gibberish

### "Failed to process"
- Check browser console for detailed errors
- Verify OpenAI API key is set in Edge Function
- Check Supabase logs for server errors

## Migration Notes

### Old Implementation
- Server-side PDF extraction (pdfreader)
- File URLs and base64 conversion
- Complex multi-format handling in Edge Function

### New Implementation
- Client-side extraction (pdf.js + Tesseract)
- Simple text-only Edge Function
- Better error messages and progress tracking

### Breaking Changes
- `uploadAndExtractPdf()` is deprecated
- Use `uploadTextExtract()` instead
- Edge Function now requires `raw_text`

## Future Improvements

- [ ] Add support for DOCX files
- [ ] Batch processing for multiple files
- [ ] Progress bars for OCR operations
- [ ] Offline mode with local worker
- [ ] Custom training data for Tesseract
- [ ] Support for more languages

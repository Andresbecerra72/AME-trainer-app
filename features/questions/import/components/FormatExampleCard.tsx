"use client"

import { useState } from "react"
import { MobileCard } from "@/components/mobile-card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const EXAMPLE_TEXT = `Q: ¿Cuál es la capital de Francia?
A) Madrid
B) París
C) Londres
D) Berlín
Answer: B

Q: ¿Cuántos continentes hay en la Tierra?
A) 5
B) 6
C) 7
D) 8
Answer: C

Q: ¿Qué es HTTP?
A) Un lenguaje de programación
B) Un protocolo de transferencia de hipertexto
C) Un sistema operativo
D) Una base de datos
Answer: B
Explanation: HTTP (HyperText Transfer Protocol) es el protocolo utilizado para la transferencia de información en la World Wide Web.`

export function FormatExampleCard() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_TEXT)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Example text copied to clipboard. Paste it in the text area to try.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      })
    }
  }

  return (
    <MobileCard className="bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2 items-start">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium text-foreground text-sm">Expected Format:</p>
            <div className="text-xs text-muted-foreground font-mono bg-background p-3 rounded-lg space-y-0.5 leading-relaxed">
              <p className="text-primary font-semibold">Q: Your question text here?</p>
              <p>A) First option</p>
              <p>B) Second option</p>
              <p>C) Third option</p>
              <p>D) Fourth option</p>
              <p className="text-green-600 dark:text-green-400 font-semibold">Answer: A</p>
              <p className="text-xs opacity-60 italic mt-1">(blank line between questions)</p>
              <p className="text-xs opacity-60 italic">Explanation: optional</p>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p className="font-medium text-foreground">Tips:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-1">
          <li>Separate questions with a blank line</li>
          <li>Use Q: or Question: to start</li>
          <li>Options can use ), ., or :</li>
          <li>Answer must be A, B, C, or D</li>
        </ul>
      </div>
    </MobileCard>
  )
}

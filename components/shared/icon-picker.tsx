"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Lista de íconos populares de Lucide
const popularIcons = [
  "Plane",
  "Book",
  "GraduationCap",
  "Wrench",
  "Settings",
  "Gauge",
  "Radio",
  "Satellite",
  "Navigation",
  "Wind",
  "CloudRain",
  "Compass",
  "Map",
  "Route",
  "Fuel",
  "CircuitBoard",
  "Cpu",
  "Monitor",
  "Signal",
  "Wifi",
  "Target",
  "Zap",
  "Activity",
  "Briefcase",
  "Clipboard",
  "FileText",
  "Folder",
  "Star",
  "Award",
  "Shield",
  "AlertTriangle",
  "Info",
  "HelpCircle",
]

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [customIcon, setCustomIcon] = useState(value || "")

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent
  }

  const renderIcon = (iconName: string) => {
    // Si es un emoji
    if (iconName && /[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
      return <span className="text-xl">{iconName}</span>
    }
    
    // Si es un ícono de Lucide
    const IconComponent = getIconComponent(iconName)
    if (IconComponent) {
      return <IconComponent className="h-4 w-4" />
    }
    
    return null
  }

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName)
    setCustomIcon(iconName)
    setOpen(false)
  }

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setCustomIcon(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  {value && renderIcon(value)}
                  <span className="truncate">
                    {value || "Select an icon..."}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search icons..." />
                <CommandList>
                  <CommandEmpty>No icon found.</CommandEmpty>
                  <CommandGroup heading="Popular Icons">
                    {popularIcons.map((iconName) => {
                      const IconComponent = getIconComponent(iconName)
                      return (
                        <CommandItem
                          key={iconName}
                          value={iconName}
                          onSelect={() => handleSelectIcon(iconName)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            <span>{iconName}</span>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              value === iconName ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandGroup heading="Aviation & Maintenance">
                    {["✈️", "🛩️", "🚁", "🛫", "🛬", "🔧", "🔨", "⚙️", "🛠️", "🧰", "⚠️", "🚨", "🛡️", "📋", "📄", "📑", "📊", "📈", "⚡", "🔌", "🔋", "📡", "🛰️", "🧭", "📚", "🎓", "🏆", "✅", "❌", "🔒", "🗂️", "💨"].map((emoji) => (
                      <CommandItem
                        key={emoji}
                        value={emoji}
                        onSelect={() => handleSelectIcon(emoji)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xl">{emoji}</span>
                          <span>Emoji</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            value === emoji ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {value && (
          <div className="w-12 h-10 border rounded-md flex items-center justify-center bg-muted">
            {renderIcon(value)}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-icon" className="text-xs text-muted-foreground">
          Or enter manually (emoji or Lucide icon name):
        </Label>
        <Input
          id="custom-icon"
          value={customIcon}
          onChange={handleCustomInput}
          placeholder="e.g., ✈️ or Plane"
          className="h-9"
        />
      </div>
    </div>
  )
}

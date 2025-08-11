"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLocale("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          {t.english}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLocale("zh")}
          className={locale === "zh" ? "bg-accent" : ""}
        >
          {t.chinese}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
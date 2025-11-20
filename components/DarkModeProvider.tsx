"use client"

import type React from "react"
import { useEffect } from "react"

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true"

    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Listen for changes
    const handleStorageChange = () => {
      const isDarkMode = localStorage.getItem("darkMode") === "true"
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return children
}

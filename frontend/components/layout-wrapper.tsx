"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import OpeningScene from "@/components/opening-scene"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [showOpening, setShowOpening] = useState(true)

  // Check if user has seen the opening scene before (in this session)
  useEffect(() => {
    const hasSeenOpening = sessionStorage.getItem('hasSeenOpening')
    if (hasSeenOpening) {
      setShowOpening(false)
    }
  }, [])

  const handleOpeningComplete = () => {
    setShowOpening(false)
    sessionStorage.setItem('hasSeenOpening', 'true')
  }

  if (showOpening) {
    return <OpeningScene onComplete={handleOpeningComplete} />
  }

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}

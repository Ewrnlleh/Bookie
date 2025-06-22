"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface OpeningSceneProps {
  onComplete: () => void
}

export default function OpeningScene({ onComplete }: OpeningSceneProps) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'complete'>('logo')

  useEffect(() => {
    // Show logo and name for 2.5 seconds
    const logoTimer = setTimeout(() => {
      setPhase('tagline')
    }, 2500)

    return () => clearTimeout(logoTimer)
  }, [])

  useEffect(() => {
    if (phase === 'tagline') {
      // Show tagline for 2.5 seconds, then complete
      const taglineTimer = setTimeout(() => {
        setPhase('complete')
        onComplete()
      }, 2500)

      return () => clearTimeout(taglineTimer)
    }
  }, [phase, onComplete])

  if (phase === 'complete') {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo and Name Phase */}
        <div className={`transition-all duration-1000 ${
          phase === 'logo' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="flex flex-col items-center gap-8">
            <div className="animate-bounce-gentle">
              <Image 
                src="/bookie-logo.png" 
                alt="Bookie Logo" 
                width={120} 
                height={120}
                className="w-38 h-38"
              />
            </div>
            <div className="animate-fade-in delay-500">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900">
                Bookie
              </h1>
            </div>
          </div>
        </div>

        {/* Tagline Phase */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          phase === 'tagline' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-center px-4">
            <p className="text-2xl md:text-4xl font-bold text-gray-800 animate-slide-up">
              It is not cookie, it is{" "}
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Bookie
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

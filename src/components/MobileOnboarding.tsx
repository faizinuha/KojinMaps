"use client"

import { Check, ChevronRight, Layers, MapPin, Navigation, Search, X } from "lucide-react"
import { useEffect, useState } from "react"

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  image?: string
}

interface MobileOnboardingProps {
  onComplete: () => void
}

export default function MobileOnboarding({ onComplete }: MobileOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const steps: OnboardingStep[] = [
    {
      title: "Selamat Datang di JapanMaps",
      description: "Jelajahi seluruh Jepang dengan mudah. Temukan tempat menarik, restoran, toilet, dan banyak lagi!",
      icon: <MapPin size={48} className="text-blue-600" />,
    },
    {
      title: "Cari Lokasi dengan Mudah",
      description: "Gunakan fitur pencarian untuk menemukan tempat favorit Anda di seluruh Jepang dengan cepat dan akurat.",
      icon: <Search size={48} className="text-green-600" />,
    },
    {
      title: "Filter Lokasi",
      description: "Aktifkan filter untuk menampilkan toilet, restoran, konbini, stasiun, kuil, dan tempat lainnya di peta.",
      icon: <Layers size={48} className="text-purple-600" />,
    },
    {
      title: "Navigasi Real-time",
      description: "Dapatkan petunjuk arah ke lokasi tujuan Anda dengan navigasi GPS yang akurat.",
      icon: <Navigation size={48} className="text-orange-600" />,
    },
  ]

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("japanmaps-onboarding-completed")
    
    // Only show on mobile/Capacitor
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!hasSeenOnboarding && isMobile) {
      setIsVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem("japanmaps-onboarding-completed", "true")
    setIsVisible(false)
    onComplete()
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 z-10"
        aria-label="Skip onboarding"
      >
        <X size={24} />
      </button>

      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center px-6 pb-20">
        {/* Icon */}
        <div className="mb-8 animate-bounce-slow">
          {step.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center max-w-md mb-8">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-blue-600"
                  : index < currentStep
                  ? "w-2 bg-blue-400"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={handleNext}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
          >
            {isLastStep ? (
              <>
                <Check size={20} />
                <span>Mulai Jelajah</span>
              </>
            ) : (
              <>
                <span>Lanjut</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>

          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
            >
              Lewati
            </button>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-500">
        {currentStep + 1} dari {steps.length}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

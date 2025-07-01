"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Trophy, Target, Brain, Scale } from "lucide-react"

interface ParticipantCardProps {
  participant: {
    name: string
    photo?: string
  }
  position: number
  score: number
  summary?: {
    f: number
    m: number
    e: number
  }
}

interface TestOption {
  name: string
  icon: React.ReactNode
  value: number
  color: string
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  position,
  score,
  summary = { f: 0, m: 0, e: 0 },
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestOption>({
    name: "Total",
    icon: <Trophy className="w-4 h-4" />,
    value: score,
    color: "#3b82f6",
  })
  const [isViewed, setIsViewed] = useState(false)

  const testOptions: TestOption[] = [
    {
      name: "Total",
      icon: <Trophy className="w-4 h-4" />,
      value: score,
      color: "#3b82f6",
    },
    {
      name: "Fuerza",
      icon: <Target className="w-4 h-4" />,
      value: summary.f,
      color: "#ef4444",
    },
    {
      name: "Mental",
      icon: <Brain className="w-4 h-4" />,
      value: summary.m,
      color: "#10b981",
    },
    {
      name: "Equilibrio",
      icon: <Scale className="w-4 h-4" />,
      value: summary.e,
      color: "#f59e0b",
    },
  ]

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log(`Viewing profile: ${participant.name} - Position: #${position}`)
    setIsViewed(true)
    setTimeout(() => setIsViewed(false), 2000)
  }

  const handleCardClick = () => {
    console.log(`Clicked on participant: ${participant.name} - ${selectedTest.name}`)
  }

  const formatScore = (score: number): string => {
    return score.toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
  }

  const getPositionBadgeColor = (pos: number): string => {
    if (pos === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600"
    if (pos === 2) return "bg-gradient-to-r from-slate-300 to-slate-500"
    if (pos === 3) return "bg-gradient-to-r from-amber-600 to-amber-800"
    return "bg-gradient-to-r from-blue-500 to-blue-700"
  }

  return (
    <motion.div
      className="relative w-80 bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Position Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div
          className={`${getPositionBadgeColor(position)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
        >
          #{position}
        </div>
      </div>

      {/* Content container */}
      <div className="relative flex flex-col p-6">
        {/* Participant image */}
        <motion.div
          className="w-full aspect-square relative rounded-xl overflow-hidden mb-6 bg-slate-100"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={participant.photo || "/placeholder.svg?height=300&width=300&query=participant-avatar"}
            alt={participant.name}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
        </motion.div>

        {/* Participant info */}
        <h2 className="text-2xl font-semibold text-slate-800 mb-2 truncate">{participant.name}</h2>
        <p className="text-xl font-medium text-slate-600 mb-4">{formatScore(selectedTest.value)} puntos</p>

        {/* Test selection */}
        <div className="flex flex-col space-y-3 mb-6">
          <p className="text-sm font-medium text-slate-600">Ver puntuación:</p>
          <div className="grid grid-cols-2 gap-2">
            {testOptions.map((option) => (
              <motion.button
                key={option.name}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedTest.name === option.name
                    ? "border-blue-400 bg-blue-50 scale-105"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTest(option)
                }}
                whileHover={{ scale: selectedTest.name === option.name ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Ver puntuación de ${option.name}`}
              >
                <div style={{ color: option.color }}>{option.icon}</div>
                <span className="text-sm font-medium text-slate-700">{option.name}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500 text-center">
            {selectedTest.name}: {formatScore(selectedTest.value)} pts
          </p>
        </div>

        {/* View Profile button */}
        <motion.button
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewProfile}
        >
          Ver Perfil
        </motion.button>
      </div>

      {/* Success overlay */}
      {isViewed && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-slate-800 text-xl font-bold">¡Perfil Cargado!</p>
          </div>
        </motion.div>
      )}

      {/* Hover effect overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-blue-50/30 to-transparent rounded-2xl transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </motion.div>
  )
}

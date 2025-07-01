"use client"

import type React from "react"

import { motion } from "framer-motion"

interface ParticipantCardProps {
  name: string
  score: number
  selectedTest: string
  onTestSelect: (test: string) => void
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ name, score, selectedTest, onTestSelect }) => {
  const tests = ["Math", "English", "Science"]

  return (
    <motion.div
      className="relative flex flex-col rounded-xl p-6 shadow-md bg-gradient-to-br from-white to-slate-50 border"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <h3 className="text-xl font-semibold text-slate-800">{name}</h3>
      <p className="text-slate-600">Score: {score}</p>

      <div className="mt-4 flex space-x-2">
        {tests.map((test) => (
          <button
            key={test}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              selectedTest === test ? "bg-blue-500 text-white" : "bg-slate-200/70 text-slate-600"
            }`}
            onClick={() => onTestSelect(test)}
          >
            {test}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default ParticipantCard

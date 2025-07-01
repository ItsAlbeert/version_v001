"use client"

import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Trophy, Medal, Award, Star } from "lucide-react"
import type { LeaderboardEntry } from "../../types"
import Image from "next/image"

interface ParticipantPyramidProps {
  leaderboardData: LeaderboardEntry[]
}

export function ParticipantPyramid({ leaderboardData }: ParticipantPyramidProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-600" />
      case 2:
        return <Medal className="h-5 w-5 text-slate-500" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      case 4:
        return <Award className="h-5 w-5 text-blue-600" />
      default:
        return <Star className="h-4 w-4 text-slate-400" />
    }
  }

  const top12 = leaderboardData.slice(0, 12)

  if (top12.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Rankings Available</h3>
        <p className="text-slate-500">Participant scores will appear here once data is available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {top12[0] && (
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">{getRankIcon(1)}</div>
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src={top12[0].photoUrl || "/placeholder.svg?width=300&height=300"}
                  alt={top12[0].name}
                  layout="fill"
                  className="rounded-xl object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-800">{top12[0].name}</h3>
              <Badge variant="secondary" className="mb-3 bg-yellow-100 text-yellow-800 border-yellow-200">
                Año {top12[0].year}
              </Badge>
              <div className="text-3xl font-bold text-slate-800">{(top12[0].puntos_total ?? 0).toFixed(1)} pts</div>
            </CardContent>
          </Card>
        </div>
      )}

      {top12.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top12.slice(1, 4).map((participant, index) => (
            <Card
              key={participant.id}
              className={`${
                index === 0
                  ? "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/50"
                  : index === 1
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50"
              } shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-3">{getRankIcon(participant.rank)}</div>
                <div className="relative w-full aspect-square mb-3">
                  <Image
                    src={participant.photoUrl || "/placeholder.svg?width=200&height=200"}
                    alt={participant.name}
                    layout="fill"
                    className="rounded-lg object-cover"
                  />
                </div>
                <h4 className="text-lg font-bold mb-1 text-slate-800">{participant.name}</h4>
                <Badge variant="secondary" className="mb-2 bg-white/80 text-slate-700 border-slate-200 text-xs">
                  Año {participant.year}
                </Badge>
                <div className="text-2xl font-bold text-slate-800">
                  {(participant.puntos_total ?? 0).toFixed(1)} pts
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

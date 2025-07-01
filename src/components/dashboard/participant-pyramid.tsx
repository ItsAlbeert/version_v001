"use client"

import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Trophy, Medal, Award, Star } from "lucide-react"
import type { ParticipantWithScore } from "../../lib/data-utils"

interface ParticipantPyramidProps {
  participantsWithScores: ParticipantWithScore[]
}

export function ParticipantPyramid({ participantsWithScores }: ParticipantPyramidProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      case 4:
        return <Award className="h-5 w-5 text-blue-500" />
      default:
        return <Star className="h-4 w-4 text-gray-500" />
    }
  }

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
      case 4:
        return "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
      default:
        return "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800"
    }
  }

  const top12 = participantsWithScores.slice(0, 12)

  if (top12.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Rankings Available</h3>
        <p className="text-gray-500">Participant scores will appear here once data is available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Champion - 1st Place */}
      {top12[0] && (
        <div className="flex justify-center">
          <Card
            className={`w-full max-w-md ${getRankColor(1)} shadow-2xl transform hover:scale-105 transition-all duration-300`}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">{getRankIcon(1)}</div>
              <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-white">
                <AvatarImage src={top12[0].photoUrl || "/placeholder.svg"} alt={top12[0].name} />
                <AvatarFallback className="text-lg font-bold bg-white text-yellow-600">
                  {getInitials(top12[0].name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold mb-2">{top12[0].name}</h3>
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white">
                Año {top12[0].year}
              </Badge>
              <div className="text-3xl font-bold mb-2">{top12[0].puntos_total} pts</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="font-semibold">Físico</div>
                  <div>{top12[0].puntos_fisico}</div>
                </div>
                <div>
                  <div className="font-semibold">Mental</div>
                  <div>{top12[0].puntos_mental}</div>
                </div>
                <div>
                  <div className="font-semibold">Extra</div>
                  <div>{top12[0].puntos_extras}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Podium - 2nd, 3rd, 4th Places */}
      {top12.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top12.slice(1, 4).map((participant) => (
            <Card
              key={participant.id}
              className={`${getRankColor(participant.position)} shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">{getRankIcon(participant.position)}</div>
                <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-white">
                  <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                  <AvatarFallback className="text-sm font-bold bg-white text-gray-600">
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-bold mb-1">{participant.name}</h4>
                <Badge variant="secondary" className="mb-2 bg-white/20 text-white text-xs">
                  Año {participant.year}
                </Badge>
                <div className="text-2xl font-bold mb-2">{participant.puntos_total} pts</div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div>
                    <div className="font-semibold">F</div>
                    <div>{participant.puntos_fisico}</div>
                  </div>
                  <div>
                    <div className="font-semibold">M</div>
                    <div>{participant.puntos_mental}</div>
                  </div>
                  <div>
                    <div className="font-semibold">E</div>
                    <div>{participant.puntos_extras}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Elite Level - 5th to 8th Places */}
      {top12.length > 4 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {top12.slice(4, 8).map((participant) => (
            <Card
              key={participant.id}
              className={`${getRankColor(participant.position)} shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">{getRankIcon(participant.position)}</div>
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                  <AvatarFallback className="text-xs font-bold">{getInitials(participant.name)}</AvatarFallback>
                </Avatar>
                <h5 className="text-sm font-bold mb-1 truncate">{participant.name}</h5>
                <Badge variant="secondary" className="mb-1 text-xs">
                  #{participant.position}
                </Badge>
                <div className="text-lg font-bold">{participant.puntos_total} pts</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Top 12 Level - 9th to 12th Places */}
      {top12.length > 8 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {top12.slice(8, 12).map((participant) => (
            <Card
              key={participant.id}
              className={`${getRankColor(participant.position)} shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
            >
              <CardContent className="p-3 text-center">
                <div className="flex justify-center mb-1">{getRankIcon(participant.position)}</div>
                <Avatar className="h-10 w-10 mx-auto mb-2">
                  <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                  <AvatarFallback className="text-xs">{getInitials(participant.name)}</AvatarFallback>
                </Avatar>
                <h6 className="text-xs font-bold mb-1 truncate">{participant.name}</h6>
                <Badge variant="secondary" className="mb-1 text-xs">
                  #{participant.position}
                </Badge>
                <div className="text-sm font-bold">{participant.puntos_total} pts</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

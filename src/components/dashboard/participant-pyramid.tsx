"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star } from "lucide-react"
import type { ParticipantWithScore } from "../../lib/data-utils"

interface ParticipantPyramidProps {
  participantsWithScores: ParticipantWithScore[]
}

export function ParticipantPyramid({ participantsWithScores }: ParticipantPyramidProps) {
  // Get participants for each level
  const champion = participantsWithScores[0] // 1st place
  const podium = participantsWithScores.slice(1, 4) // 2nd-4th place
  const elite = participantsWithScores.slice(4, 8) // 5th-8th place
  const top12 = participantsWithScores.slice(8, 12) // 9th-12th place

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getLevelIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (position <= 4) return <Medal className="h-4 w-4 text-gray-400" />
    if (position <= 8) return <Award className="h-4 w-4 text-amber-600" />
    return <Star className="h-3 w-3 text-blue-500" />
  }

  const getLevelColor = (position: number) => {
    if (position === 1) return "border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100"
    if (position <= 4) return "border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100"
    if (position <= 8) return "border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100"
    return "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100"
  }

  if (participantsWithScores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No participants data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Champion Level - 1st Place */}
      {champion && (
        <div className="flex justify-center">
          <Card
            className={`w-full max-w-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${getLevelColor(1)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={champion.photoUrl || "/placeholder.svg"} alt={champion.name} />
                    <AvatarFallback className="text-lg font-bold">{getInitials(champion.name)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">{getLevelIcon(1)}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{champion.name}</h3>
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      #{champion.position}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Year {champion.year}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total Score:</span>
                      <span className="font-bold">{champion.puntos_total}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Physical: {champion.puntos_fisico}</span>
                      <span>Mental: {champion.puntos_mental}</span>
                      <span>Extras: {champion.puntos_extras}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Podium Level - 2nd to 4th Place */}
      {podium.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {podium.map((participant) => (
            <Card
              key={participant.id}
              className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${getLevelColor(participant.position)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback className="text-sm font-bold">{getInitials(participant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">{getLevelIcon(participant.position)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold truncate">{participant.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        #{participant.position}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Year {participant.year}</p>
                    <div className="mt-1">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className="font-bold">{participant.puntos_total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Elite Level - 5th to 8th Place */}
      {elite.length > 0 && (
        <div className="grid gap-3 md:grid-cols-4">
          {elite.map((participant) => (
            <Card
              key={participant.id}
              className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${getLevelColor(participant.position)}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback className="text-xs font-bold">{getInitials(participant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">{getLevelIcon(participant.position)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold truncate">{participant.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        #{participant.position}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Year {participant.year}</p>
                    <p className="text-xs font-bold">{participant.puntos_total} pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Top 12 Level - 9th to 12th Place */}
      {top12.length > 0 && (
        <div className="grid gap-2 md:grid-cols-4">
          {top12.map((participant) => (
            <Card
              key={participant.id}
              className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${getLevelColor(participant.position)}`}
            >
              <CardContent className="p-2">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback className="text-xs">{getInitials(participant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">{getLevelIcon(participant.position)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h6 className="text-xs font-semibold truncate">{participant.name}</h6>
                      <Badge variant="outline" className="text-xs">
                        #{participant.position}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Y{participant.year} • {participant.puntos_total}pts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface Participant {
  id: string
  name: string
  score: number
  rank: number
  avatar?: string
}

interface ParticipantPyramidProps {
  participants?: Participant[]
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-500" />
    case 2:
      return <Medal className="h-4 w-4 text-gray-400" />
    case 3:
      return <Award className="h-4 w-4 text-amber-600" />
    default:
      return null
  }
}

const getRankColor = (rank: number) => {
  if (rank <= 3) return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200"
  if (rank <= 6) return "bg-gradient-to-r from-blue-50 to-blue-25 border-blue-200"
  return "bg-gradient-to-r from-gray-50 to-gray-25 border-gray-200"
}

export const ParticipantPyramid: React.FC<ParticipantPyramidProps> = ({
  participants = [
    { id: "1", name: "Alice Johnson", score: 95, rank: 1 },
    { id: "2", name: "Bob Smith", score: 92, rank: 2 },
    { id: "3", name: "Carol Davis", score: 89, rank: 3 },
    { id: "4", name: "David Wilson", score: 86, rank: 4 },
    { id: "5", name: "Eva Brown", score: 83, rank: 5 },
    { id: "6", name: "Frank Miller", score: 80, rank: 6 },
    { id: "7", name: "Grace Lee", score: 77, rank: 7 },
    { id: "8", name: "Henry Taylor", score: 74, rank: 8 },
    { id: "9", name: "Ivy Chen", score: 71, rank: 9 },
    { id: "10", name: "Jack Anderson", score: 68, rank: 10 },
    { id: "11", name: "Kate Martinez", score: 65, rank: 11 },
    { id: "12", name: "Liam Garcia", score: 62, rank: 12 },
  ],
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Participants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.slice(0, 12).map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getRankColor(participant.rank)}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(participant.rank)}
                  <Badge variant="outline" className="text-xs font-mono">
                    #{participant.rank}
                  </Badge>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">Participant #{participant.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{participant.score}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ParticipantPyramid

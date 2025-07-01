"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Trophy, TrendingUp, Users, Target } from "lucide-react"
import type { ParticipantWithScore } from "../../lib/data-utils"

interface ModernChartsProps {
  participantsWithScores: ParticipantWithScore[]
}

export function ModernCharts({ participantsWithScores }: ModernChartsProps) {
  const totalParticipants = participantsWithScores.length
  const participantsWithData = participantsWithScores.filter((p) => p.puntos_total > 0).length
  const averageScore =
    participantsWithData > 0
      ? Math.round(
          participantsWithScores.filter((p) => p.puntos_total > 0).reduce((sum, p) => sum + p.puntos_total, 0) /
            participantsWithData,
        )
      : 0
  const topScore =
    participantsWithScores.length > 0 ? Math.max(...participantsWithScores.map((p) => p.puntos_total)) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <p className="text-xs text-muted-foreground">{participantsWithData} with scores</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore}</div>
          <p className="text-xs text-muted-foreground">points per participant</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topScore}</div>
          <p className="text-xs text-muted-foreground">
            {participantsWithScores.find((p) => p.puntos_total === topScore)?.name || "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Competition Status</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Active</div>
          <p className="text-xs text-muted-foreground">rankings updated</p>
        </CardContent>
      </Card>
    </div>
  )
}

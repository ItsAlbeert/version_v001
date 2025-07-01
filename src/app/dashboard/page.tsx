"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Trophy, TrendingUp, Activity } from "lucide-react"
import { ParticipantPyramid } from "../../components/dashboard/participant-pyramid"
import { ModernCharts } from "../../components/dashboard/modern-charts"
import { getParticipants, getScores, getRecentScores, getScoringSettings } from "../../lib/firestore-services"
import {
  calculateAllParticipantScores,
  getScoreDistribution,
  getYearDistribution,
  getPerformanceTrends,
  getStatistics,
  type ParticipantWithScore,
} from "../../lib/data-utils"
import type { Participant, Score, ScoringSettings } from "../../types"

export default function DashboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [recentScores, setRecentScores] = useState<Score[]>([])
  const [settings, setSettings] = useState<ScoringSettings | null>(null)
  const [participantsWithScores, setParticipantsWithScores] = useState<ParticipantWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        console.log("🔄 Loading dashboard data...")

        // Load all data in parallel
        const [participantsData, scoresData, recentScoresData, settingsData] = await Promise.all([
          getParticipants(),
          getScores(),
          getRecentScores(10),
          getScoringSettings(),
        ])

        console.log("✅ Data loaded:", {
          participants: participantsData.length,
          scores: scoresData.length,
          recentScores: recentScoresData.length,
          settings: !!settingsData,
        })

        setParticipants(participantsData)
        setScores(scoresData)
        setRecentScores(recentScoresData)
        setSettings(settingsData)

        // Calculate participant scores
        if (settingsData) {
          const calculatedScores = calculateAllParticipantScores(participantsData, scoresData, settingsData)
          setParticipantsWithScores(calculatedScores)
          console.log("✅ Participant scores calculated:", calculatedScores.length)
        }
      } catch (err) {
        console.error("❌ Error loading dashboard data:", err)
        setError("Failed to load dashboard data. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate statistics and distributions
  const statistics = getStatistics(participantsWithScores)
  const scoreDistribution = getScoreDistribution(participantsWithScores)
  const yearDistribution = getYearDistribution(participants)
  const performanceTrends = getPerformanceTrends(scores)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ChronoScore Dashboard</h1>
          <p className="text-muted-foreground">Competition overview and participant rankings</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Active competitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageScore}</div>
            <p className="text-xs text-muted-foreground">Points across all participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.highestScore}</div>
            <p className="text-xs text-muted-foreground">Current leader</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentScores.length}</div>
            <p className="text-xs text-muted-foreground">New scores today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Participant Pyramid - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Participant Rankings</CardTitle>
              <CardDescription>Top performers organized by achievement level</CardDescription>
            </CardHeader>
            <CardContent>
              <ParticipantPyramid participantsWithScores={participantsWithScores} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Takes 1 column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest score submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScores.length > 0 ? (
                  recentScores.slice(0, 5).map((score) => {
                    const participant = participants.find((p) => p.id === score.participantId)
                    if (!participant) return null

                    return (
                      <div key={score.id} className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.photoUrl || "/placeholder.svg"} alt={participant.name} />
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{participant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(score.recordedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {score.puntos_total || score.tiempo_fisico + score.tiempo_mental} pts
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Insights</CardTitle>
          <CardDescription>Performance trends and statistical analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ModernCharts
            participantsWithScores={participantsWithScores}
            scoreDistribution={scoreDistribution}
            yearDistribution={yearDistribution}
            performanceTrends={performanceTrends}
          />
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Alert, AlertDescription } from "../components/ui/alert"
import { AlertCircle, Users, Trophy, Target, TrendingUp } from "lucide-react"
import { PageHeader } from "../components/page-header"
import { ParticipantPyramid } from "../components/dashboard/participant-pyramid"
import { ModernCharts } from "../components/dashboard/modern-charts"
import { getParticipants, getScores, getScoringSettings, getGames } from "../lib/firestore-services"
import { calculateAllParticipantScores } from "../lib/data-utils"
import type { LeaderboardEntry } from "../types"

export default function Page() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [participantsData, scoresData, settingsData, gamesData] = await Promise.all([
          getParticipants(),
          getScores(),
          getScoringSettings(),
          getGames(),
        ])

        if (settingsData) {
          const calculatedData = calculateAllParticipantScores(participantsData, scoresData, gamesData, settingsData)
          setLeaderboardData(calculatedData)
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Failed to load dashboard data. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const topParticipant = leaderboardData[0]
  const averageScore =
    leaderboardData.length > 0
      ? leaderboardData.reduce((sum, p) => sum + (p.puntos_total || 0), 0) / leaderboardData.length
      : 0
  const totalParticipants = leaderboardData.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm">
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
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Skeleton className="h-64 w-80" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <PageHeader title="ChronoScore Dashboard" description="Top 12 participant rankings" />
          <Alert variant="destructive" className="mt-6 bg-red-50/80 backdrop-blur-sm border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          title="ChronoScore Dashboard"
          description="Top 12 participant rankings with detailed score breakdown"
        />

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalParticipants}</div>
              <p className="text-xs text-slate-500">Active competitors</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Top Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {topParticipant ? (topParticipant.puntos_total || 0).toFixed(1) : "0.0"}
              </div>
              <p className="text-xs text-slate-500">{topParticipant ? topParticipant.name : "No data"}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{averageScore.toFixed(1)}</div>
              <p className="text-xs text-slate-500">Across all participants</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Competition Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">Active</div>
              <p className="text-xs text-slate-500">Rankings updated</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Performance Analytics</CardTitle>
            <CardDescription className="text-slate-600">Detailed performance metrics and trends</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ModernCharts leaderboardData={leaderboardData} />
          </CardContent>
        </Card>

        {/* Participant Rankings */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-slate-800">
              🏆 Top 12 Participant Rankings
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Competition leaderboard showcasing the highest performing participants
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <ParticipantPyramid leaderboardData={leaderboardData} />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-500 bg-white/60 backdrop-blur-sm rounded-lg p-4">
          <p>Rankings are updated in real-time based on the latest participant scores.</p>
          <p className="mt-1">
            Showing top {Math.min(12, leaderboardData.length)} of {leaderboardData.length} participants
          </p>
        </div>
      </div>
    </div>
  )
}

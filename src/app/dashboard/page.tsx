"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle } from "lucide-react"
import { PageHeader } from "../../components/page-header"
import { ParticipantPyramid } from "../../components/dashboard/participant-pyramid"
import { ModernCharts } from "../../components/dashboard/modern-charts"
import { getParticipants, getScores, getScoringSettings } from "../../lib/firestore-services"
import { calculateAllParticipantScores, type ParticipantWithScore } from "../../lib/data-utils"
import type { Participant, Score, ScoringSettings } from "../../types"

export default function DashboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [settings, setSettings] = useState<ScoringSettings | null>(null)
  const [participantsWithScores, setParticipantsWithScores] = useState<ParticipantWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        console.log("🔄 Loading dashboard data...")

        const [participantsData, scoresData, settingsData] = await Promise.all([
          getParticipants(),
          getScores(),
          getScoringSettings(),
        ])

        console.log("✅ Data loaded:", {
          participants: participantsData.length,
          scores: scoresData.length,
          settings: !!settingsData,
        })

        setParticipants(participantsData)
        setScores(scoresData)
        setSettings(settingsData)

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
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
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

        {/* Pyramid Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Champion skeleton */}
              <div className="flex justify-center">
                <Skeleton className="h-64 w-80" />
              </div>
              {/* Podium skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
              {/* Elite skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              {/* Top 12 skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="ChronoScore Dashboard" description="Top 12 participant rankings" />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <PageHeader
        title="ChronoScore Dashboard"
        description="Top 12 participant rankings with detailed score breakdown"
      />

      {/* Statistics Overview */}
      <ModernCharts participantsWithScores={participantsWithScores} />

      {/* Main Ranking Grid */}
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            🏆 Top 12 Participant Rankings
          </CardTitle>
          <CardDescription className="text-lg">
            Competition leaderboard showcasing the highest performing participants
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <ParticipantPyramid participantsWithScores={participantsWithScores} />
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Rankings are updated in real-time based on the latest participant scores.</p>
        <p className="mt-1">
          Showing top {Math.min(12, participantsWithScores.length)} of {participantsWithScores.length} participants
        </p>
      </div>
    </div>
  )
}

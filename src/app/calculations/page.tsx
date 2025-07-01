"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"

import type { Participant, Score, Game, ScoringSettings, CalculationBreakdownEntry } from "../../types"
import { getParticipants, getScores, getGames, getScoringSettings } from "../../lib/firestore-services"
import { calculateAllParticipantScores } from "../../lib/data-utils"

import { PageHeader } from "../../components/page-header"
import { ScoringSettingsForm } from "./scoring-settings-form"
import { CalculationsTable } from "./calculations-table"
import { Card, CardContent } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"

export default function CalculationsPage() {
  // --- DATA FETCHING ---
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn: getParticipants,
  })

  const { data: allScores = [], isLoading: isLoadingScores } = useQuery<Score[]>({
    queryKey: ["scores"],
    queryFn: getScores,
  })

  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: getGames,
  })

  const { data: scoringSettings, isLoading: isLoadingSettings } = useQuery<ScoringSettings>({
    queryKey: ["scoringSettings"],
    queryFn: getScoringSettings,
    staleTime: 1000 * 60 * 5, // Stale after 5 minutes
  })

  const isLoadingOverall = isLoadingParticipants || isLoadingScores || isLoadingGames || isLoadingSettings

  // --- DATA PROCESSING ---
  const calculationData = React.useMemo((): CalculationBreakdownEntry[] => {
    if (isLoadingOverall || !participants.length || !allScores.length || !games.length || !scoringSettings) {
      return []
    }
    // Use the robust calculation function to get leaderboard-style data
    const leaderboardEntries = calculateAllParticipantScores(participants, allScores, games, scoringSettings)

    // Adapt to the CalculationBreakdownEntry type
    return leaderboardEntries.map(
      (entry) =>
        ({
          ...entry,
          rank: entry.position, // Ensure rank is aligned with position
          latest_tiempo_fisico: entry.latestScore?.tiempo_fisico ?? 0,
          latest_tiempo_mental: entry.latestScore?.tiempo_mental ?? 0,
          latest_extra_game_detailed_statuses: entry.latestScore?.extraGameDetailedStatuses,
          // The rest of the properties from LeaderboardEntry are already there
        }) as CalculationBreakdownEntry,
    )
  }, [participants, allScores, games, scoringSettings, isLoadingOverall])

  const definedExtraGames = React.useMemo(() => games.filter((g) => g.category === "Extra"), [games])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <PageHeader
        title="Desglose del Cálculo de Puntuaciones"
        description="Visión transparente de cómo los datos brutos se traducen en puntuaciones finales."
      />

      <ScoringSettingsForm initialSettings={scoringSettings} isLoading={isLoadingSettings} />

      <Card>
        <CardContent className="p-4 md:p-6">
          {isLoadingOverall ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <CalculationsTable data={calculationData} extraGames={definedExtraGames} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

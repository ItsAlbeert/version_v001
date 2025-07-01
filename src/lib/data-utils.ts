import type { Participant, Score, ScoringSettings, Game, LeaderboardEntry, ExtraGameStatusDetail } from "../types"
import { DEFAULT_SCORING_SETTINGS } from "./firestore-services"

/**
 * Calculates the score for a physical game based on time.
 * The lower the time, the higher the score.
 */
export function calculatePhysicalScore(timeInMinutes: number, settings: ScoringSettings): number {
  const physicalSettings = settings?.physical ?? DEFAULT_SCORING_SETTINGS.physical
  if (timeInMinutes <= physicalSettings.threshold1) return physicalSettings.maxPoints
  if (timeInMinutes >= physicalSettings.threshold2) return physicalSettings.minPoints

  const ratio =
    (timeInMinutes - physicalSettings.threshold1) / (physicalSettings.threshold2 - physicalSettings.threshold1)
  return Math.round(physicalSettings.maxPoints - ratio * (physicalSettings.maxPoints - physicalSettings.minPoints))
}

/**
 * Calculates the score for a mental game based on time.
 * The lower the time, the higher the score.
 */
export function calculateMentalScore(timeInMinutes: number, settings: ScoringSettings): number {
  const mentalSettings = settings?.mental ?? DEFAULT_SCORING_SETTINGS.mental
  if (timeInMinutes <= mentalSettings.threshold1) return mentalSettings.maxPoints
  if (timeInMinutes >= mentalSettings.threshold2) return mentalSettings.minPoints

  const ratio = (timeInMinutes - mentalSettings.threshold1) / (mentalSettings.threshold2 - mentalSettings.threshold1)
  return Math.round(mentalSettings.maxPoints - ratio * (mentalSettings.maxPoints - mentalSettings.minPoints))
}

/**
 * Calculates the points for extra games.
 * Returns the raw total, the capped total, and a detailed breakdown.
 */
export function calculateExtraScore(
  extraGameStatuses: { [gameId: string]: ExtraGameStatusDetail } | undefined,
  games: Game[],
  settings: ScoringSettings,
): { cappedScore: number; rawScore: number; individualPoints: { [gameId: string]: number } } {
  const extraSettings = settings?.extras ?? DEFAULT_SCORING_SETTINGS.extras
  const individualPoints: { [gameId: string]: number } = {}
  let rawScore = 0

  if (extraGameStatuses && games.length > 0) {
    const gamesMap = new Map(games.map((g) => [g.id, g]))

    for (const gameId in extraGameStatuses) {
      const game = gamesMap.get(gameId)
      const status = extraGameStatuses[gameId]

      if (game && game.category === "Extra" && game.extraType) {
        const pointsConfig = extraSettings.points[game.extraType]
        const points = pointsConfig[status] ?? 0
        individualPoints[gameId] = points
        rawScore += points
      }
    }
  }

  const cappedScore = Math.max(extraSettings.capMin, Math.min(extraSettings.capMax, rawScore))
  return { cappedScore, rawScore, individualPoints }
}

/**
 * Processes all data to generate a complete leaderboard.
 * This is the main data transformation function for rankings.
 */
export function calculateAllParticipantScores(
  participants: Participant[],
  scores: Score[],
  games: Game[],
  settings: ScoringSettings,
): LeaderboardEntry[] {
  if (!participants || !scores || !settings) {
    return []
  }

  const latestScoresMap = new Map<string, Score>()
  scores.forEach((score) => {
    if (!score.participantId) return
    const existing = latestScoresMap.get(score.participantId)
    if (!existing || new Date(score.recordedAt) > new Date(existing.recordedAt)) {
      latestScoresMap.set(score.participantId, score)
    }
  })

  const leaderboard: LeaderboardEntry[] = participants.map((participant) => {
    const latestScore = latestScoresMap.get(participant.id)

    if (!latestScore) {
      return {
        ...participant,
        rank: 0,
        latest_tiempo_fisico: 0,
        latest_tiempo_mental: 0,
        puntos_fisico: 0,
        puntos_mental: 0,
        puntos_extras: 0,
        puntos_extras_cruda: 0,
        puntos_total: 0,
        scoreRecordedAt: new Date(0).toISOString(),
      }
    }

    const puntos_fisico = calculatePhysicalScore(latestScore.tiempo_fisico ?? 0, settings)
    const puntos_mental = calculateMentalScore(latestScore.tiempo_mental ?? 0, settings)
    const { cappedScore, rawScore, individualPoints } = calculateExtraScore(
      latestScore.extraGameDetailedStatuses,
      games,
      settings,
    )

    const puntos_total = puntos_fisico + puntos_mental + cappedScore

    return {
      ...participant,
      rank: 0, // Rank will be assigned after sorting
      latest_tiempo_fisico: latestScore.tiempo_fisico ?? 0,
      latest_tiempo_mental: latestScore.tiempo_mental ?? 0,
      latest_extra_game_detailed_statuses: latestScore.extraGameDetailedStatuses,
      latestScoreId: latestScore.id,
      puntos_fisico,
      puntos_mental,
      puntos_extras: cappedScore,
      puntos_extras_cruda: rawScore,
      puntos_total,
      individual_extra_game_points: individualPoints,
      scoreRecordedAt: latestScore.recordedAt,
      gameTimes: latestScore.gameTimes,
    }
  })

  // Sort by total points and assign rank
  leaderboard.sort((a, b) => b.puntos_total - a.puntos_total)
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1
  })

  return leaderboard
}

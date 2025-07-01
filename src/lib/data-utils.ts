import type { Participant, Score, ScoringSettings } from "../types"

export interface ParticipantWithScore extends Participant {
  latestScore?: Score
  puntos_total: number
  puntos_fisico: number
  puntos_mental: number
  puntos_extras: number
  position: number
}

export interface ScoreDistribution {
  range: string
  count: number
  percentage: number
}

export interface YearDistribution {
  year: number
  count: number
  percentage: number
}

export interface PerformanceTrend {
  date: string
  averageScore: number
  participantCount: number
}

// Calculate score for physical time
export function calculatePhysicalScore(timeInMinutes: number, settings: ScoringSettings): number {
  const { threshold1, threshold2, maxPoints, minPoints } = settings.physical

  if (timeInMinutes <= threshold1) {
    return maxPoints
  } else if (timeInMinutes >= threshold2) {
    return minPoints
  } else {
    // Linear interpolation between thresholds
    const ratio = (timeInMinutes - threshold1) / (threshold2 - threshold1)
    return Math.round(maxPoints - ratio * (maxPoints - minPoints))
  }
}

// Calculate score for mental time
export function calculateMentalScore(timeInMinutes: number, settings: ScoringSettings): number {
  const { threshold1, threshold2, maxPoints, minPoints } = settings.mental

  if (timeInMinutes <= threshold1) {
    return maxPoints
  } else if (timeInMinutes >= threshold2) {
    return minPoints
  } else {
    // Linear interpolation between thresholds
    const ratio = (timeInMinutes - threshold1) / (threshold2 - threshold1)
    return Math.round(maxPoints - ratio * (maxPoints - minPoints))
  }
}

// Calculate extra games score
export function calculateExtraScore(
  extraGameDetailedStatuses: { [gameId: string]: any },
  settings: ScoringSettings,
): number {
  let totalPoints = 0

  Object.values(extraGameDetailedStatuses).forEach((status: any) => {
    if (status && status.status && status.type) {
      const gameType = status.type as "opcional" | "obligatoria"
      const gameStatus = status.status as "muy_bien" | "regular" | "no_hecho"

      if (settings.extras.points[gameType] && settings.extras.points[gameType][gameStatus] !== undefined) {
        totalPoints += settings.extras.points[gameType][gameStatus]
      }
    }
  })

  // Apply caps
  return Math.max(settings.extras.capMin, Math.min(settings.extras.capMax, totalPoints))
}

// Calculate all participant scores
export function calculateAllParticipantScores(
  participants: Participant[],
  scores: Score[],
  settings: ScoringSettings,
): ParticipantWithScore[] {
  // Get latest score for each participant
  const latestScoresMap = new Map<string, Score>()

  scores.forEach((score) => {
    const existing = latestScoresMap.get(score.participantId)
    if (!existing || new Date(score.recordedAt) > new Date(existing.recordedAt)) {
      latestScoresMap.set(score.participantId, score)
    }
  })

  // Calculate scores for each participant
  const participantsWithScores: ParticipantWithScore[] = participants.map((participant) => {
    const latestScore = latestScoresMap.get(participant.id)

    if (!latestScore) {
      return {
        ...participant,
        puntos_total: 0,
        puntos_fisico: 0,
        puntos_mental: 0,
        puntos_extras: 0,
        position: 0,
      }
    }

    // Use calculated scores if available, otherwise calculate them
    const puntos_fisico = latestScore.puntos_fisico ?? calculatePhysicalScore(latestScore.tiempo_fisico, settings)
    const puntos_mental = latestScore.puntos_mental ?? calculateMentalScore(latestScore.tiempo_mental, settings)
    const puntos_extras =
      latestScore.puntos_extras ?? calculateExtraScore(latestScore.extraGameDetailedStatuses, settings)
    const puntos_total = latestScore.puntos_total ?? puntos_fisico + puntos_mental + puntos_extras

    return {
      ...participant,
      latestScore,
      puntos_total,
      puntos_fisico,
      puntos_mental,
      puntos_extras,
      position: 0, // Will be set after sorting
    }
  })

  // Sort by total score and assign positions
  participantsWithScores.sort((a, b) => b.puntos_total - a.puntos_total)
  participantsWithScores.forEach((participant, index) => {
    participant.position = index + 1
  })

  return participantsWithScores
}

// Get score distribution
export function getScoreDistribution(participantsWithScores: ParticipantWithScore[]): ScoreDistribution[] {
  const ranges = [
    { min: 0, max: 50, label: "0-50" },
    { min: 51, max: 100, label: "51-100" },
    { min: 101, max: 150, label: "101-150" },
    { min: 151, max: 200, label: "151-200" },
    { min: 201, max: 250, label: "201-250" },
    { min: 251, max: Number.POSITIVE_INFINITY, label: "251+" },
  ]

  const total = participantsWithScores.length

  return ranges
    .map((range) => {
      const count = participantsWithScores.filter(
        (p) => p.puntos_total >= range.min && p.puntos_total <= range.max,
      ).length

      return {
        range: range.label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }
    })
    .filter((item) => item.count > 0)
}

// Get year distribution
export function getYearDistribution(participants: Participant[]): YearDistribution[] {
  const yearCounts = participants.reduce(
    (acc, participant) => {
      acc[participant.year] = (acc[participant.year] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const total = participants.length

  return Object.entries(yearCounts)
    .map(([year, count]) => ({
      year: Number(year),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => a.year - b.year)
}

// Get performance trends
export function getPerformanceTrends(scores: Score[]): PerformanceTrend[] {
  // Group scores by date
  const scoresByDate = scores.reduce(
    (acc, score) => {
      const date = new Date(score.recordedAt).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(score)
      return acc
    },
    {} as Record<string, Score[]>,
  )

  // Calculate average score per date
  const trends = Object.entries(scoresByDate).map(([date, dayScores]) => {
    const totalScores = dayScores.map((score) => {
      return score.puntos_total || 0
    })

    const averageScore =
      totalScores.length > 0 ? totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length : 0

    return {
      date,
      averageScore: Math.round(averageScore),
      participantCount: dayScores.length,
    }
  })

  // Sort by date and return last 30 days
  return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30)
}

// Get statistics
export function getStatistics(participantsWithScores: ParticipantWithScore[]) {
  if (participantsWithScores.length === 0) {
    return {
      totalParticipants: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averagePhysical: 0,
      averageMental: 0,
      averageExtras: 0,
    }
  }

  const scores = participantsWithScores.map((p) => p.puntos_total)
  const physicalScores = participantsWithScores.map((p) => p.puntos_fisico)
  const mentalScores = participantsWithScores.map((p) => p.puntos_mental)
  const extraScores = participantsWithScores.map((p) => p.puntos_extras)

  return {
    totalParticipants: participantsWithScores.length,
    averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averagePhysical: Math.round(physicalScores.reduce((sum, score) => sum + score, 0) / physicalScores.length),
    averageMental: Math.round(mentalScores.reduce((sum, score) => sum + score, 0) / mentalScores.length),
    averageExtras: Math.round(extraScores.reduce((sum, score) => sum + score, 0) / extraScores.length),
  }
}

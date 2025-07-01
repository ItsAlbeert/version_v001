import type { Participant, Score, ScoringSettings } from "../types"

export interface ParticipantWithScore extends Participant {
  latestScore?: Score
  puntos_total: number
  puntos_fisico: number
  puntos_mental: number
  puntos_extras: number
  position: number
}

// Calculate score for physical time
export function calculatePhysicalScore(timeInMinutes: number, settings: ScoringSettings): number {
  const { threshold1, threshold2, maxPoints, minPoints } = settings.physical

  if (timeInMinutes <= threshold1) {
    return maxPoints
  } else if (timeInMinutes >= threshold2) {
    return minPoints
  } else {
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

  return Math.max(settings.extras.capMin, Math.min(settings.extras.capMax, totalPoints))
}

// Calculate all participant scores
export function calculateAllParticipantScores(
  participants: Participant[],
  scores: Score[],
  settings: ScoringSettings,
): ParticipantWithScore[] {
  const latestScoresMap = new Map<string, Score>()

  scores.forEach((score) => {
    const existing = latestScoresMap.get(score.participantId)
    if (!existing || new Date(score.recordedAt) > new Date(existing.recordedAt)) {
      latestScoresMap.set(score.participantId, score)
    }
  })

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
      position: 0,
    }
  })

  participantsWithScores.sort((a, b) => b.puntos_total - a.puntos_total)
  participantsWithScores.forEach((participant, index) => {
    participant.position = index + 1
  })

  return participantsWithScores
}

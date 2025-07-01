import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  setDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Participant, Score, Game, ScoringSettings, ExtraGameStatusDetail } from "../types"

// Default scoring settings
export const DEFAULT_SCORING_SETTINGS: ScoringSettings = {
  physical: {
    threshold1: 220,
    threshold2: 360,
    maxPoints: 100,
    minPoints: 30,
  },
  mental: {
    threshold1: 50,
    threshold2: 120,
    maxPoints: 100,
    minPoints: 30,
  },
  extras: {
    capMax: 30,
    capMin: -10,
    points: {
      opcional: {
        muy_bien: 10,
        regular: 6,
        no_hecho: 0,
      },
      obligatoria: {
        muy_bien: 10,
        regular: 6,
        no_hecho: -10,
      },
    },
  },
}

// Participants
export async function getParticipants(): Promise<Participant[]> {
  console.log("📥 Fetching participants...")
  try {
    const querySnapshot = await getDocs(collection(db, "participants"))
    const participants: Participant[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      participants.push({
        id: doc.id,
        name: data.name || "",
        year: (Number(data.year) as 1 | 2 | 3) || 1,
        photoUrl: data.photoUrl || undefined,
      })
    })

    console.log(`✅ ${participants.length} participants fetched`)
    return participants
  } catch (error) {
    console.error("❌ Error fetching participants:", error)
    return []
  }
}

export async function addParticipant(participant: Omit<Participant, "id">): Promise<string> {
  console.log("➕ Adding participant:", participant.name)
  try {
    const docRef = await addDoc(collection(db, "participants"), {
      ...participant,
      createdAt: Timestamp.now(),
    })
    console.log("✅ Participant added with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("❌ Error adding participant:", error)
    throw error
  }
}

export async function updateParticipant(id: string, updates: Partial<Participant>): Promise<void> {
  console.log("📝 Updating participant:", id)
  try {
    await updateDoc(doc(db, "participants", id), {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    console.log("✅ Participant updated")
  } catch (error) {
    console.error("❌ Error updating participant:", error)
    throw error
  }
}

export async function deleteParticipant(id: string): Promise<void> {
  console.log("🗑️ Deleting participant:", id)
  try {
    await deleteDoc(doc(db, "participants", id))
    console.log("✅ Participant deleted")
  } catch (error) {
    console.error("❌ Error deleting participant:", error)
    throw error
  }
}

// Scores
export async function getScores(): Promise<Score[]> {
  console.log("📥 Fetching scores...")
  try {
    const querySnapshot = await getDocs(query(collection(db, "scores"), orderBy("recordedAt", "desc")))
    const scores: Score[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()

      let recordedAt: string
      if (data.recordedAt && typeof data.recordedAt.toDate === "function") {
        recordedAt = data.recordedAt.toDate().toISOString()
      } else if (typeof data.recordedAt === "string") {
        recordedAt = data.recordedAt
      } else {
        recordedAt = new Date().toISOString()
      }

      scores.push({
        id: doc.id,
        participantId: data.participantId || "",
        tiempo_fisico: Number(data.tiempo_fisico) || 0,
        tiempo_mental: Number(data.tiempo_mental) || 0,
        extraGameDetailedStatuses: data.extraGameDetailedStatuses || {},
        gameTimes: data.gameTimes || {},
        recordedAt,
        puntos_fisico: data.puntos_fisico ? Number(data.puntos_fisico) : undefined,
        puntos_mental: data.puntos_mental ? Number(data.puntos_mental) : undefined,
        puntos_extras: data.puntos_extras ? Number(data.puntos_extras) : undefined,
        puntos_total: data.puntos_total ? Number(data.puntos_total) : undefined,
      })
    })

    console.log(`✅ ${scores.length} scores fetched`)
    return scores
  } catch (error) {
    console.error("❌ Error fetching scores:", error)
    return []
  }
}

export async function addScore(scoreData: {
  participantId: string
  tiempo_fisico: number
  tiempo_mental: number
  extraGameDetailedStatuses?: { [gameId: string]: ExtraGameStatusDetail }
  gameTimes?: { [gameId: string]: number }
  recordedAt: Date
}): Promise<string> {
  console.log("➕ Adding score for participant:", scoreData.participantId)
  try {
    const dataToSave = {
      participantId: scoreData.participantId,
      tiempo_fisico: Number(scoreData.tiempo_fisico),
      tiempo_mental: Number(scoreData.tiempo_mental),
      extraGameDetailedStatuses: scoreData.extraGameDetailedStatuses || {},
      gameTimes: scoreData.gameTimes || {},
      recordedAt: Timestamp.fromDate(scoreData.recordedAt),
    }

    const docRef = await addDoc(collection(db, "scores"), dataToSave)
    console.log("✅ Score added with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("❌ Error adding score:", error)
    throw error
  }
}

export async function updateScore(id: string, scoreData: Partial<Score>): Promise<void> {
  console.log("📝 Updating score:", id)
  try {
    const updateData: any = {}
    if (scoreData.tiempo_fisico !== undefined) updateData.tiempo_fisico = Number(scoreData.tiempo_fisico)
    if (scoreData.tiempo_mental !== undefined) updateData.tiempo_mental = Number(scoreData.tiempo_mental)
    if (scoreData.extraGameDetailedStatuses !== undefined)
      updateData.extraGameDetailedStatuses = scoreData.extraGameDetailedStatuses
    if (scoreData.gameTimes !== undefined) updateData.gameTimes = scoreData.gameTimes

    await updateDoc(doc(db, "scores", id), updateData)
    console.log("✅ Score updated")
  } catch (error) {
    console.error("❌ Error updating score:", error)
    throw error
  }
}

export async function deleteScore(id: string): Promise<void> {
  console.log("🗑️ Deleting score:", id)
  try {
    await deleteDoc(doc(db, "scores", id))
    console.log("✅ Score deleted")
  } catch (error) {
    console.error("❌ Error deleting score:", error)
    throw error
  }
}

// Games
export async function getGames(): Promise<Game[]> {
  console.log("📥 Fetching games...")
  try {
    const querySnapshot = await getDocs(collection(db, "games"))
    const games: Game[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      games.push({
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        category: data.category || "Physical",
        extraType: data.extraType || undefined,
      })
    })

    console.log(`✅ ${games.length} games fetched`)
    return games
  } catch (error) {
    console.error("❌ Error fetching games:", error)
    return []
  }
}

export async function addGame(game: Omit<Game, "id">): Promise<string> {
  console.log("➕ Adding game:", game.name)
  try {
    const docRef = await addDoc(collection(db, "games"), {
      ...game,
      createdAt: Timestamp.now(),
    })
    console.log("✅ Game added with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("❌ Error adding game:", error)
    throw error
  }
}

export async function updateGame(id: string, updates: Partial<Game>): Promise<void> {
  console.log("📝 Updating game:", id)
  try {
    await updateDoc(doc(db, "games", id), {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    console.log("✅ Game updated")
  } catch (error) {
    console.error("❌ Error updating game:", error)
    throw error
  }
}

export async function deleteGame(id: string): Promise<void> {
  console.log("🗑️ Deleting game:", id)
  try {
    await deleteDoc(doc(db, "games", id))
    console.log("✅ Game deleted")
  } catch (error) {
    console.error("❌ Error deleting game:", error)
    throw error
  }
}

// Scoring Settings
export async function getScoringSettings(): Promise<ScoringSettings> {
  console.log("📥 Fetching scoring settings...")
  try {
    const docRef = doc(db, "settings", "scoring_rules")
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      const settings: ScoringSettings = {
        id: docSnap.id,
        physical: {
          threshold1: Number(data.physical?.threshold1) || DEFAULT_SCORING_SETTINGS.physical.threshold1,
          threshold2: Number(data.physical?.threshold2) || DEFAULT_SCORING_SETTINGS.physical.threshold2,
          maxPoints: Number(data.physical?.maxPoints) || DEFAULT_SCORING_SETTINGS.physical.maxPoints,
          minPoints: Number(data.physical?.minPoints) || DEFAULT_SCORING_SETTINGS.physical.minPoints,
        },
        mental: {
          threshold1: Number(data.mental?.threshold1) || DEFAULT_SCORING_SETTINGS.mental.threshold1,
          threshold2: Number(data.mental?.threshold2) || DEFAULT_SCORING_SETTINGS.mental.threshold2,
          maxPoints: Number(data.mental?.maxPoints) || DEFAULT_SCORING_SETTINGS.mental.maxPoints,
          minPoints: Number(data.mental?.minPoints) || DEFAULT_SCORING_SETTINGS.mental.minPoints,
        },
        extras: {
          capMax: Number(data.extras?.capMax) || DEFAULT_SCORING_SETTINGS.extras.capMax,
          capMin: Number(data.extras?.capMin) || DEFAULT_SCORING_SETTINGS.extras.capMin,
          points: {
            opcional: {
              muy_bien:
                Number(data.extras?.points?.opcional?.muy_bien) ||
                DEFAULT_SCORING_SETTINGS.extras.points.opcional.muy_bien,
              regular:
                Number(data.extras?.points?.opcional?.regular) ||
                DEFAULT_SCORING_SETTINGS.extras.points.opcional.regular,
              no_hecho:
                Number(data.extras?.points?.opcional?.no_hecho) ||
                DEFAULT_SCORING_SETTINGS.extras.points.opcional.no_hecho,
            },
            obligatoria: {
              muy_bien:
                Number(data.extras?.points?.obligatoria?.muy_bien) ||
                DEFAULT_SCORING_SETTINGS.extras.points.obligatoria.muy_bien,
              regular:
                Number(data.extras?.points?.obligatoria?.regular) ||
                DEFAULT_SCORING_SETTINGS.extras.points.obligatoria.regular,
              no_hecho:
                Number(data.extras?.points?.obligatoria?.no_hecho) ||
                DEFAULT_SCORING_SETTINGS.extras.points.obligatoria.no_hecho,
            },
          },
        },
      }

      console.log("✅ Scoring settings fetched")
      return settings
    } else {
      await setDoc(docRef, DEFAULT_SCORING_SETTINGS)
      const settings = { id: "scoring_rules", ...DEFAULT_SCORING_SETTINGS }
      console.log("✅ Default scoring settings created")
      return settings
    }
  } catch (error) {
    console.error("❌ Error fetching scoring settings:", error)
    return { id: "scoring_rules", ...DEFAULT_SCORING_SETTINGS }
  }
}

export async function updateScoringSettings(settings: Omit<ScoringSettings, "id">): Promise<void> {
  console.log("📝 Updating scoring settings...")
  try {
    const docRef = doc(db, "settings", "scoring_rules")
    await setDoc(docRef, settings, { merge: true })
    console.log("✅ Scoring settings updated")
  } catch (error) {
    console.error("❌ Error updating scoring settings:", error)
    throw error
  }
}

export async function forceRefreshAllData(): Promise<{
  participants: Participant[]
  scores: Score[]
  games: Game[]
  settings: ScoringSettings
}> {
  console.log("🔄 Force refreshing all data...")
  try {
    const [participants, scores, games, settings] = await Promise.all([
      getParticipants(),
      getScores(),
      getGames(),
      getScoringSettings(),
    ])

    console.log("✅ All data refreshed successfully")
    return { participants, scores, games, settings }
  } catch (error) {
    console.error("❌ Error refreshing all data:", error)
    const participants = await getParticipants().catch(() => [])
    const scores = await getScores().catch(() => [])
    const games = await getGames().catch(() => [])
    const settings = await getScoringSettings().catch(() => ({ id: "scoring_rules", ...DEFAULT_SCORING_SETTINGS }))

    return { participants, scores, games, settings }
  }
}

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Participant, Score, Game, ScoringSettings } from "../types"

// Default scoring settings
export const DEFAULT_SCORING_SETTINGS: ScoringSettings = {
  physical: {
    threshold1: 15,
    threshold2: 30,
    maxPoints: 100,
    minPoints: 20,
  },
  mental: {
    threshold1: 10,
    threshold2: 25,
    maxPoints: 100,
    minPoints: 20,
  },
  extras: {
    capMax: 50,
    capMin: -20,
    points: {
      opcional: {
        muy_bien: 15,
        regular: 8,
        no_hecho: 0,
      },
      obligatoria: {
        muy_bien: 20,
        regular: 10,
        no_hecho: -10,
      },
    },
  },
}

// Participants
export async function getParticipants(): Promise<Participant[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "participants"))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Participant[]
  } catch (error) {
    console.error("Error fetching participants:", error)
    throw new Error("Failed to fetch participants")
  }
}

export async function addParticipant(participant: Omit<Participant, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "participants"), participant)
    return docRef.id
  } catch (error) {
    console.error("Error adding participant:", error)
    throw new Error("Failed to add participant")
  }
}

export async function updateParticipant(id: string, participant: Partial<Participant>): Promise<void> {
  try {
    await updateDoc(doc(db, "participants", id), participant)
  } catch (error) {
    console.error("Error updating participant:", error)
    throw new Error("Failed to update participant")
  }
}

export async function deleteParticipant(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "participants", id))
  } catch (error) {
    console.error("Error deleting participant:", error)
    throw new Error("Failed to delete participant")
  }
}

// Scores
export async function getScores(): Promise<Score[]> {
  try {
    const querySnapshot = await getDocs(query(collection(db, "scores"), orderBy("recordedAt", "desc")))
    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate().toISOString() : data.recordedAt,
      }
    }) as Score[]
  } catch (error) {
    console.error("Error fetching scores:", error)
    throw new Error("Failed to fetch scores")
  }
}

export async function getScoreById(id: string): Promise<Score | null> {
  try {
    const docSnap = await getDoc(doc(db, "scores", id))
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        recordedAt: data.recordedAt instanceof Timestamp ? data.recordedAt.toDate().toISOString() : data.recordedAt,
      } as Score
    }
    return null
  } catch (error) {
    console.error("Error fetching score:", error)
    throw new Error("Failed to fetch score")
  }
}

export async function addScore(score: Omit<Score, "id">): Promise<string> {
  try {
    const scoreData = {
      ...score,
      recordedAt: score.recordedAt ? new Date(score.recordedAt) : new Date(),
    }
    const docRef = await addDoc(collection(db, "scores"), scoreData)
    return docRef.id
  } catch (error) {
    console.error("Error adding score:", error)
    throw new Error("Failed to add score")
  }
}

export async function updateScore(id: string, score: Partial<Score>): Promise<void> {
  try {
    const scoreData = {
      ...score,
      recordedAt: score.recordedAt ? new Date(score.recordedAt) : undefined,
    }
    await updateDoc(doc(db, "scores", id), scoreData)
  } catch (error) {
    console.error("Error updating score:", error)
    throw new Error("Failed to update score")
  }
}

export async function deleteScore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "scores", id))
  } catch (error) {
    console.error("Error deleting score:", error)
    throw new Error("Failed to delete score")
  }
}

// Games
export async function getGames(): Promise<Game[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "games"))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Game[]
  } catch (error) {
    console.error("Error fetching games:", error)
    throw new Error("Failed to fetch games")
  }
}

export async function addGame(game: Omit<Game, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "games"), game)
    return docRef.id
  } catch (error) {
    console.error("Error adding game:", error)
    throw new Error("Failed to add game")
  }
}

export async function updateGame(id: string, game: Partial<Game>): Promise<void> {
  try {
    await updateDoc(doc(db, "games", id), game)
  } catch (error) {
    console.error("Error updating game:", error)
    throw new Error("Failed to update game")
  }
}

export async function deleteGame(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "games", id))
  } catch (error) {
    console.error("Error deleting game:", error)
    throw new Error("Failed to delete game")
  }
}

// Scoring Settings
export async function getScoringSettings(): Promise<ScoringSettings> {
  try {
    const docSnap = await getDoc(doc(db, "settings", "scoring"))
    if (docSnap.exists()) {
      const data = docSnap.data() as ScoringSettings
      // Ensure all required properties exist with defaults
      return {
        physical: {
          threshold1: data.physical?.threshold1 ?? DEFAULT_SCORING_SETTINGS.physical.threshold1,
          threshold2: data.physical?.threshold2 ?? DEFAULT_SCORING_SETTINGS.physical.threshold2,
          maxPoints: data.physical?.maxPoints ?? DEFAULT_SCORING_SETTINGS.physical.maxPoints,
          minPoints: data.physical?.minPoints ?? DEFAULT_SCORING_SETTINGS.physical.minPoints,
        },
        mental: {
          threshold1: data.mental?.threshold1 ?? DEFAULT_SCORING_SETTINGS.mental.threshold1,
          threshold2: data.mental?.threshold2 ?? DEFAULT_SCORING_SETTINGS.mental.threshold2,
          maxPoints: data.mental?.maxPoints ?? DEFAULT_SCORING_SETTINGS.mental.maxPoints,
          minPoints: data.mental?.minPoints ?? DEFAULT_SCORING_SETTINGS.mental.minPoints,
        },
        extras: {
          capMax: data.extras?.capMax ?? DEFAULT_SCORING_SETTINGS.extras.capMax,
          capMin: data.extras?.capMin ?? DEFAULT_SCORING_SETTINGS.extras.capMin,
          points: {
            opcional: {
              muy_bien:
                data.extras?.points?.opcional?.muy_bien ?? DEFAULT_SCORING_SETTINGS.extras.points.opcional.muy_bien,
              regular:
                data.extras?.points?.opcional?.regular ?? DEFAULT_SCORING_SETTINGS.extras.points.opcional.regular,
              no_hecho:
                data.extras?.points?.opcional?.no_hecho ?? DEFAULT_SCORING_SETTINGS.extras.points.opcional.no_hecho,
            },
            obligatoria: {
              muy_bien:
                data.extras?.points?.obligatoria?.muy_bien ??
                DEFAULT_SCORING_SETTINGS.extras.points.obligatoria.muy_bien,
              regular:
                data.extras?.points?.obligatoria?.regular ?? DEFAULT_SCORING_SETTINGS.extras.points.obligatoria.regular,
              no_hecho:
                data.extras?.points?.obligatoria?.no_hecho ??
                DEFAULT_SCORING_SETTINGS.extras.points.obligatoria.no_hecho,
            },
          },
        },
      }
    }
    return DEFAULT_SCORING_SETTINGS
  } catch (error) {
    console.error("Error fetching scoring settings:", error)
    return DEFAULT_SCORING_SETTINGS
  }
}

export async function updateScoringSettings(settings: Omit<ScoringSettings, "id">): Promise<void> {
  try {
    await updateDoc(doc(db, "settings", "scoring"), settings)
  } catch (error) {
    console.error("Error updating scoring settings:", error)
    throw new Error("Failed to update scoring settings")
  }
}

// Utility function to force refresh all data
export async function forceRefreshAllData(): Promise<void> {
  try {
    // This function can be used to trigger a refresh of all cached data
    // Implementation depends on your caching strategy
    console.log("Force refreshing all data...")
  } catch (error) {
    console.error("Error force refreshing data:", error)
    throw new Error("Failed to refresh data")
  }
}

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { PageHeader } from "../../components/page-header"
import { useToast } from "../../hooks/use-toast"
import type { Participant, Game, GameCategory, ExtraGameStatusDetail } from "../../types"
import { Separator } from "../../components/ui/separator"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getParticipants,
  getGames,
  addScore,
  getScoreById,
  updateScore,
  forceRefreshAllData,
} from "../../lib/firestore-services"
import { Skeleton } from "../../components/ui/skeleton"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"

const timeInputSchema = z.object({
  participantId: z.string().min(1, "La selección de participante es obligatoria."),
  tiempo_fisico: z.coerce
    .number({
      invalid_type_error: "El tiempo físico debe ser un número.",
      required_error: "El tiempo físico es obligatorio.",
    })
    .min(0, "El tiempo físico no puede ser negativo."),
  tiempo_mental: z.coerce
    .number({
      invalid_type_error: "El tiempo mental debe ser un número.",
      required_error: "El tiempo mental es obligatorio.",
    })
    .min(0, "El tiempo mental no puede ser negativo."),
  gameTimes: z
    .record(z.string(), z.coerce.number().min(0, "El tiempo de juego no puede ser negativo.").optional())
    .optional(),
  extraGameDetailedStatuses: z.record(z.string(), z.enum(["muy_bien", "regular", "no_hecho"])).optional(),
})

type TimeInputFormValues = z.infer<typeof timeInputSchema>

export default function TimesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [editMode, setEditMode] = useState(false)
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Queries con configuración optimizada para refetch
  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
    error: errorParticipants,
    refetch: refetchParticipants,
  } = useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn: async () => {
      console.log("🔄 Query: Cargando participantes...")
      const result = await getParticipants()
      console.log("✅ Query: Participantes cargados:", result.length)
      return result
    },
    staleTime: 0, // Siempre considerar datos como stale
    gcTime: 0, // No mantener en cache
    retry: 3,
    retryDelay: 1000,
  })

  const {
    data: games = [],
    isLoading: isLoadingGames,
    error: errorGames,
    refetch: refetchGames,
  } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: async () => {
      console.log("🔄 Query: Cargando juegos...")
      const result = await getGames()
      console.log("✅ Query: Juegos cargados:", result.length)
      return result
    },
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: 1000,
  })

  const form = useForm<TimeInputFormValues>({
    resolver: zodResolver(timeInputSchema),
    defaultValues: {
      participantId: "",
      tiempo_fisico: 0,
      tiempo_mental: 0,
      gameTimes: {},
      extraGameDetailedStatuses: {},
    },
  })

  // Effect para manejar modo edición desde URL
  useEffect(() => {
    const scoreIdFromParams = searchParams.get("edit_score_id")
    const participantIdFromParams = searchParams.get("participant_id")

    if (scoreIdFromParams && participantIdFromParams) {
      console.log("🔄 Modo edición activado:", { scoreIdFromParams, participantIdFromParams })
      setEditMode(true)
      setEditingScoreId(scoreIdFromParams)
      setEditingParticipantId(participantIdFromParams)
      form.setValue("participantId", participantIdFromParams)
    } else {
      setEditMode(false)
      setEditingScoreId(null)
      setEditingParticipantId(null)
    }
  }, [searchParams, form])

  // Query para cargar score en modo edición
  const {
    data: scoreToEdit,
    isLoading: isLoadingScoreToEdit,
    isError: isErrorScoreToEdit,
  } = useQuery({
    queryKey: ["scoreToEdit", editingScoreId],
    queryFn: async () => {
      if (!editingScoreId) return null
      console.log("🔄 Query: Cargando score para editar:", editingScoreId)
      const result = await getScoreById(editingScoreId)
      console.log("✅ Query: Score cargado para editar:", result)
      return result
    },
    enabled: !!editingScoreId,
    staleTime: 0,
    gcTime: 0,
    retry: 3,
  })

  // Effect para pre-llenar formulario en modo edición
  useEffect(() => {
    if (editMode && scoreToEdit) {
      console.log("🔄 Pre-llenando formulario con datos existentes:", scoreToEdit)
      form.reset({
        participantId: scoreToEdit.participantId,
        tiempo_fisico: scoreToEdit.tiempo_fisico,
        tiempo_mental: scoreToEdit.tiempo_mental,
        gameTimes: scoreToEdit.gameTimes || {},
        extraGameDetailedStatuses: scoreToEdit.extraGameDetailedStatuses || {},
      })
    } else if (!editMode && games.length > 0) {
      // Establecer estados por defecto para juegos extra
      const defaultExtraStatuses: { [key: string]: ExtraGameStatusDetail } = {}
      games
        .filter((g) => g.category === "Extra")
        .forEach((g) => {
          defaultExtraStatuses[g.id] = "no_hecho"
        })

      form.reset({
        participantId: form.getValues("participantId") || "",
        tiempo_fisico: 0,
        tiempo_mental: 0,
        gameTimes: {},
        extraGameDetailedStatuses: defaultExtraStatuses,
      })
    }
  }, [editMode, scoreToEdit, form, games])

  // Función para invalidar todas las queries relacionadas
  const invalidateAllQueries = async () => {
    console.log("🔄 Invalidando todas las queries...")

    // Forzar refresh de datos en Firestore
    forceRefreshAllData()

    // Invalidar todas las queries de React Query
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["participants"] }),
      queryClient.invalidateQueries({ queryKey: ["games"] }),
      queryClient.invalidateQueries({ queryKey: ["scores"] }),
      queryClient.invalidateQueries({ queryKey: ["scoringSettings"] }),
      queryClient.invalidateQueries({ queryKey: ["recentScores"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] }),
      queryClient.invalidateQueries({ queryKey: ["leaderboardData"] }),
      queryClient.invalidateQueries({ queryKey: ["trendsData"] }),
      queryClient.invalidateQueries({ queryKey: ["comparisonsData"] }),
      queryClient.invalidateQueries({ queryKey: ["calculationsData"] }),
    ])

    // Refetch inmediato de datos críticos
    await Promise.all([refetchParticipants(), refetchGames()])

    console.log("✅ Todas las queries invalidadas y refetcheadas")
  }

  // Mutation para añadir score
  const addScoreMutation = useMutation({
    mutationFn: async (scoreData: any) => {
      console.log("🔄 Mutation: Intentando añadir score:", scoreData)

      // Validar datos antes de enviar
      if (!scoreData.participantId) {
        throw new Error("ID de participante es requerido")
      }
      if (typeof scoreData.tiempo_fisico !== "number" || scoreData.tiempo_fisico < 0) {
        throw new Error("Tiempo físico debe ser un número válido")
      }
      if (typeof scoreData.tiempo_mental !== "number" || scoreData.tiempo_mental < 0) {
        throw new Error("Tiempo mental debe ser un número válido")
      }

      // Preparar datos para Firestore
      const dataToSave = {
        participantId: scoreData.participantId,
        tiempo_fisico: Number(scoreData.tiempo_fisico),
        tiempo_mental: Number(scoreData.tiempo_mental),
        extraGameDetailedStatuses: scoreData.extraGameDetailedStatuses || {},
        gameTimes: scoreData.gameTimes || {},
        recordedAt: new Date(),
      }

      console.log("📤 Mutation: Enviando datos a Firestore:", dataToSave)
      const result = await addScore(dataToSave)
      console.log("✅ Mutation: Score añadido exitosamente:", result)
      return result
    },
    onSuccess: async (newScore) => {
      console.log("🎉 Mutation Success: Score guardado exitosamente:", newScore)

      // Invalidar todas las queries
      await invalidateAllQueries()

      const participantName = participants.find((p) => p.id === newScore.participantId)?.name || "Participante"

      toast({
        title: "¡Puntuación Registrada!",
        description: `Datos para ${participantName} guardados exitosamente. Las estadísticas se han actualizado.`,
        duration: 5000,
      })

      // Reset form
      const defaultExtraStatuses: { [key: string]: ExtraGameStatusDetail } = {}
      games
        .filter((g) => g.category === "Extra")
        .forEach((g) => {
          defaultExtraStatuses[g.id] = "no_hecho"
        })

      form.reset({
        participantId: "",
        tiempo_fisico: 0,
        tiempo_mental: 0,
        gameTimes: {},
        extraGameDetailedStatuses: defaultExtraStatuses,
      })

      // Esperar un poco antes de navegar para asegurar que las queries se actualicen
      setTimeout(() => {
        router.push("/statistics/leaderboard")
      }, 1000)
    },
    onError: (error) => {
      console.error("❌ Mutation Error: Error al añadir score:", error)
      toast({
        title: "Error al registrar puntuación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  // Mutation para actualizar score
  const updateScoreMutation = useMutation({
    mutationFn: async (data: { scoreId: string; values: TimeInputFormValues }) => {
      console.log("🔄 Mutation: Intentando actualizar score:", data)

      const { participantId, ...updatableValues } = data.values
      const dataToUpdate = {
        tiempo_fisico: Number(updatableValues.tiempo_fisico),
        tiempo_mental: Number(updatableValues.tiempo_mental),
        gameTimes: updatableValues.gameTimes || {},
        extraGameDetailedStatuses: updatableValues.extraGameDetailedStatuses || {},
      }

      console.log("📤 Mutation: Actualizando datos en Firestore:", dataToUpdate)
      await updateScore(data.scoreId, dataToUpdate)
      console.log("✅ Mutation: Score actualizado exitosamente")
      return dataToUpdate
    },
    onSuccess: async () => {
      console.log("🎉 Mutation Success: Score actualizado exitosamente")

      // Invalidar todas las queries
      await invalidateAllQueries()

      toast({
        title: "Puntuación Actualizada",
        description: "Los datos han sido actualizados exitosamente. Las estadísticas se han refrescado.",
        duration: 5000,
      })

      // Esperar un poco antes de navegar
      setTimeout(() => {
        router.push("/statistics/leaderboard")
      }, 1000)
    },
    onError: (error) => {
      console.error("❌ Mutation Error: Error al actualizar score:", error)
      toast({
        title: "Error al actualizar puntuación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  // Effect para establecer estados por defecto de juegos extra
  useEffect(() => {
    if (games.length > 0 && !editMode) {
      const initialExtraStatuses: { [key: string]: ExtraGameStatusDetail } = {}
      games
        .filter((g) => g.category === "Extra")
        .forEach((g) => {
          initialExtraStatuses[g.id] = "no_hecho"
        })

      const currentExtraStatuses = form.getValues("extraGameDetailedStatuses")
      const hasUserSetExtraStatus =
        currentExtraStatuses && Object.values(currentExtraStatuses).some((status) => status !== "no_hecho")

      if (!hasUserSetExtraStatus || !currentExtraStatuses || Object.keys(currentExtraStatuses).length === 0) {
        form.setValue("extraGameDetailedStatuses", initialExtraStatuses)
      }
    }
  }, [games, form, editMode])

  // Función de submit
  async function onSubmit(values: TimeInputFormValues) {
    console.log("🔄 Formulario enviado con valores:", values)
    setIsSubmitting(true)

    try {
      if (editMode && editingScoreId) {
        await updateScoreMutation.mutateAsync({ scoreId: editingScoreId, values })
      } else {
        await addScoreMutation.mutateAsync(values)
      }
    } catch (error) {
      console.error("❌ Error en submit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejo de errores
  if (errorParticipants || errorGames || (editMode && isErrorScoreToEdit)) {
    const errorMessage = errorParticipants?.message || errorGames?.message || "Error al cargar datos"
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar los datos: {errorMessage}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Estado de carga
  if (isLoadingParticipants || isLoadingGames || (editMode && isLoadingScoreToEdit && !scoreToEdit)) {
    return (
      <>
        <PageHeader
          title={editMode ? "Editar Puntuación" : "Registrar Tiempos y Estados"}
          description={
            editMode
              ? "Modifica los detalles de la puntuación."
              : "Introduce tiempos totales físicos, mentales y estados para los desafíos extra."
          }
        />
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-4 w-4/5 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  // Funciones de renderizado
  const renderGameTimeFields = (category: GameCategory) => {
    const categoryGames = games.filter((game) => game.category === category)
    if (categoryGames.length === 0 || category === "Extra") return null

    return (
      <div className="mt-4 space-y-4">
        <h4 className="text-md font-semibold text-muted-foreground">
          Tiempos de Juegos {category === "Physical" ? "Físicos" : "Mentales"} (Registro Individual Opcional)
        </h4>
        {categoryGames.map((game) => (
          <FormField
            key={game.id}
            control={form.control}
            name={`gameTimes.${game.id}`}
            render={({ field }) => (
              <FormItem className="ml-4">
                <FormLabel>{game.name} (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="ej., 10"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                    }
                    step="any"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    )
  }

  const renderExtraGameStatusFields = () => {
    const extraGames = games.filter((game) => game.category === "Extra")
    if (extraGames.length === 0) {
      return (
        <div className="mt-4">
          <h4 className="text-md font-semibold text-muted-foreground">Estado de Juegos Extra</h4>
          <p className="text-sm text-muted-foreground ml-4 mt-2">
            No hay juegos "Extra" definidos. Añádelos en la página de Juegos.
          </p>
        </div>
      )
    }

    return (
      <div className="mt-4 space-y-4">
        <h4 className="text-md font-semibold text-muted-foreground">Estado de Juegos Extra</h4>
        {extraGames.map((game) => (
          <FormField
            key={game.id}
            control={form.control}
            name={`extraGameDetailedStatuses.${game.id}`}
            render={({ field }) => (
              <FormItem className="ml-4">
                <FormLabel>
                  {game.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({game.extraType === "obligatoria" ? "obligatoria" : "opcional"})
                  </span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "no_hecho"} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="muy_bien">Muy Bien</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="no_hecho">No Hecho</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={editMode ? "Editar Puntuación" : "Registrar Tiempos y Estados"}
        description={
          editMode
            ? "Modifica los detalles de la puntuación existente."
            : "Introduce tiempos totales físicos, mentales y estados para los desafíos extra."
        }
      />

      {/* Mostrar información de debug si hay datos */}
      {participants.length > 0 && games.length > 0 && (
        <Alert className="max-w-2xl mx-auto mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Sistema conectado: {participants.length} participantes y {games.length} juegos cargados.
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editMode ? "Actualizar Entrada de Puntuación" : "Nueva Entrada de Puntuación"}
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          {editMode && scoreToEdit && participants.find((p) => p.id === scoreToEdit.participantId) && (
            <CardDescription>
              Editando la puntuación de:{" "}
              <strong>{participants.find((p) => p.id === scoreToEdit.participantId)?.name}</strong> registrada el{" "}
              {new Date(scoreToEdit.recordedAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="participantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participante</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || editMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar un participante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {participants.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No se encontraron participantes. Añade participantes en la página de Participantes.
                          </div>
                        ) : (
                          participants.map((participant) => (
                            <SelectItem key={participant.id} value={participant.id}>
                              {participant.name} (Año {participant.year})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="tiempo_fisico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo Total Desafío Físico (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ej., 240.5" {...field} step="any" disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Tiempo total para todos los desafíos físicos. (ej. ≤220 para 100pts, ≥360 para 30pts)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {renderGameTimeFields("Physical")}

              <Separator />

              <FormField
                control={form.control}
                name="tiempo_mental"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo Total Desafío Mental (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ej., 60" {...field} step="any" disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Tiempo total para todos los desafíos mentales. (ej. ≤50 para 100pts, ≥120 para 30pts)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {renderGameTimeFields("Mental")}

              <Separator />

              {renderExtraGameStatusFields()}

              <Separator />

              <div className="flex justify-end space-x-2">
                {editMode && (
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting || participants.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editMode ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : editMode ? (
                    "Actualizar Puntuación"
                  ) : (
                    "Guardar Datos"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "../../../components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Checkbox } from "../../../components/ui/checkbox"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../../components/ui/chart"
import type { ChartConfig, Participant, Score, Game, MultiMetricDataPoint, ScoringSettings } from "../../../types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Skeleton } from "../../../components/ui/skeleton"
import { getParticipants, getScores, getGames, getScoringSettings } from "../../../lib/firestore-services"
import { calculateAllParticipantScores } from "../../../lib/data-utils"
import { Users, Trophy, Clock } from "lucide-react"

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--muted-foreground))",
]

const getColor = (index: number) => chartColors[index % chartColors.length]

interface ProcessedPageData {
  participants: Participant[]
  allScores: Score[]
  games: Game[]
  participantsMap: Map<string, Participant>
  gamesMap: Map<string, Game>
  scoringSettings: ScoringSettings
}

export default function ComparisonsPage() {
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([])

  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
    error: errorParticipants,
  } = useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn: getParticipants,
  })

  const {
    data: allScores = [],
    isLoading: isLoadingScores,
    error: errorScores,
  } = useQuery<Score[]>({
    queryKey: ["scores"],
    queryFn: getScores,
  })

  const {
    data: games = [],
    isLoading: isLoadingGames,
    error: errorGames,
  } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: getGames,
  })

  const {
    data: scoringSettings,
    isLoading: isLoadingSettings,
    error: errorSettings,
  } = useQuery<ScoringSettings>({
    queryKey: ["scoringSettings"],
    queryFn: getScoringSettings,
  })

  const isLoadingOverall = isLoadingParticipants || isLoadingScores || isLoadingGames || isLoadingSettings
  const overallError = errorParticipants || errorScores || errorGames || errorSettings

  const processedData = useMemo((): ProcessedPageData | null => {
    if (
      isLoadingOverall ||
      overallError ||
      !participants.length ||
      !allScores.length ||
      !games.length ||
      !scoringSettings
    )
      return null

    const participantsMap = new Map(participants.map((p) => [p.id, p]))
    const gamesMap = new Map(games.map((g) => [g.id, g]))

    return { participants, allScores, games, participantsMap, gamesMap, scoringSettings }
  }, [participants, allScores, games, scoringSettings, isLoadingOverall, overallError])

  const handleParticipantSelection = (participantId: string, checked: boolean) => {
    setSelectedParticipantIds((prev) =>
      checked ? [...prev, participantId] : prev.filter((id) => id !== participantId),
    )
  }

  const handleGameSelection = (gameId: string, checked: boolean) => {
    setSelectedGameIds((prev) => (checked ? [...prev, gameId] : prev.filter((id) => id !== gameId)))
  }

  const testScoreComparisonChart = useMemo(() => {
    if (
      !processedData ||
      selectedParticipantIds.length === 0 ||
      selectedGameIds.length === 0 ||
      !processedData.allScores.length ||
      !processedData.scoringSettings
    ) {
      return { chartData: [], chartConfig: {} }
    }

    const {
      participants: allParticipantsList,
      games: allGamesList,
      allScores: allScoresList,
      participantsMap,
      gamesMap,
      scoringSettings: currentSettings,
    } = processedData

    const selectedGames = selectedGameIds
      .map((id) => gamesMap.get(id))
      .filter(Boolean)
      .filter((game) => game!.category === "Physical" || game!.category === "Mental") as Game[]

    if (selectedGames.length === 0) return { chartData: [], chartConfig: {} }

    const leaderboardForLatestScores = calculateAllParticipantScores(
      allParticipantsList,
      allScoresList,
      allGamesList,
      currentSettings,
    )

    // Filter to only selected participants
    const selectedParticipantsData = leaderboardForLatestScores.filter((entry) =>
      selectedParticipantIds.includes(entry.id),
    )

    const chartData: MultiMetricDataPoint[] = selectedParticipantsData
      .map((entry) => {
        const participantName = participantsMap.get(entry.id)?.name || entry.id
        const dataPoint: MultiMetricDataPoint = { name: participantName }
        selectedGames.forEach((game) => {
          const gameTime = entry.gameTimes?.[game.id]
          dataPoint[game.name] = gameTime !== undefined && gameTime !== null ? Number(gameTime.toFixed(2)) : null
        })
        return dataPoint
      })
      .filter((dp) => selectedGames.some((game) => dp[game.name] !== null && dp[game.name] !== undefined))

    const chartConfig: ChartConfig = {}
    selectedGames.forEach((game, index) => {
      chartConfig[game.name] = {
        label: `${game.name}`,
        color: getColor(index),
      }
    })

    return { chartData, chartConfig }
  }, [processedData, selectedParticipantIds, selectedGameIds])

  const renderTestScoreChart = (
    title: string,
    description: string,
    data: MultiMetricDataPoint[],
    config: ChartConfig,
  ) => {
    if (isLoadingOverall) return <Skeleton className="h-[500px] w-full shadow-lg" />

    if (selectedParticipantIds.length === 0 || selectedGameIds.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center h-[500px] shadow-lg">
          <div className="text-center space-y-4">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Selecciona Participantes y Juegos</h3>
              <p className="text-muted-foreground">
                Elige al menos un participante y un juego para ver la comparación de rendimiento.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              {selectedParticipantIds.length === 0 && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Selecciona participantes
                </Badge>
              )}
              {selectedGameIds.length === 0 && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Selecciona juegos
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )
    }

    if (data.length === 0) {
      return (
        <Card className="flex items-center justify-center h-[500px] shadow-lg">
          <div className="text-center space-y-2">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No hay datos de rendimiento disponibles para la selección actual.</p>
            <p className="text-sm text-muted-foreground">
              Verifica que los participantes seleccionados tengan puntuaciones registradas en los juegos elegidos.
            </p>
          </div>
        </Card>
      )
    }

    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-sm text-muted-foreground">
              Comparando: {selectedParticipantIds.length} participante(s) en {selectedGameIds.length} juego(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: "Tiempo (minutos)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin", "auto"]}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                {Object.keys(config).map((gameName) => (
                  <Bar
                    key={gameName}
                    dataKey={gameName}
                    fill={config[gameName]?.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  if (overallError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-destructive">Error al cargar datos</h3>
            <p className="text-muted-foreground">{(overallError as Error).message}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Comparativas de Rendimiento"
        description="Compara el rendimiento en pruebas específicas entre participantes seleccionados."
      />

      {isLoadingOverall ? (
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Selection Controls */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Participant Selection */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Seleccionar Participantes
                </CardTitle>
                <CardDescription>
                  Elige los participantes que deseas comparar (mínimo 1, recomendado 2-4)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedData && processedData.participants.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {processedData.participants.map((p) => (
                      <div key={p.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox
                          id={`participant-${p.id}`}
                          checked={selectedParticipantIds.includes(p.id)}
                          onCheckedChange={(checked) => handleParticipantSelection(p.id, !!checked)}
                        />
                        <Label
                          htmlFor={`participant-${p.id}`}
                          className="flex-1 cursor-pointer font-medium hover:text-primary transition-colors"
                        >
                          {p.name}
                        </Label>
                        {selectedParticipantIds.includes(p.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Seleccionado
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay participantes disponibles.</p>
                )}
                {selectedParticipantIds.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedParticipantIds.length} participante(s) seleccionado(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Selection */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Seleccionar Juegos
                </CardTitle>
                <CardDescription>Elige las pruebas físicas o mentales para comparar el rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                {processedData &&
                processedData.games.filter((g) => g.category === "Physical" || g.category === "Mental").length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {processedData.games
                      .filter((g) => g.category === "Physical" || g.category === "Mental")
                      .map((g) => (
                        <div key={g.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <Checkbox
                            id={`game-${g.id}`}
                            checked={selectedGameIds.includes(g.id)}
                            onCheckedChange={(checked) => handleGameSelection(g.id, !!checked)}
                          />
                          <Label
                            htmlFor={`game-${g.id}`}
                            className="flex-1 cursor-pointer font-medium hover:text-primary transition-colors"
                          >
                            {g.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {g.category === "Physical" ? "Físico" : "Mental"}
                          </Badge>
                          {selectedGameIds.includes(g.id) && (
                            <Badge variant="secondary" className="text-xs">
                              Seleccionado
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay juegos físicos o mentales disponibles para comparación.
                  </p>
                )}
                {selectedGameIds.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">{selectedGameIds.length} juego(s) seleccionado(s)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Chart */}
          {renderTestScoreChart(
            "Comparación de Rendimiento por Prueba",
            "Tiempos de rendimiento de los participantes seleccionados en las pruebas elegidas. Menor tiempo indica mejor rendimiento.",
            testScoreComparisonChart.chartData,
            testScoreComparisonChart.chartConfig,
          )}

          {/* Summary Information */}
          {selectedParticipantIds.length > 0 && selectedGameIds.length > 0 && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{selectedParticipantIds.length}</div>
                    <div className="text-sm text-muted-foreground">Participantes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{selectedGameIds.length}</div>
                    <div className="text-sm text-muted-foreground">Pruebas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {selectedParticipantIds.length * selectedGameIds.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Comparaciones</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  )
}

"use client"

import type React from "react"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "../../../components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { ChartContainer, ChartTooltip } from "../../../components/ui/chart"
import type { ChartConfig, Participant, Score, Game, LeaderboardEntry, ScoringSettings } from "../../../types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Skeleton } from "../../../components/ui/skeleton"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { getParticipants, getScores, getGames, getScoringSettings } from "../../../lib/firestore-services"
import { calculateAllParticipantScores } from "../../../lib/data-utils"
import { TrendingUp, Trophy, Timer, Target, Activity, Users, Zap, AlertCircle, BarChart3 } from "lucide-react"

// Colores modernos para las gráficas
const CHART_COLORS = {
  primary: "#8B5CF6",
  secondary: "#06B6D4",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#6366F1",
  pink: "#EC4899",
  teal: "#14B8A6",
  orange: "#F97316",
  purple: "#A855F7",
}

const COLOR_PALETTE = Object.values(CHART_COLORS)

const getColor = (index: number) => COLOR_PALETTE[index % COLOR_PALETTE.length]

// Tooltip personalizado mejorado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl">
        <p className="text-foreground font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium text-foreground">
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes("Tiempo") ? " min" : " pts"}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Componente de tarjeta de estadística mejorado
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  colorClass,
  trend,
}: {
  icon: React.ElementType
  title: string
  value: string
  subtitle?: string
  colorClass: string
  trend?: number
}) => (
  <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              trend > 0
                ? "bg-green-100 text-green-700"
                : trend < 0
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
      <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
      <p className="text-foreground text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </CardContent>
  </Card>
)

interface ProcessedPageData {
  participants: Participant[]
  allScores: Score[]
  games: Game[]
  leaderboardForLatestScores: LeaderboardEntry[]
  participantsMap: Map<string, Participant>
  gamesMap: Map<string, Game>
  scoringSettings: ScoringSettings
}

export default function TrendsPage() {
  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
    error: errorParticipants,
  } = useQuery<Participant[]>({
    queryKey: ["participants"],
    queryFn: getParticipants,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  const {
    data: allScores = [],
    isLoading: isLoadingScores,
    error: errorScores,
  } = useQuery<Score[]>({
    queryKey: ["scores"],
    queryFn: getScores,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: games = [],
    isLoading: isLoadingGames,
    error: errorGames,
  } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: getGames,
    staleTime: 10 * 60 * 1000, // 10 minutos (los juegos cambian menos)
  })

  const {
    data: scoringSettings,
    isLoading: isLoadingSettings,
    error: errorSettings,
  } = useQuery<ScoringSettings>({
    queryKey: ["scoringSettings"],
    queryFn: getScoringSettings,
    staleTime: 10 * 60 * 1000,
  })

  const isLoadingOverall = isLoadingParticipants || isLoadingScores || isLoadingGames || isLoadingSettings
  const overallError = errorParticipants || errorScores || errorGames || errorSettings

  // Datos procesados con mejor manejo de errores
  const processedData = useMemo((): ProcessedPageData | null => {
    if (isLoadingOverall || overallError) return null

    if (!participants.length) {
      console.warn("No participants found")
      return null
    }

    if (!allScores.length) {
      console.warn("No scores found")
      return null
    }

    if (!games.length) {
      console.warn("No games found")
      return null
    }

    if (!scoringSettings) {
      console.warn("No scoring settings found")
      return null
    }

    try {
      const participantsMap = new Map(participants.map((p) => [p.id, p]))
      const gamesMap = new Map(games.map((g) => [g.id, g]))

      const leaderboardForLatestScores = calculateAllParticipantScores(participants, allScores, games, scoringSettings)

      console.log("Processed data:", {
        participantsCount: participants.length,
        scoresCount: allScores.length,
        gamesCount: games.length,
        leaderboardCount: leaderboardForLatestScores.length,
      })

      return {
        participants,
        allScores,
        games,
        leaderboardForLatestScores,
        participantsMap,
        gamesMap,
        scoringSettings,
      }
    } catch (error) {
      console.error("Error processing data:", error)
      return null
    }
  }, [participants, allScores, games, scoringSettings, isLoadingOverall, overallError])

  // Datos para gráfica de radar (Top 5)
  const radarData = useMemo(() => {
    if (!processedData?.leaderboardForLatestScores.length) return []

    return processedData.leaderboardForLatestScores.slice(0, 5).map((entry) => ({
      participant: processedData.participantsMap.get(entry.id)?.name.split(" ")[0] || entry.id,
      Físico: Math.round(entry.puntos_fisico || 0),
      Mental: Math.round(entry.puntos_mental || 0),
      Extra: Math.round(entry.puntos_extras || 0),
    }))
  }, [processedData])

  // Datos para gráfica de área acumulativa
  const areaChartData = useMemo(() => {
    if (!processedData?.leaderboardForLatestScores.length) return []

    return processedData.leaderboardForLatestScores.slice(0, 10).map((entry, index) => ({
      name: processedData.participantsMap.get(entry.id)?.name.split(" ")[0] || `P${index + 1}`,
      "Puntos Físicos": Math.round(entry.puntos_fisico || 0),
      "Puntos Mentales": Math.round(entry.puntos_mental || 0),
      "Puntos Extra": Math.round(entry.puntos_extras || 0),
      Total: Math.round(entry.puntos_total || 0),
    }))
  }, [processedData])

  // Datos para gráfica de distribución (pie chart)
  const distributionData = useMemo(() => {
    if (!processedData?.leaderboardForLatestScores.length) return []

    const totals = processedData.leaderboardForLatestScores.reduce(
      (acc, entry) => ({
        physical: acc.physical + (entry.puntos_fisico || 0),
        mental: acc.mental + (entry.puntos_mental || 0),
        extra: acc.extra + (entry.puntos_extras || 0),
      }),
      { physical: 0, mental: 0, extra: 0 },
    )

    return [
      { name: "Puntos Físicos", value: Math.round(totals.physical), color: CHART_COLORS.primary },
      { name: "Puntos Mentales", value: Math.round(totals.mental), color: CHART_COLORS.secondary },
      { name: "Puntos Extra", value: Math.round(totals.extra), color: CHART_COLORS.success },
    ]
  }, [processedData])

  // Estadísticas generales
  const statsData = useMemo(() => {
    if (!processedData?.leaderboardForLatestScores.length) return null

    const { leaderboardForLatestScores } = processedData
    const totalParticipants = leaderboardForLatestScores.length

    const avgPhysical =
      leaderboardForLatestScores.reduce((sum, entry) => sum + (entry.puntos_fisico || 0), 0) / totalParticipants
    const avgMental =
      leaderboardForLatestScores.reduce((sum, entry) => sum + (entry.puntos_mental || 0), 0) / totalParticipants
    const avgExtra =
      leaderboardForLatestScores.reduce((sum, entry) => sum + (entry.puntos_extras || 0), 0) / totalParticipants
    const maxTotal = Math.max(...leaderboardForLatestScores.map((entry) => entry.puntos_total || 0))

    return {
      totalParticipants,
      avgPhysical: avgPhysical.toFixed(1),
      avgMental: avgMental.toFixed(1),
      avgExtra: avgExtra.toFixed(1),
      maxTotal: maxTotal.toFixed(1),
    }
  }, [processedData])

  // Datos por categoría para gráficas de barras
  const categoryData = useMemo(() => {
    if (!processedData?.leaderboardForLatestScores.length) return { Physical: [], Mental: [], Extra: [] }

    const { leaderboardForLatestScores, participantsMap } = processedData

    const physicalData = leaderboardForLatestScores
      .map((entry) => ({
        name: participantsMap.get(entry.id)?.name.split(" ")[0] || entry.id,
        score: entry.puntos_fisico || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    const mentalData = leaderboardForLatestScores
      .map((entry) => ({
        name: participantsMap.get(entry.id)?.name.split(" ")[0] || entry.id,
        score: entry.puntos_mental || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    const extraData = leaderboardForLatestScores
      .map((entry) => ({
        name: participantsMap.get(entry.id)?.name.split(" ")[0] || entry.id,
        score: entry.puntos_extras || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    return { Physical: physicalData, Mental: mentalData, Extra: extraData }
  }, [processedData])

  // Componente de gráfica de barras mejorado
  const EnhancedBarChart = ({
    title,
    data,
    color,
    description,
  }: {
    title: string
    data: { name: string; score: number }[]
    color: string
    description?: string
  }) => {
    if (!data.length) {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay datos disponibles</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    const config: ChartConfig = {
      score: {
        label: "Puntos",
        color,
      },
    }

    return (
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => (value.length > 8 ? `${value.substring(0, 6)}...` : value)}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill={color} radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Manejo de errores
  if (overallError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Análisis de Tendencias" description="Visualización avanzada del rendimiento." />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar datos: {(overallError as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Estado de carga
  if (isLoadingOverall) {
    return (
      <div className="space-y-8">
        <PageHeader title="Análisis de Tendencias" description="Cargando datos..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[450px] w-full rounded-2xl" />
          <Skeleton className="h-[450px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // Sin datos
  if (!processedData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Análisis de Tendencias" description="Visualización avanzada del rendimiento." />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay datos suficientes para mostrar las tendencias. Asegúrate de que hay participantes, juegos y
            puntuaciones registradas.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Análisis de Tendencias"
        description="Visualización avanzada del rendimiento por categorías con gráficas interactivas y estadísticas detalladas."
      />

      {/* Tarjetas de estadísticas */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Participantes Activos"
            value={statsData.totalParticipants.toString()}
            subtitle="Total registrados"
            colorClass="bg-gradient-to-r from-blue-500 to-cyan-600"
          />
          <StatCard
            icon={Timer}
            title="Promedio Físico"
            value={`${statsData.avgPhysical} pts`}
            subtitle="Puntos físicos promedio"
            colorClass="bg-gradient-to-r from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Activity}
            title="Promedio Mental"
            value={`${statsData.avgMental} pts`}
            subtitle="Puntos mentales promedio"
            colorClass="bg-gradient-to-r from-green-500 to-emerald-600"
          />
          <StatCard
            icon={Trophy}
            title="Puntuación Máxima"
            value={`${statsData.maxTotal} pts`}
            subtitle="Mejor puntuación total"
            colorClass="bg-gradient-to-r from-orange-500 to-red-600"
          />
        </div>
      )}

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica de área acumulativa */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Distribución de Puntos por Participante
            </CardTitle>
            <CardDescription>
              Comparación de puntos físicos, mentales y extra entre los mejores participantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[400px] w-full">
              <ResponsiveContainer>
                <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="physicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="extraGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Puntos Físicos"
                    stackId="1"
                    stroke={CHART_COLORS.primary}
                    fill="url(#physicalGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Puntos Mentales"
                    stackId="1"
                    stroke={CHART_COLORS.secondary}
                    fill="url(#mentalGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Puntos Extra"
                    stackId="1"
                    stroke={CHART_COLORS.success}
                    fill="url(#extraGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfica de distribución */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Distribución Total
            </CardTitle>
            <CardDescription>Proporción de puntos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[400px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de radar para top 5 */}
      {radarData.length > 0 && (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Análisis Multidimensional - Top 5 Participantes
            </CardTitle>
            <CardDescription>Comparación del rendimiento en las tres categorías principales</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[500px] w-full">
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="participant" className="text-sm" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Radar
                    name="Físico"
                    dataKey="Físico"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Mental"
                    dataKey="Mental"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Extra"
                    dataKey="Extra"
                    stroke={CHART_COLORS.success}
                    fill={CHART_COLORS.success}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráficas por categoría */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">Análisis por Categorías</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <EnhancedBarChart
            title="Top Puntos Físicos"
            description="Mejores participantes en desafíos físicos"
            data={categoryData.Physical}
            color={CHART_COLORS.primary}
          />

          <EnhancedBarChart
            title="Top Puntos Mentales"
            description="Mejores participantes en desafíos mentales"
            data={categoryData.Mental}
            color={CHART_COLORS.secondary}
          />

          <EnhancedBarChart
            title="Top Puntos Extra"
            description="Mejores participantes en actividades extra"
            data={categoryData.Extra}
            color={CHART_COLORS.success}
          />
        </div>
      </div>
    </div>
  )
}

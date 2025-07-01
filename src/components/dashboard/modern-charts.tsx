"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import type { ParticipantWithScore, ScoreDistribution, YearDistribution, PerformanceTrend } from "../../lib/data-utils"

interface ModernChartsProps {
  participantsWithScores: ParticipantWithScore[]
  scoreDistribution: ScoreDistribution[]
  yearDistribution: YearDistribution[]
  performanceTrends: PerformanceTrend[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function ModernCharts({
  participantsWithScores,
  scoreDistribution,
  yearDistribution,
  performanceTrends,
}: ModernChartsProps) {
  // Get top 8 participants for the leaderboard chart
  const top8Participants = participantsWithScores.slice(0, 8)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Score Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>Distribution of participant scores across ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Participants",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top 8 Participants Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 8 Participants</CardTitle>
          <CardDescription>Breakdown of scores by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              puntos_fisico: {
                label: "Physical",
                color: "hsl(var(--chart-1))",
              },
              puntos_mental: {
                label: "Mental",
                color: "hsl(var(--chart-2))",
              },
              puntos_extras: {
                label: "Extras",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top8Participants}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="puntos_fisico" stackId="a" fill="var(--color-puntos_fisico)" />
                <Bar dataKey="puntos_mental" stackId="a" fill="var(--color-puntos_mental)" />
                <Bar dataKey="puntos_extras" stackId="a" fill="var(--color-puntos_extras)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Year Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Year Distribution</CardTitle>
          <CardDescription>Participants by academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Participants",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={yearDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ year, percentage }) => `Year ${year}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {yearDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Evolution</CardTitle>
          <CardDescription>Average scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              averageScore: {
                label: "Average Score",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="averageScore"
                  stroke="var(--color-averageScore)"
                  fill="var(--color-averageScore)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

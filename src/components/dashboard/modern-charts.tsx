"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ChartData {
  label: string
  value: number
  color: string
  percentage: number
}

interface ModernChartsProps {
  data?: ChartData[]
}

export const ModernCharts: React.FC<ModernChartsProps> = ({
  data = [
    { label: "Excellent", value: 85, color: "bg-green-500", percentage: 42 },
    { label: "Good", value: 65, color: "bg-blue-500", percentage: 32 },
    { label: "Average", value: 45, color: "bg-yellow-500", percentage: 18 },
    { label: "Below Average", value: 25, color: "bg-red-500", percentage: 8 },
  ],
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((item, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{item.value}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.percentage}%
                </Badge>
              </div>
              <Progress value={item.percentage} className="h-2" />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-muted-foreground">Performance Level</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ModernCharts

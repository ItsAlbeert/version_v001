import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface ChartProps {
  title: string
  children: React.ReactNode
}

const ChartContainer: React.FC<ChartProps> = ({ title, children }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0 pt-4 px-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="pl-4 pr-4">
        <div className="rounded-lg p-4 bg-white/80 backdrop-blur-sm">{children}</div>
      </CardContent>
    </Card>
  )
}

export default ChartContainer

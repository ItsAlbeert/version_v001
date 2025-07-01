"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, Target } from "lucide-react"

interface ParticipantData {
  id: string
  name: string
  email: string
  score: number
  progress: number
  status: "active" | "inactive" | "pending"
  lastActivity: string
  completedTasks: number
  totalTasks: number
}

interface ParticipantCardProps {
  participant?: ParticipantData
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200"
    case "inactive":
      return "bg-red-100 text-red-800 border-red-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    score: 85,
    progress: 75,
    status: "active",
    lastActivity: "2 hours ago",
    completedTasks: 12,
    totalTasks: 16,
  },
}) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Participant Profile</CardTitle>
          <Badge className={`text-xs ${getStatusColor(participant.status)}`}>
            {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {participant.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{participant.name}</h3>
            <p className="text-sm text-muted-foreground">{participant.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Score</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{participant.score}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{participant.progress}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Task Completion</span>
            <span>
              {participant.completedTasks}/{participant.totalTasks}
            </span>
          </div>
          <Progress value={(participant.completedTasks / participant.totalTasks) * 100} className="h-2" />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last activity: {participant.lastActivity}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ParticipantCard

"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ModernCharts } from "@/components/dashboard/modern-charts"
import { ParticipantPyramid } from "@/components/dashboard/participant-pyramid"
import { ParticipantCard } from "./participant-card"
import { Users, Trophy, Activity, BarChart3, Target } from "lucide-react"

// Mock data for demonstration
const dashboardStats = [
  {
    title: "Total Participants",
    value: "1,234",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "Active participants this month",
  },
  {
    title: "Best Score",
    value: "98.5",
    change: "+5.2",
    changeType: "positive" as const,
    icon: Trophy,
    description: "Highest score achieved",
  },
  {
    title: "Average Score",
    value: "76.3",
    change: "+2.1",
    changeType: "positive" as const,
    icon: Target,
    description: "Overall performance average",
  },
  {
    title: "Active Sessions",
    value: "89",
    change: "-3%",
    changeType: "negative" as const,
    icon: Activity,
    description: "Currently active sessions",
  },
]

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your dashboard! Monitor performance and track progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                        {stat.change}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="shadow-sm">
                    <CardHeader>
                      <Skeleton className="h-4 w-20" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-2 w-full mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <ModernCharts />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Participant Pyramid */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <Card className="shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-6 w-12" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <ParticipantPyramid />
            </Suspense>
          </div>

          {/* Participant Card */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <Card className="shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <ParticipantCard />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

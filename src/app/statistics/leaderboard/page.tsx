import type React from "react"
import { LeaderboardTable } from "@/components/LeaderboardTable"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "View the leaderboard of top players.",
}

const LeaderboardPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <Card>
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <LeaderboardTable />
        </Card>
      </main>
    </div>
  )
}

const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-8 w-full max-w-4xl">{children}</div>
}

export default LeaderboardPage

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Application dashboard",
}

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-slate-600">
          Welcome to your dashboard! Here you can manage your account and view your data.
        </p>
      </div>
    </div>
  )
}

export default DashboardPage

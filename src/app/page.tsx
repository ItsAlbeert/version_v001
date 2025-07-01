"use client"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Trophy, Users, Timer, BarChart3, Calculator, Gamepad2, TrendingUp, GitCompare, Zap } from "lucide-react"

export default function Page() {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Gestión de Participantes",
      description: "Registra y administra participantes con fotos y detalles del año académico.",
      href: "/participants",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-purple-500" />,
      title: "Configuración de Juegos",
      description: "Define juegos físicos, mentales y extra con descripciones detalladas.",
      href: "/games",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      icon: <Timer className="w-8 h-8 text-green-500" />,
      title: "Registro de Tiempos",
      description: "Captura tiempos de rendimiento y estados de juegos extra de forma eficiente.",
      href: "/times",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Clasificación en Vivo",
      description: "Visualiza rankings actualizados con desglose detallado de puntuaciones.",
      href: "/statistics/leaderboard",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-indigo-500" />,
      title: "Análisis de Tendencias",
      description: "Gráficas avanzadas y estadísticas de rendimiento por categorías.",
      href: "/statistics/trends",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
    },
    {
      icon: <GitCompare className="w-8 h-8 text-pink-500" />,
      title: "Comparativas",
      description: "Compara participantes y juegos con visualizaciones interactivas.",
      href: "/statistics/comparisons",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
    },
    {
      icon: <Calculator className="w-8 h-8 text-orange-500" />,
      title: "Motor de Cálculo",
      description: "Transparencia total en el sistema de puntuación con configuración ajustable.",
      href: "/calculations",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-cyan-500" />,
      title: "Panel de Control",
      description: "Vista general con métricas clave y estadísticas en tiempo real.",
      href: "/dashboard",
      color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200",
    },
  ]

  const stats = [
    { label: "Categorías de Juegos", value: "3", description: "Físico, Mental, Extra" },
    { label: "Sistema de Puntuación", value: "Dinámico", description: "Configurable y transparente" },
    { label: "Análisis", value: "Tiempo Real", description: "Estadísticas instantáneas" },
    { label: "Visualización", value: "Avanzada", description: "Gráficas interactivas" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full">
                  <Zap className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6">
              ChronoScore
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Sistema avanzado de seguimiento y puntuación para competiciones.
              <span className="block mt-2 text-lg text-gray-500">
                Gestión completa de participantes, tiempos y análisis estadístico en tiempo real.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ir al Panel de Control
                </Button>
              </Link>
              <Link href="/statistics/leaderboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Ver Clasificación
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
                >
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Funcionalidades Principales</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Herramientas completas para gestionar competiciones de forma profesional y eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <Card
                className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${feature.color} border-2`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-full shadow-md">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Configura tu primera competición y experimenta el poder del análisis de datos en tiempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/participants">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Añadir Participantes
                </Button>
              </Link>
              <Link href="/games">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Configurar Juegos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Zap className="w-6 h-6 text-purple-600 mr-2" />
              <span className="text-lg font-semibold text-gray-800">ChronoScore</span>
              <Badge variant="secondary" className="ml-2">
                v1.0.0
              </Badge>
            </div>
            <p className="text-gray-600">Sistema de gestión de competiciones desarrollado con Next.js y Firebase.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

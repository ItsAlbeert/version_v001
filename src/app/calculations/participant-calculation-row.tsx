"use client"
import { motion } from "framer-motion"

import type { CalculationBreakdownEntry, Game, ExtraGameStatusDetail } from "../../types"
import { TableCell } from "../../components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { HelpCircle } from "lucide-react"

interface ParticipantRowProps {
  entry: CalculationBreakdownEntry
  extraGames: Game[]
}

const safeToFixed = (value: number | undefined | null, decimals = 1): string => {
  const num = Number(value)
  if (isNaN(num)) return "0.0"
  return num.toFixed(decimals)
}

const getExtraGameStatusText = (status: ExtraGameStatusDetail | undefined): string => {
  if (!status) return "N/A"
  const textMap: Record<ExtraGameStatusDetail, string> = {
    muy_bien: "Muy Bien",
    regular: "Regular",
    no_hecho: "No Hecho",
  }
  return textMap[status] || "N/A"
}

const getExtraGamePointsText = (points: number | undefined): string => {
  const num = Number(points)
  if (isNaN(num)) return "N/A"
  return num >= 0 ? `+${safeToFixed(num, 1)}` : safeToFixed(num, 1)
}

export function ParticipantRow({ entry, extraGames }: ParticipantRowProps) {
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.tr variants={rowVariants} className="hover:bg-muted/50 transition-colors">
      <TableCell className="text-center font-medium text-muted-foreground">{entry.rank}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={entry.photoUrl || undefined} alt={entry.name} />
            <AvatarFallback>{entry.name?.substring(0, 2).toUpperCase() || "P"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{entry.name}</div>
            <div className="text-xs text-muted-foreground">Año {entry.year}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">{safeToFixed(entry.latest_tiempo_fisico, 2)}</TableCell>
      <TableCell className="text-center font-medium">{safeToFixed(entry.puntos_fisico, 1)}</TableCell>
      <TableCell className="text-center">{safeToFixed(entry.latest_tiempo_mental, 2)}</TableCell>
      <TableCell className="text-center font-medium">{safeToFixed(entry.puntos_mental, 1)}</TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span>{safeToFixed(entry.puntos_extras_cruda, 1)}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <HelpCircle className="size-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold">Desglose de Puntos Extra</h4>
                {extraGames.length > 0 ? (
                  extraGames.map((game) => {
                    const status = entry.latest_extra_game_detailed_statuses?.[game.id]
                    const points = entry.individual_extra_game_points?.[game.id]
                    return (
                      <div key={game.id} className="flex justify-between items-center">
                        <span>
                          {game.name} (
                          <span className="italic text-muted-foreground">{game.extraType || "opcional"}</span>)
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{getExtraGameStatusText(status)}</Badge>
                          <span className="font-mono w-10 text-right">{getExtraGamePointsText(points)}</span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-muted-foreground">No hay juegos extra definidos.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TableCell>
      <TableCell className="text-center font-medium">{safeToFixed(entry.puntos_extras, 1)}</TableCell>
      <TableCell className="text-center text-lg font-bold text-primary">{safeToFixed(entry.puntos_total, 1)}</TableCell>
    </motion.tr>
  )
}

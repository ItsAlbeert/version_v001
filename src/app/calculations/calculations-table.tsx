"use client"
import { motion } from "framer-motion"

import type { CalculationBreakdownEntry, Game } from "../../types"
import { Table, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ScrollArea } from "../../components/ui/scroll-area"
import { ParticipantRow } from "./participant-calculation-row"

interface CalculationsTableProps {
  data: CalculationBreakdownEntry[]
  extraGames: Game[]
}

export function CalculationsTable({ data, extraGames }: CalculationsTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No hay datos de cálculo disponibles.</p>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead className="min-w-[250px]">Participante</TableHead>
            <TableHead className="text-center">T. Físico (min)</TableHead>
            <TableHead className="text-center">P. Físico</TableHead>
            <TableHead className="text-center">T. Mental (min)</TableHead>
            <TableHead className="text-center">P. Mental</TableHead>
            <TableHead className="text-center">P. Extras (Cruda)</TableHead>
            <TableHead className="text-center">P. Extras (Final)</TableHead>
            <TableHead className="text-center font-bold text-lg">P. Total</TableHead>
          </TableRow>
        </TableHeader>
        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
          {data.map((entry) => (
            <ParticipantRow key={entry.id} entry={entry} extraGames={extraGames} />
          ))}
        </motion.tbody>
      </Table>
    </ScrollArea>
  )
}

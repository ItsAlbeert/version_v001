"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dumbbell, Brain, Star, SlidersHorizontal, Loader2 } from "lucide-react"

import type { ScoringSettings } from "../../types"
import { updateScoringSettings, DEFAULT_SCORING_SETTINGS } from "../../lib/firestore-services"
import { useToast } from "../../hooks/use-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Skeleton } from "../../components/ui/skeleton"

const scoringSettingsSchema = z
  .object({
    physical: z.object({
      threshold1: z.coerce.number().min(0),
      threshold2: z.coerce.number().min(0),
      maxPoints: z.coerce.number().min(0),
      minPoints: z.coerce.number().min(0),
    }),
    mental: z.object({
      threshold1: z.coerce.number().min(0),
      threshold2: z.coerce.number().min(0),
      maxPoints: z.coerce.number().min(0),
      minPoints: z.coerce.number().min(0),
    }),
    extras: z.object({
      capMax: z.coerce.number(),
      capMin: z.coerce.number(),
      points: z.object({
        opcional: z.object({ muy_bien: z.coerce.number(), regular: z.coerce.number(), no_hecho: z.coerce.number() }),
        obligatoria: z.object({ muy_bien: z.coerce.number(), regular: z.coerce.number(), no_hecho: z.coerce.number() }),
      }),
    }),
  })
  .refine((data) => data.physical.threshold1 <= data.physical.threshold2, {
    message: "Umbral 1 debe ser ≤ Umbral 2",
    path: ["physical", "threshold2"],
  })
  .refine((data) => data.mental.threshold1 <= data.mental.threshold2, {
    message: "Umbral 1 debe ser ≤ Umbral 2",
    path: ["mental", "threshold2"],
  })
  .refine((data) => data.extras.capMin <= data.extras.capMax, {
    message: "Mínimo debe ser ≤ Máximo",
    path: ["extras", "capMax"],
  })

interface ScoringSettingsFormProps {
  initialSettings?: ScoringSettings
  isLoading: boolean
}

export function ScoringSettingsForm({ initialSettings, isLoading }: ScoringSettingsFormProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<ScoringSettings>({
    resolver: zodResolver(scoringSettingsSchema),
    defaultValues: initialSettings || DEFAULT_SCORING_SETTINGS,
  })

  React.useEffect(() => {
    if (initialSettings) {
      form.reset(initialSettings)
    }
  }, [initialSettings, form])

  const mutation = useMutation({
    mutationFn: updateScoringSettings,
    onSuccess: () => {
      toast({ title: "✅ Configuración Guardada", description: "Las reglas de puntuación han sido actualizadas." })
      queryClient.invalidateQueries({ queryKey: ["scoringSettings"] })
      // Invalidate all queries that depend on these settings
      const dependentQueries = ["leaderboardData", "dashboardData", "trendsData", "comparisonsData", "calculationsData"]
      dependentQueries.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    },
    onError: (error) => {
      toast({ title: "❌ Error al Guardar", description: (error as Error).message, variant: "destructive" })
    },
  })

  const onSubmit = (data: ScoringSettings) => {
    const { id, ...settingsToSave } = data
    mutation.mutate(settingsToSave)
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="size-5" />
          Configuración de Puntuación
        </CardTitle>
        <CardDescription>
          Ajusta las variables para calcular las puntuaciones. Los cambios afectarán a todos los cálculos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Accordion type="multiple" defaultValue={["physical"]} className="w-full">
            <AccordionItem value="physical">
              <AccordionTrigger className="text-lg font-semibold">
                <Dumbbell className="mr-2 size-5" /> Puntuación Física
              </AccordionTrigger>
              <AccordionContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <FormField name="physical.threshold1" label="Tiempo Máx. Pts (min)" form={form} />
                <FormField name="physical.threshold2" label="Tiempo Mín. Pts (min)" form={form} />
                <FormField name="physical.maxPoints" label="Puntos Máximos" form={form} />
                <FormField name="physical.minPoints" label="Puntos Mínimos" form={form} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mental">
              <AccordionTrigger className="text-lg font-semibold">
                <Brain className="mr-2 size-5" /> Puntuación Mental
              </AccordionTrigger>
              <AccordionContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <FormField name="mental.threshold1" label="Tiempo Máx. Pts (min)" form={form} />
                <FormField name="mental.threshold2" label="Tiempo Mín. Pts (min)" form={form} />
                <FormField name="mental.maxPoints" label="Puntos Máximos" form={form} />
                <FormField name="mental.minPoints" label="Puntos Mínimos" form={form} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="extras">
              <AccordionTrigger className="text-lg font-semibold">
                <Star className="mr-2 size-5" /> Puntuación Extras
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField name="extras.capMax" label="Cap. Máximo Pts" form={form} />
                  <FormField name="extras.capMin" label="Cap. Mínimo Pts" form={form} />
                </div>
                <h4 className="font-medium text-sm text-muted-foreground pt-2">Puntos por Estado (Opcional)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField name="extras.points.opcional.muy_bien" label="Muy Bien" form={form} />
                  <FormField name="extras.points.opcional.regular" label="Regular" form={form} />
                  <FormField name="extras.points.opcional.no_hecho" label="No Hecho" form={form} />
                </div>
                <h4 className="font-medium text-sm text-muted-foreground pt-2">Puntos por Estado (Obligatoria)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField name="extras.points.obligatoria.muy_bien" label="Muy Bien" form={form} />
                  <FormField name="extras.points.obligatoria.regular" label="Regular" form={form} />
                  <FormField name="extras.points.obligatoria.no_hecho" label="No Hecho" form={form} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
              {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Helper component for form fields to reduce repetition
function FormField({ name, label, form }: { name: any; label: string; form: any }) {
  const error = name.split(".").reduce((o: any, i: any) => o?.[i], form.formState.errors)
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type="number" step="any" {...form.register(name)} />
      {error && <p className="text-destructive text-xs mt-1">{error.message}</p>}
    </div>
  )
}

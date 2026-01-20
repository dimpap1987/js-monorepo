import { z } from 'zod'

export const scheduleSchema = z.object({
  classId: z.coerce.number().min(1, 'Class is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.coerce.number().min(15, 'Duration is required'),
  recurrence: z.string().default('none'),
  recurrenceDays: z.array(z.string()).default([]),
  recurrenceCount: z.coerce.number().min(1).default(10),
})

export type ScheduleFormData = z.infer<typeof scheduleSchema>

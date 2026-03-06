import { z } from 'zod';

export const EventSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

export const EventArraySchema = z.array(EventSchema);

export type Event = z.infer<typeof EventSchema>;

import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});

export const PermissionArraySchema = z.array(PermissionSchema);

export type Permission = z.infer<typeof PermissionSchema>;

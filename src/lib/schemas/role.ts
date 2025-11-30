import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  permissions: z.array(PermissionSchema),
});

export const RoleArraySchema = z.array(RoleSchema);

export type Role = z.infer<typeof RoleSchema>;

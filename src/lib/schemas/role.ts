import { z } from 'zod';
import { PermissionSchema } from './permission';

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  permissions: z.array(PermissionSchema),
});

export const RoleArraySchema = z.array(RoleSchema);

export type Role = z.infer<typeof RoleSchema>;

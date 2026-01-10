import { z } from 'zod';

export const UserRoleSchema = z.object({
  role_id: z.number(),
  role_name: z.string(),
  role_description: z.string(),
  granted_by: z.number(),
  expires_at: z.string().nullable(),
  granted_at: z.string(),
});

export const UserSchema = z.object({
  user_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
  email: z.string(),
  access_token: z.string().nullable().optional(),
  profile_created_at: z.string(),
  profile_updated_at: z.string(),
  profile_deleted_at: z.string().nullable(),
  is_verified: z.preprocess((val) => {
    // backend sometimes returns 0/1 as numbers (or strings). Normalize to boolean.
    // Treat null/undefined as false, normalize numeric/string 1/'1'/true to boolean true.
    if (val === null || val === undefined) return false;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') return val === '1' || val.toLowerCase() === 'true';
    return val;
  }, z.boolean()),
  unbanned_at: z.string().nullable(),
  roles: z.array(UserRoleSchema),
});

export const UserArraySchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;

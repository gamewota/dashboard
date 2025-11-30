import { z } from 'zod';

export const AuthRoleSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
});

export const AuthUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  roles: z.array(AuthRoleSchema),
});

export const AuthResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
  user: AuthUserSchema,
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export default AuthResponseSchema;

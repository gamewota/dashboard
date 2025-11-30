import { z } from 'zod';

type ThunkAPIReject = { rejectWithValue: (msg: string) => unknown };

export function validateOrReject<T>(schema: z.ZodType<T>, data: unknown, thunkAPI: ThunkAPIReject): T | unknown {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues.map(e => {
      const path = e.path.length ? e.path.join('.') : '<root>';
      return `${path}: ${e.message}`;
    }).join('; ');
    return thunkAPI.rejectWithValue(message || 'Invalid response shape');
  }
  return parsed.data;
}

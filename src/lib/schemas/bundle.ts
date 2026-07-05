import { z } from 'zod';

export const BundleStatusSchema = z.object({
    is_dirty: z.boolean(),
    in_progress: z.boolean(),
    bundle_version: z.number().int().nonnegative(),
    manifest_md5: z.string().nullable(),
    archive_url: z.string().url().nullable(),
    last_built_at: z.string().nullable(),
    last_edit_at: z.string().nullable(),
});

export const BundleTriggerResponseSchema = z.object({
    message: z.string(),
    status: z.string(),
});

export type BundleStatus = z.infer<typeof BundleStatusSchema>;
export type BundleTriggerResponse = z.infer<typeof BundleTriggerResponseSchema>;

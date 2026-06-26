import { z } from 'zod';

export const MailAttachmentSchema = z.object({
    type: z.enum(['card', 'item', 'currency']),
    contentId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export const SendMailPayloadSchema = z.object({
    userIds: z.array(z.number().int().positive()).nullable(),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    attachment: MailAttachmentSchema.nullable().optional(),
    expiresAt: z.string().nullable().optional(),
});

export const SendMailResponseSchema = z.object({ message: z.string() });

export type MailAttachment = z.infer<typeof MailAttachmentSchema>;
export type MailAttachmentType = MailAttachment['type'];
export type RecipientMode = 'broadcast' | 'specific';
export type SendMailPayload = z.infer<typeof SendMailPayloadSchema>;
export type SendMailResponse = z.infer<typeof SendMailResponseSchema>;
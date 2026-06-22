import { z } from 'zod';

export const MailAttachmentSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('card'),
        card_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
    }),
    z.object({
        type: z.literal('item'),
        item_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
    }),
    z.object({
        type: z.literal('currency'),
        currency_id: z.number().int().positive(),
        amount: z.number().int().positive(),
    }),
]);

export const SendMailPayloadSchema = z.object({
    userIds: z.array(z.number().int().positive()).nullable(),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    attachment: MailAttachmentSchema.nullable().optional(),
    expiresAt: z.string().nullable().optional(),
});

export type MailAttachment = z.infer<typeof MailAttachmentSchema>;
export type MailAttachmentType = 'card' | 'item' | 'currency';
export type RecipientMode = 'broadcast' | 'specific';
export type SendMailPayload = z.infer<typeof SendMailPayloadSchema>;
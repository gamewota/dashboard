import { z } from 'zod';

/**
 * Schemas for the dashboard gacha-pack endpoints:
 *   GET   /gacha/prices                    -> list
 *   GET   /gacha/gacha-pack/:id            -> detail (cards + pity rules + listing config)
 *   PATCH /gacha/gacha-pack/:id            -> update config
 *   GET   /gacha/pity-rules/:id            -> pity rules
 *   POST  /gacha/pity-rules/:id            -> create pity rule
 */

/** Rarity IDs the API treats as "SSR or better" when picking a featured card. */
export const FEATURED_CARD_MIN_RARITY_ID = 4;

/** Sentinel used by the featured-card select to mean "let the API pick the rarest". */
export const FEATURED_CARD_AUTO = '';

export const GachaPackAssetSchema = z.object({
  id: z.number(),
  url: z.string(),
  kind: z.enum(['banner', 'video', 'image']),
  typeName: z.string(),
});

export const GachaPackCardSchema = z.object({
  id: z.number(),
  name: z.string(),
  art: z.string().nullish(),
  rarityId: z.number(),
  rarityName: z.string(),
  weight: z.number(),
  effectiveProbability: z.number(),
});

export const GachaPackPityRuleSchema = z.object({
  triggerCount: z.number(),
  guaranteedRarityId: z.number(),
});

export const GachaPackFeaturedCardSchema = z.object({
  id: z.number(),
  name: z.string(),
  art: z.string().nullish(),
  rarity: z.string().nullish(),
});

const PaymentRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

/** `GET /gacha/gacha-pack/:id` and the success body of the PATCH. */
export const GachaPackDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  currency: PaymentRefSchema.nullish(),
  item: PaymentRefSchema.nullish(),
  cards: z.array(GachaPackCardSchema).default([]),
  pityRules: z.array(GachaPackPityRuleSchema).default([]),
  sortOrder: z.number().nullish(),
  isActive: z.boolean().nullish(),
  activeStartAt: z.string().nullish(),
  activeEndAt: z.string().nullish(),
  featuredCard: GachaPackFeaturedCardSchema.nullish(),
  bannerAsset: GachaPackAssetSchema.nullish(),
  trailerAsset: GachaPackAssetSchema.nullish(),
  imageAsset: GachaPackAssetSchema.nullish(),
});

/**
 * `GET /gacha/prices` list row. The list endpoint is looser than the detail
 * endpoint, so unknown/absent listing fields are tolerated and defaulted.
 */
export const GachaPackListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  currency_id: z.number().nullish(),
  currency_name: z.string().nullish(),
  item_id: z.number().nullish(),
  item_name: z.string().nullish(),
  card_count: z.number().nullish(),
  sort_order: z.number().nullish(),
  is_active: z.boolean().nullish(),
  active_start_at: z.string().nullish(),
  active_end_at: z.string().nullish(),
  featured_card_id: z.number().nullish(),
  pity_rules: z.array(GachaPackPityRuleSchema).nullish(),
});

/** Row shape of `GET|POST /gacha/pity-rules/:id` (snake_case, straight from the table). */
export const PityRuleRowSchema = z.object({
  id: z.number(),
  gacha_pack_id: z.number(),
  trigger_count: z.number(),
  guaranteed_rarity_id: z.number(),
});

/** Body for `POST /gacha/pity-rules/:id`. */
export const PityRuleCreateSchema = z.object({
  triggerCount: z.number().int().min(1, 'Trigger count must be at least 1'),
  guaranteedRarityId: z.number().int().min(1, 'Select a guaranteed rarity'),
});

/**
 * Body for `PATCH /gacha/gacha-pack/:id`. Every field is optional but at least
 * one must be present, and currency/item are mutually exclusive.
 */
export const GachaPackUpdateSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty'),
    price: z.number().min(0, 'Price cannot be negative'),
    currencyId: z.number().int().min(1).nullable(),
    itemId: z.number().int().min(1).nullable(),
    sortOrder: z.number(),
    featuredCardId: z.number().int().min(1).nullable(),
    isActive: z.boolean(),
    activeStartAt: z.string().nullable(),
    activeEndAt: z.string().nullable(),
    pityRules: z.array(PityRuleCreateSchema),
    bannerAssetId: z.number().int().min(1).nullable(),
    trailerAssetId: z.number().int().min(1).nullable(),
    imageAssetId: z.number().int().min(1).nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .refine(
    (data) =>
      !(
        typeof data.currencyId === 'number' && typeof data.itemId === 'number'
      ),
    { message: 'Choose either a currency or an item, not both' },
  );

export type GachaPackAsset = z.infer<typeof GachaPackAssetSchema>;
export type GachaPackCard = z.infer<typeof GachaPackCardSchema>;
export type GachaPackPityRule = z.infer<typeof GachaPackPityRuleSchema>;
export type GachaPackFeaturedCard = z.infer<typeof GachaPackFeaturedCardSchema>;
export type GachaPackDetail = z.infer<typeof GachaPackDetailSchema>;
export type GachaPackListItem = z.infer<typeof GachaPackListItemSchema>;
export type PityRuleRow = z.infer<typeof PityRuleRowSchema>;
export type PityRuleCreateInput = z.infer<typeof PityRuleCreateSchema>;
export type GachaPackUpdateInput = z.infer<typeof GachaPackUpdateSchema>;

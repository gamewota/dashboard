import { z } from 'zod';

export const NewsArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  header_image: z.string().nullable().optional(),
  asset_id: z.number().nullable().optional(),
  news_type_id: z.number().nullable().optional(),
  news_type: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const NewsArraySchema = z.array(NewsArticleSchema);
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

import type { GachaPackPityRule } from '../lib/schemas/gachaPack';

/** A pack priced at 0 is free, so it needs neither a currency nor an item. */
export const FREE_PACK_PRICE = 0;

export function isFreePack(price: number | null | undefined): boolean {
  return Number(price ?? 0) <= FREE_PACK_PRICE;
}

/** "Free" for zero-price packs, otherwise "<price> <currency|item>". */
export function formatPackPrice(
  price: number | null | undefined,
  payWith: string | null | undefined,
): string {
  if (isFreePack(price)) return 'Free';
  return payWith ? `${price} ${payWith}` : String(price);
}

/** Condenses a rule set into e.g. "10 pulls -> R4, 50 pulls -> R5". */
export function formatPityRuleSummary(
  rules: GachaPackPityRule[] | null | undefined,
  rarityNameById?: Map<number, string>,
): string {
  if (!rules || rules.length === 0) return 'No pity rules';
  return rules
    .map((rule) => {
      const rarity =
        rarityNameById?.get(rule.guaranteedRarityId) ?? `Rarity ${rule.guaranteedRarityId}`;
      return `${rule.triggerCount} pulls → ${rarity}`;
    })
    .join(', ');
}

/** Formats an ISO listing window as a readable range. */
export function formatActiveWindow(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
): string {
  if (!startAt && !endAt) return 'Always';
  const fmt = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleString() : '—';
  return `${fmt(startAt)} → ${fmt(endAt)}`;
}

/** `datetime-local` inputs need "YYYY-MM-DDTHH:mm" in local time, not an ISO-Z string. */
export function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Converts a `datetime-local` value back to an ISO string, or null when cleared. */
export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

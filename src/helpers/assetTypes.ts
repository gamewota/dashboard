// Asset type ids, mirrored from the backend. Used when requesting a presigned
// upload URL (uploadAssetWithPresigned) so each asset lands in the right
// storage folder. Keep in sync with the backend's ASSET_TYPE map.
export const ASSET_TYPE = {
  ARTWORK: 1,
  SONG: 2,
  MV: 3,
  BEATMAP: 4,
  CARD_ARTWORK: 5,
  BANNER_ARTWORK: 6,
  BANNER_VIDEO: 7,
  ITEM_ARTWORK: 8,
} as const;

export type AssetTypeId = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE];

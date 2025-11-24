import axios from 'axios';
import { API_BASE_URL } from './constants';
import { getAuthHeader } from './getAuthHeader';

export type PresignedResp = {
  presignedUrl: string;
  asset: {
    id: number;
    asset_type_id: number;
    assets_url: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
};

/**
 * Upload a file using the server-provided presigned URL flow.
 * - POST to /assets/generate-url with { filename }
 * - PUT the file to the returned presignedUrl
 * - return the created asset object from the server response
 *
 * Assumptions: server accepts { filename } in the generate-url body and
 * returns { presignedUrl, asset } as described in the repo conversation.
 */
export async function uploadAssetWithPresigned(
  file: Blob | File,
  filename?: string,
  contentType?: string,
  asset_type_id: number = -1
) {
  const inferredName = file instanceof File ? file.name : `upload-${Date.now()}`;
  const name = filename || inferredName;
  const inferredContentType = contentType || (file instanceof File ? file.type : 'application/octet-stream');
  // Validate accepted content types for presigned uploads
  const baseType = inferredContentType.split('/')[0];
  const allowedBase = ['image', 'audio', 'video'];
  const isJson = inferredContentType === 'application/json' || inferredContentType === 'text/json';
  if (!allowedBase.includes(baseType) && !isJson) {
    throw new Error('Unsupported content type for presigned upload');
  }

  // Request presigned URL from server with expected body shape
  const resp = await axios.post<PresignedResp>(
    `${API_BASE_URL}/assets/generate-url`,
    { filename: name, contentType: inferredContentType, asset_type_id },
    { headers: getAuthHeader() }
  );

  const { presignedUrl, asset } = resp.data;

  // Upload the file to the presigned URL (PUT) with the proper content type
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': inferredContentType,
    },
  });

  return asset;
}

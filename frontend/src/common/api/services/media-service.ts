import type { HomeAssistant } from 'custom-card-helpers';
import type { MediaBrowseResponse, MediaDeleteResponse, MediaUploadResponse, ResolveMediaResponse } from '@/common/media';
import { getCardBuilderRelativePath, isCardBuilderMediaReference } from '@/common/media';

const WS_MEDIA_LIST = 'card_builder/media/list';
const WS_MEDIA_UPLOAD = 'card_builder/media/upload';
const WS_MEDIA_DELETE = 'card_builder/media/delete';

async function fileToBase64(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            const commaIndex = result.indexOf(',');
            resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
        };
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export class MediaService {
    constructor(private hass: HomeAssistant) {}

    async browse(mediaContentId: string): Promise<MediaBrowseResponse> {
        if (!isCardBuilderMediaReference(mediaContentId)) {
            throw new Error('Unsupported media source.');
        }
        const relativePath = getCardBuilderRelativePath(mediaContentId);
        return await this.hass.callWS<MediaBrowseResponse>({
            type: WS_MEDIA_LIST,
            path: relativePath,
        });
    }

    async resolve(mediaContentId: string): Promise<ResolveMediaResponse> {
        return await this.hass.callWS<ResolveMediaResponse>({
            type: 'media_source/resolve_media',
            media_content_id: mediaContentId,
        });
    }

    async uploadFile(file: File, targetFolderId: string, fileNameOverride?: string): Promise<MediaUploadResponse> {
        if (!isCardBuilderMediaReference(targetFolderId)) {
            throw new Error('Upload supported only for Card Builder media.');
        }

        const relativePath = getCardBuilderRelativePath(targetFolderId);
        const name = fileNameOverride || file.name;
        const payload = await fileToBase64(file);

        return await this.hass.callWS<MediaUploadResponse>({
            type: WS_MEDIA_UPLOAD,
            path: relativePath,
            filename: name,
            content: payload,
        });
    }

    async deleteFile(mediaReference: string): Promise<MediaDeleteResponse> {
        if (!isCardBuilderMediaReference(mediaReference)) {
            throw new Error('Delete supported only for Card Builder media.');
        }
        const relativePath = getCardBuilderRelativePath(mediaReference);
        return await this.hass.callWS<MediaDeleteResponse>({
            type: WS_MEDIA_DELETE,
            path: relativePath,
        });
    }
}

export interface MediaItem {
    title: string;
    media_content_id: string;
    media_content_type: string;
    media_class?: string;
    can_expand?: boolean;
    can_play?: boolean;
    thumbnail?: string;
    children?: MediaItem[];
}

export interface MediaBrowseResponse extends MediaItem {
    children: MediaItem[];
}

export interface ResolveMediaResponse {
    url: string;
    mime_type?: string;
}

export interface MediaUploadResponse {
    reference: string;
    path: string;
    url?: string;
}

export interface MediaDeleteResponse {
    path: string;
    success: boolean;
}

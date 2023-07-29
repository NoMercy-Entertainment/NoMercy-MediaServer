

export type Message = {
    body?: string
    created_at: number
    from?: string
    id?: number
    image?: string
    notify?: boolean
    read?: boolean
    title?: string
    to?: string
    type?: string
    updated_at?: number
    method?: string
}

export interface AllowedUser {
    owner: boolean;
    manage: boolean;
    allowed: boolean;
    audioTranscoding: boolean;
    videoTranscoding: boolean;
    noTranscoding: boolean;
    id: string;
    email: string;
    name: string;
}

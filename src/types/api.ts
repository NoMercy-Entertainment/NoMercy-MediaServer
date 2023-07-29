
export interface ServerPingResponse {
    message: 'ok' | 'error';
    server: {
        external_ip: string,
        id: number,
        server_id: string,
        user_id: string,
        server_name: string,
        online: boolean,
        is_primary: number,
        internal_ip: string,
        internal_port: number,
        external_port: number,
        unsecure_internal_port: null,
        unsecure_external_port: null,
        created_at: string,
        updated_at: string
    };
}

export interface ModeratorsResponse {
    success: true;
    data: {
        id: string;
        name: string;
    }[];
}

export interface ServerRegisterResponse {
    success: boolean;
    server_id: string;
    url: string;
}

export interface LinkServer {
    access_token: string;
    refresh_token: string;
    token: Server;
}

export interface Server {
    is_owner: boolean;
    owner: string;
    internal_port: string;
    external_port: string;
    internal_donain: string;
    external_donain: string;
}

export interface ServerCertificate {
    success: boolean
    certificate: string
    private_key: string
    issuer_certificate: string
    certificate_authority: string
}

export interface Moderator {
    id: string
    name: string
}

export interface UserResponse {
    user_id: string;
    name: string;
    email: string;
    cache_id: string;
    avatar: string;
    enabled: boolean;
    custom_avatar: boolean;
}

export interface User extends Permission {
    avatar: string;
    owner: boolean;
    custom_avatar: boolean;
    email: string;
    name: string;
    sub_id: string;
    time?: number;
    enabled?: boolean;
}

export interface Permission {
    sub_id: string;
    allowed: boolean;
    libraries: string[];
    manage: boolean,
    audioTranscoding: boolean,
    videoTranscoding: boolean,
    noTranscoding: boolean,
    allowedAllLibraries: boolean,
}

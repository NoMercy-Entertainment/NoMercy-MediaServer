export interface WatchProviders {
	results: WatchProvider[];
}
export interface WatchProvider {
    display_priorities: Priorities;
    display_priority: number;
    logo_path: string;
    provider_name: string;
    provider_id: number;
}
export interface Priorities {
	AR: number;
	AT: number;
	AU: number;
	BE: number;
	BO: number;
	BR: number;
	CA: number;
	CH: number;
	CL: number;
	CO: number;
	CR: number;
	DE: number;
	DK: number;
	EC: number;
	ES: number;
	FI: number;
	FR: number;
	GB: number;
	GT: number;
	HK: number;
	HN: number;
	ID: number;
	IE: number;
	IN: number;
	IS: number;
	IT: number;
	JP: number;
	KR: number;
	MX: number;
	MY: number;
	NL: number;
	NO: number;
	NZ: number;
	PE: number;
	PT: number;
	PY: number;
	RU: number;
	SE: number;
	SG: number;
	TH: number;
	TW: number;
	US: number;
	VE: number;
}


export interface WatchProviderResult {
	AR: WatchProviderRegion;
	AT: WatchProviderRegion;
	AU: WatchProviderRegion;
	BE: WatchProviderRegion;
	BO: WatchProviderRegion;
	BR: WatchProviderRegion;
	CA: WatchProviderRegion;
	CH: WatchProviderRegion;
	CL: WatchProviderRegion;
	CO: WatchProviderRegion;
	CR: WatchProviderRegion;
	DE: WatchProviderRegion;
	DK: WatchProviderRegion;
	EC: WatchProviderRegion;
	ES: WatchProviderRegion;
	FI: WatchProviderRegion;
	FR: WatchProviderRegion;
	GB: WatchProviderRegion;
	GT: WatchProviderRegion;
	HK: WatchProviderRegion;
	HN: WatchProviderRegion;
	ID: WatchProviderRegion;
	IE: WatchProviderRegion;
	IN: WatchProviderRegion;
	IS: WatchProviderRegion;
	IT: WatchProviderRegion;
	JP: WatchProviderRegion;
	KR: WatchProviderRegion;
	MX: WatchProviderRegion;
	MY: WatchProviderRegion;
	NL: WatchProviderRegion;
	NO: WatchProviderRegion;
	NZ: WatchProviderRegion;
	PE: WatchProviderRegion;
	PT: WatchProviderRegion;
	PY: WatchProviderRegion;
	RU: WatchProviderRegion;
	SE: WatchProviderRegion;
	SG: WatchProviderRegion;
	TH: WatchProviderRegion;
	TW: WatchProviderRegion;
	US: WatchProviderRegion;
	VE: WatchProviderRegion;
}
export interface WatchProviderRegion {
	link: string;
	free?: WatchProviderResultItem[];
	ads?: WatchProviderResultItem[];
	buy?: WatchProviderResultItem[];
	flatrate?: WatchProviderResultItem[];
	rent?: WatchProviderResultItem[];
}
export interface WatchProviderResultItem {
    display_priority: number;
    logo_path: string;
    provider_name: string;
    provider_id: number;
}

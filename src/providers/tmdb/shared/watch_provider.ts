export interface Provider {
	display_priority: number;
	logo_path: string;
	provider_id: number;
	provider_name: string;
}

export interface WatchRegionAppend {
	link: string;
	free?: Provider[];
	ads?: Provider[];
	buy?: Provider[];
	flatrate?: Provider[];
	rent?: Provider[];
}

export interface WatchProvider {
	AR: WatchRegionAppend;
	AT: WatchRegionAppend;
	AU: WatchRegionAppend;
	BE: WatchRegionAppend;
	BO: WatchRegionAppend;
	BR: WatchRegionAppend;
	CA: WatchRegionAppend;
	CH: WatchRegionAppend;
	CL: WatchRegionAppend;
	CO: WatchRegionAppend;
	CR: WatchRegionAppend;
	DE: WatchRegionAppend;
	DK: WatchRegionAppend;
	EC: WatchRegionAppend;
	ES: WatchRegionAppend;
	FI: WatchRegionAppend;
	FR: WatchRegionAppend;
	GB: WatchRegionAppend;
	GT: WatchRegionAppend;
	HK: WatchRegionAppend;
	HN: WatchRegionAppend;
	ID: WatchRegionAppend;
	IE: WatchRegionAppend;
	IN: WatchRegionAppend;
	IS: WatchRegionAppend;
	IT: WatchRegionAppend;
	JP: WatchRegionAppend;
	KR: WatchRegionAppend;
	MX: WatchRegionAppend;
	MY: WatchRegionAppend;
	NL: WatchRegionAppend;
	NO: WatchRegionAppend;
	NZ: WatchRegionAppend;
	PE: WatchRegionAppend;
	PT: WatchRegionAppend;
	PY: WatchRegionAppend;
	RU: WatchRegionAppend;
	SE: WatchRegionAppend;
	SG: WatchRegionAppend;
	TH: WatchRegionAppend;
	TW: WatchRegionAppend;
	US: WatchRegionAppend;
	VE: WatchRegionAppend;
}

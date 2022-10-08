export type ContentRatingEntries = [string, ContentRating[]][];

export interface TvContentRatings {
	results: ContentRating[];
}

export interface ContentRating {
	rating: string;
	meaning: string;
	order: string;
	iso_3166_1: string;
}

export interface ContentRatingList {
	AR: ContentRating[];
	AT: ContentRating[];
	AU: ContentRating[];
	BE: ContentRating[];
	BO: ContentRating[];
	BR: ContentRating[];
	CA: ContentRating[];
	CH: ContentRating[];
	CL: ContentRating[];
	CO: ContentRating[];
	CR: ContentRating[];
	DE: ContentRating[];
	DK: ContentRating[];
	EC: ContentRating[];
	ES: ContentRating[];
	FI: ContentRating[];
	FR: ContentRating[];
	GB: ContentRating[];
	GT: ContentRating[];
	HK: ContentRating[];
	HN: ContentRating[];
	ID: ContentRating[];
	IE: ContentRating[];
	IN: ContentRating[];
	IS: ContentRating[];
	IT: ContentRating[];
	JP: ContentRating[];
	KR: ContentRating[];
	MX: ContentRating[];
	MY: ContentRating[];
	NL: ContentRating[];
	NO: ContentRating[];
	NZ: ContentRating[];
	PE: ContentRating[];
	PT: ContentRating[];
	PY: ContentRating[];
	RU: ContentRating[];
	SE: ContentRating[];
	SG: ContentRating[];
	TH: ContentRating[];
	TW: ContentRating[];
	US: ContentRating[];
	VE: ContentRating[];
}

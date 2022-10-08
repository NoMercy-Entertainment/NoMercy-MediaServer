export interface Certifications {
	certifications: CertificationList;
}

export type CertificationEntries = [string, Certification[]][];

export interface Certification {
	certification: string;
	meaning: string;
	order: string;
	iso_3166_1: string;
}

export interface CertificationList {
	AR: Certification[];
	AT: Certification[];
	AU: Certification[];
	BE: Certification[];
	BO: Certification[];
	BR: Certification[];
	CA: Certification[];
	CH: Certification[];
	CL: Certification[];
	CO: Certification[];
	CR: Certification[];
	DE: Certification[];
	DK: Certification[];
	EC: Certification[];
	ES: Certification[];
	FI: Certification[];
	FR: Certification[];
	GB: Certification[];
	GT: Certification[];
	HK: Certification[];
	HN: Certification[];
	ID: Certification[];
	IE: Certification[];
	IN: Certification[];
	IS: Certification[];
	IT: Certification[];
	JP: Certification[];
	KR: Certification[];
	MX: Certification[];
	MY: Certification[];
	NL: Certification[];
	NO: Certification[];
	NZ: Certification[];
	PE: Certification[];
	PT: Certification[];
	PY: Certification[];
	RU: Certification[];
	SE: Certification[];
	SG: Certification[];
	TH: Certification[];
	TW: Certification[];
	US: Certification[];
	VE: Certification[];
}

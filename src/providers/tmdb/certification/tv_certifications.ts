export interface TvCertifications {
	certifications: TvCertification;
}

export interface TvCertification {
	AR: TvCert[];
	AT: TvCert[];
	AU: TvCert[];
	BE: TvCert[];
	BO: TvCert[];
	BR: TvCert[];
	CA: TvCert[];
	CH: TvCert[];
	CL: TvCert[];
	CO: TvCert[];
	CR: TvCert[];
	DE: TvCert[];
	DK: TvCert[];
	EC: TvCert[];
	ES: TvCert[];
	FI: TvCert[];
	FR: TvCert[];
	GB: TvCert[];
	GT: TvCert[];
	HK: TvCert[];
	HN: TvCert[];
	ID: TvCert[];
	IE: TvCert[];
	IN: TvCert[];
	IS: TvCert[];
	IT: TvCert[];
	JP: TvCert[];
	KR: TvCert[];
	MX: TvCert[];
	MY: TvCert[];
	NL: TvCert[];
	NO: TvCert[];
	NZ: TvCert[];
	PE: TvCert[];
	PT: TvCert[];
	PY: TvCert[];
	RU: TvCert[];
	SE: TvCert[];
	SG: TvCert[];
	TH: TvCert[];
	TW: TvCert[];
	US: TvCert[];
	VE: TvCert[];
}

export interface TvCert {
	certification: string;
	meaning: string;
	order: number;
}

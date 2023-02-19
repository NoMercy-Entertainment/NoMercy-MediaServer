
export interface MovieCertifications {
	certifications: MovieCertification;
}

export interface MovieCertification {
	AR: MovieCert[];
	AT: MovieCert[];
	AU: MovieCert[];
	BE: MovieCert[];
	BO: MovieCert[];
	BR: MovieCert[];
	CA: MovieCert[];
	CH: MovieCert[];
	CL: MovieCert[];
	CO: MovieCert[];
	CR: MovieCert[];
	DE: MovieCert[];
	DK: MovieCert[];
	EC: MovieCert[];
	ES: MovieCert[];
	FI: MovieCert[];
	FR: MovieCert[];
	GB: MovieCert[];
	GT: MovieCert[];
	HK: MovieCert[];
	HN: MovieCert[];
	ID: MovieCert[];
	IE: MovieCert[];
	IN: MovieCert[];
	IS: MovieCert[];
	IT: MovieCert[];
	JP: MovieCert[];
	KR: MovieCert[];
	MX: MovieCert[];
	MY: MovieCert[];
	NL: MovieCert[];
	NO: MovieCert[];
	NZ: MovieCert[];
	PE: MovieCert[];
	PT: MovieCert[];
	PY: MovieCert[];
	RU: MovieCert[];
	SE: MovieCert[];
	SG: MovieCert[];
	TH: MovieCert[];
	TW: MovieCert[];
	US: MovieCert[];
	VE: MovieCert[];
}

export interface MovieCert {
	certification: string;
	meaning: string;
	order: number;
}

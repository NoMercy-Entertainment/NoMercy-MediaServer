import { parseTitleAndYear } from './title';
import { removeEmpty } from './utils';

const internalExp = /\b(INTERNAL)\b/iu;
const remasteredExp = /\b(Remastered|Anniversary|Restored)\b/iu;
const imaxExp = /\b(IMAX)\b/iu;
const unratedExp = /\b(Uncensored|Unrated)\b/iu;
const extendedExp = /\b(Extended|Uncut|Ultimate|Rogue|Collector)\b/iu;
const theatricalExp = /\b(Theatrical)\b/iu;
const directorsExp = /\b(Directors?)\b/iu;
const fanExp = /\b(Despecialized|Fan.?Edit)\b/iu;
const limitedExp = /\b(LIMITED)\b/iu;
const hdrExp = /\b(HDR)\b/iu;
const threeD = /\b(3D)\b/iu;
const hsbs = /\b(Half-?SBS|HSBS)\b/iu;
const sbs = /\b((?<!H|HALF-)SBS)\b/iu;
const hou = /\b(HOU)\b/iu;
const uhd = /\b(UHD)\b/iu;
const dolbyVision = /\b(DV(\b(HDR10|HLG|SDR))?)\b/iu;

export interface Edition {
  internal?: boolean;
  limited?: boolean;
  remastered?: boolean;
  extended?: boolean;
  theatrical?: boolean;

  /** Directors cut */
  directors?: boolean;
  unrated?: boolean;
  imax?: boolean;
  fanEdit?: boolean;
  hdr?: boolean;

  /** 3D film */
  threeD?: boolean;

  /** half side by side 3D */
  hsbs?: boolean;

  /** side by side 3D */
  sbs?: boolean;

  /** half over under 3D */
  hou?: boolean;

  /** most 2160p should be UHD but there might be some that aren't? */
  uhd?: boolean;
  dolbyVision?: boolean;
}

export function parseEdition(title: string): Edition {
	const parsedTitle = parseTitleAndYear(title).title;
	const withoutTitle = title.replace('.', ' ').replace(parsedTitle, '')
		.toLowerCase();

	const result: Edition = {
		internal: internalExp.test(withoutTitle) || undefined,
		limited: limitedExp.test(withoutTitle) || undefined,
		remastered: remasteredExp.test(withoutTitle) || undefined,
		extended: extendedExp.test(withoutTitle) || undefined,
		theatrical: theatricalExp.test(withoutTitle) || undefined,
		directors: directorsExp.test(withoutTitle) || undefined,
		unrated: unratedExp.test(withoutTitle) || undefined,
		imax: imaxExp.test(withoutTitle) || undefined,
		fanEdit: fanExp.test(withoutTitle) || undefined,
		hdr: hdrExp.test(withoutTitle) || undefined,
		threeD: threeD.test(withoutTitle) || undefined,
		hsbs: hsbs.test(withoutTitle) || undefined,
		sbs: sbs.test(withoutTitle) || undefined,
		hou: hou.test(withoutTitle) || undefined,
		uhd: uhd.test(withoutTitle) || undefined,
		dolbyVision: dolbyVision.test(withoutTitle) || undefined,
	};

	return removeEmpty(result);
}

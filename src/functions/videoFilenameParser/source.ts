/* eslint-disable max-len */
const blurayExp
  = /\b(?<bluray>M?Blu-?Ray|HDDVD|BD|UHDBD|BDISO|BDMux|BD25|BD50|BR.?DISK|Bluray(1080|720)p?|BD(1080|720)p?)\b/iu;
export const webdlExp
  = /\b(?<webdl>WEB[-_. ]DL|HDRIP|WEBDL|WEB-DLMux|NF|APTV|NETFLIX|NetflixU?HD|DSNY|DSNP|HMAX|AMZN|AmazonHD|iTunesHD|MaxdomeHD|WebHD|WEB$|[. ]WEB[. ](?:[xh]26[45]|DD5[. ]1)|\d+0p[. ]WEB[. ]|\b\s\/\sWEB\s\/\s\b|AMZN[. ]WEB[. ])\b/iu;
const webripExp = /\b(?<webrip>WebRip|Web-Rip|WEBCap|WEBMux)\b/iu;
const hdtvExp = /\b(?<hdtv>HDTV)\b/iu;
const bdripExp = /\b(?<bdrip>BDRip)\b/iu;
const brripExp = /\b(?<brrip>BRRip)\b/iu;
const dvdrExp = /\b(?<dvdr>DVD-R|DVDR)\b/iu;
const dvdExp = /\b(?<dvd>DVD9?|DVDRip|NTSC|PAL|xvidvd|DvDivX)\b/iu;
const dsrExp = /\b(?<dsr>WS[-_. ]DSR|DSR)\b/iu;
const regionalExp = /\b(?<regional>R[0-9]{1}|REGIONAL)\b/iu;
const ppvExp = /\b(?<ppv>PPV)\b/iu;
const scrExp = /\b(?<scr>SCR|SCREENER|DVDSCR|(DVD|WEB).?SCREENER)\b/iu;
const tsExp = /\b(?<ts>TS|TELESYNC|HD-TS|HDTS|PDVD|TSRip|HDTSRip)\b/iu;
const tcExp = /\b(?<tc>TC|TELECINE|HD-TC|HDTC)\b/iu;
const camExp = /\b(?<cam>CAMRIP|CAM|HDCAM|HD-CAM)\b/iu;
const workprintExp = /\b(?<workprint>WORKPRINT|WP)\b/iu;
const pdtvExp = /\b(?<pdtv>PDTV)\b/iu;
const sdtvExp = /\b(?<sdtv>SDTV)\b/iu;
const tvripExp = /\b(?<tvrip>TVRip)\b/iu;

export enum Source {
  BLURAY = 'BLURAY',
  WEBDL = 'WEBDL',
  WEBRIP = 'WEBRIP',
  DVD = 'DVD',
  CAM = 'CAM',
  SCREENER = 'SCREENER',
  PPV = 'PPV',
  TELESYNC = 'TELESYNC',
  TELECINE = 'TELECINE',
  WORKPRINT = 'WORKPRINT',
  TV = 'TV',
}

interface SourceGroups {
  bluray: boolean;
  webdl: boolean;
  webrip: boolean;
  hdtv: boolean;
  bdrip: boolean;
  brrip: boolean;
  scr: boolean;
  dvdr: boolean;
  dvd: boolean;
  dsr: boolean;
  regional: boolean;
  ppv: boolean;
  ts: boolean;
  tc: boolean;
  cam: boolean;
  workprint: boolean;
  pdtv: boolean;
  sdtv: boolean;
  tvrip: boolean;
}

export function parseSourceGroups(title: string): SourceGroups {
	const normalizedName = title.replace(/_/gu, ' ').replace(/\[/gu, ' ')
		.replace(/\]/gu, ' ')
		.trim();

	return {
		bluray: blurayExp.test(normalizedName),
		webdl: webdlExp.test(normalizedName),
		webrip: webripExp.test(normalizedName),
		hdtv: hdtvExp.test(normalizedName),
		bdrip: bdripExp.test(normalizedName),
		brrip: brripExp.test(normalizedName),
		scr: scrExp.test(normalizedName),
		dvdr: dvdrExp.test(normalizedName),
		dvd: dvdExp.test(normalizedName),
		dsr: dsrExp.test(normalizedName),
		regional: regionalExp.test(normalizedName),
		ppv: ppvExp.test(normalizedName),
		ts: tsExp.test(normalizedName),
		tc: tcExp.test(normalizedName),
		cam: camExp.test(normalizedName),
		workprint: workprintExp.test(normalizedName),
		pdtv: pdtvExp.test(normalizedName),
		sdtv: sdtvExp.test(normalizedName),
		tvrip: tvripExp.test(normalizedName),
	};
}

// eslint-disable-next-line complexity
export function parseSource(title: string): Source[] {
	const groups = parseSourceGroups(title);
	const result: Source[] = [];

	if (!groups) {
		return result;
	}

	if (groups.bluray || groups.bdrip || groups.brrip) {
		result.push(Source.BLURAY);
	}

	if (groups.webrip) {
		result.push(Source.WEBRIP);
	}

	if (!groups.webrip && groups.webdl) {
		result.push(Source.WEBDL);
	}

	if (groups.dvdr || (groups.dvd && !groups.scr)) {
		result.push(Source.DVD);
	}

	if (groups.ppv) {
		result.push(Source.PPV);
	}

	if (groups.workprint) {
		result.push(Source.WORKPRINT);
	}

	if (groups.pdtv || groups.sdtv || groups.dsr || groups.tvrip || groups.hdtv) {
		result.push(Source.TV);
	}

	if (groups.cam) {
		result.push(Source.CAM);
	}

	if (groups.ts) {
		result.push(Source.TELESYNC);
	}

	if (groups.tc) {
		result.push(Source.TELECINE);
	}

	if (groups.scr) {
		result.push(Source.SCREENER);
	}

	return result;
}

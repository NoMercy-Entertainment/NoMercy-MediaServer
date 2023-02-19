import { parseTitleAndYear } from './title';

/* eslint-disable complexity */
export enum Language {
  English = 'English',
  French = 'French',
  Spanish = 'Spanish',
  German = 'German',
  Italian = 'Italian',
  Danish = 'Danish',
  Dutch = 'Dutch',
  Japanese = 'Japanese',
  Cantonese = 'Cantonese',
  Mandarin = 'Mandarin',
  Russian = 'Russian',
  Polish = 'Polish',
  Vietnamese = 'Vietnamese',
  Nordic = 'Nordic',
  Swedish = 'Swedish',
  Norwegian = 'Norwegian',
  Finnish = 'Finnish',
  Turkish = 'Turkish',
  Portuguese = 'Portuguese',
  Flemish = 'Flemish',
  Greek = 'Greek',
  Korean = 'Korean',
  Hungarian = 'Hungarian',
  Hebrew = 'Hebrew',
  Czech = 'Czech',
  Ukrainian = 'Ukrainian',
  Catalan = 'Catalan',
  Chinese = 'Chinese',
  Thai = 'Thai',
  Hindi = 'Hindi',
  Tamil = 'Tamil',
  Arabic = 'Arabic',
  Estonian = 'Estonian',
  Icelandic = 'Icelandic',
  Latvian = 'Latvian',
  Lithuanian = 'Lithuanian',
  Romanian = 'Romanian',
  Slovak = 'Slovak',
  Serbian = 'Serbian',
}

export function parseLanguage(title: string): Language[] {
	const parsedTitle = parseTitleAndYear(title).title;
	const languageTitle = title.replace(/\./gu, ' ').replace(parsedTitle, '')
		.toLowerCase();
	const languages: Language[] = [];

	if (/\b(english|eng|EN|FI)\b/iu.test(languageTitle)) {
		languages.push(Language.English);
	}

	if (languageTitle.includes('spanish')) {
		languages.push(Language.Spanish);
	}

	if (/\b(DK|DAN|danish)\b/iu.test(languageTitle)) {
		languages.push(Language.Danish);
	}

	if (languageTitle.includes('japanese')) {
		languages.push(Language.Japanese);
	}

	if (languageTitle.includes('cantonese')) {
		languages.push(Language.Cantonese);
	}

	if (languageTitle.includes('mandarin')) {
		languages.push(Language.Mandarin);
	}

	if (languageTitle.includes('korean')) {
		languages.push(Language.Korean);
	}

	if (languageTitle.includes('vietnamese')) {
		languages.push(Language.Vietnamese);
	}

	if (/\b(SE|SWE|swedish)\b/iu.test(languageTitle)) {
		languages.push(Language.Swedish);
	}

	if (languageTitle.includes('finnish')) {
		languages.push(Language.Finnish);
	}

	if (languageTitle.includes('turkish')) {
		languages.push(Language.Turkish);
	}

	if (languageTitle.includes('portuguese')) {
		languages.push(Language.Portuguese);
	}

	if (languageTitle.includes('hebrew')) {
		languages.push(Language.Hebrew);
	}

	if (languageTitle.includes('czech')) {
		languages.push(Language.Czech);
	}

	if (languageTitle.includes('ukrainian')) {
		languages.push(Language.Ukrainian);
	}

	if (languageTitle.includes('catalan')) {
		languages.push(Language.Catalan);
	}

	if (languageTitle.includes('estonian')) {
		languages.push(Language.Estonian);
	}

	if (/\b(ice|Icelandic)\b/iu.test(languageTitle)) {
		languages.push(Language.Icelandic);
	}

	if (/\b(chi|chinese)\b/iu.test(languageTitle)) {
		languages.push(Language.Chinese);
	}

	if (languageTitle.includes('thai')) {
		languages.push(Language.Thai);
	}

	if (/\b(ita|italian)\b/iu.test(languageTitle)) {
		languages.push(Language.Italian);
	}

	if (/\b(german|videomann)\b/iu.test(languageTitle)) {
		languages.push(Language.German);
	}

	if (/\b(flemish)\b/iu.test(languageTitle)) {
		languages.push(Language.Flemish);
	}

	if (/\b(greek)\b/iu.test(languageTitle)) {
		languages.push(Language.Greek);
	}

	if (/\b(FR|FRENCH|VOSTFR|VO|VFF|VFQ|VF2|TRUEFRENCH|SUBFRENCH)\b/iu.test(languageTitle)) {
		languages.push(Language.French);
	}

	if (/\b(russian|rus)\b/iu.test(languageTitle)) {
		languages.push(Language.Russian);
	}

	if (/\b(norwegian|NO)\b/iu.test(languageTitle)) {
		languages.push(Language.Norwegian);
	}

	if (/\b(HUNDUB|HUN|hungarian)\b/iu.test(languageTitle)) {
		languages.push(Language.Hungarian);
	}

	if (/\b(HebDub)\b/iu.test(languageTitle)) {
		languages.push(Language.Hebrew);
	}

	if (/\b(CZ|SK)\b/iu.test(languageTitle)) {
		languages.push(Language.Czech);
	}

	if (/(?<ukrainian>\bukr\b)/iu.test(languageTitle)) {
		languages.push(Language.Ukrainian);
	}

	if (/\b(PL|PLDUB|POLISH)\b/iu.test(languageTitle)) {
		languages.push(Language.Polish);
	}

	if (/\b(nl|dutch)\b/iu.test(languageTitle)) {
		languages.push(Language.Dutch);
	}

	if (/\b(HIN|Hindi)\b/iu.test(languageTitle)) {
		languages.push(Language.Hindi);
	}

	if (/\b(TAM|Tamil)\b/iu.test(languageTitle)) {
		languages.push(Language.Tamil);
	}

	if (/\b(Arabic)\b/iu.test(languageTitle)) {
		languages.push(Language.Arabic);
	}

	if (/\b(Latvian)\b/iu.test(languageTitle)) {
		languages.push(Language.Latvian);
	}

	if (/\b(Lithuanian)\b/iu.test(languageTitle)) {
		languages.push(Language.Lithuanian);
	}

	if (/\b(RO|Romanian)\b/iu.test(languageTitle)) {
		languages.push(Language.Romanian);
	}

	if (/\b(SK|Slovak)\b/iu.test(languageTitle)) {
		languages.push(Language.Slovak);
	}

	if (/\b(Serbian)\b/iu.test(languageTitle)) {
		languages.push(Language.Serbian);
	}

	if (/\b(nordic|NORDICSUBS)\b/iu.test(languageTitle)) {
		languages.push(Language.Nordic);
	}

	if (isMulti(languageTitle)) {
		languages.push(Language.English);
	}

	if (languages.length === 0) {
		languages.push(Language.English);
	}

	return [...new Set(languages)];
}

// Reviens-moi (2007) [1080p] BluRay MULTi x264-PopHD
const multiExp = /(?<!(WEB-))\b(MULTi|DUAL|DL)\b/iu;
export function isMulti(title: string): boolean | undefined {
	const noWebTitle = title.replace(/\bWEB-?DL\b/iu, '');
	return multiExp.test(noWebTitle) || undefined;
}

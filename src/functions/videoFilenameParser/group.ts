import { removeFileExtension } from './extensions';
import { simplifyTitle } from './simplifyTitle';
import { parseTitleAndYear } from './title';

const websitePrefixExp = /^\[\s*[a-z]+(\.[a-z]+)+\s*\][- ]*|^www\.[a-z]+\.(?:com|net)[ -]*/iu;
const cleanReleaseGroupExp
  // eslint-disable-next-line max-len
  = /^(.*?[-._ ](S\d+E\d+)[-._ ])|(-(RP|1|NZBGeek|Obfuscated|sample|Pre|postbot|xpost|Rakuv[a-z0-9]*|WhiteRev|BUYMORE|AsRequested|AlternativeToRequested|GEROV|Z0iDS3N|Chamele0n|4P|4Planet|AlteZachen))+$/iu;
const releaseGroupRegexExp
  = /-(?<releasegroup>[a-z0-9]+)(?<!WEB-DL|480p|720p|1080p|2160p|DTS-HD|DTS-X|([a-zA-Z]{3}-ENG))(?:\b|[-._ ])/iu;
const animeReleaseGroupExp = /^(?:\[(?<subgroup>(?!\s).+?(?<!\s))\](?:_|-|\s|\.)?)/iu;

export function parseGroup(title: string): string | null {
	const nowebsiteTitle = title.replace(websitePrefixExp, '');
	let { title: releaseTitle } = parseTitleAndYear(nowebsiteTitle);
	releaseTitle = releaseTitle.replace(/ /gu, '.');
	let trimmed = nowebsiteTitle
		.replace(/ /gu, '.')
		.replace(releaseTitle === nowebsiteTitle
			? ''
			: releaseTitle, '')
		.replace(/\.-\./gu, '.');
	trimmed = simplifyTitle(removeFileExtension(trimmed.trim()));

	if (trimmed.length === 0) {
		return null;
	}

	const animeResult = animeReleaseGroupExp.exec(trimmed);
	if (animeResult?.groups) {
		return animeResult.groups.subgroup ?? '';
	}

	trimmed = trimmed.replace(cleanReleaseGroupExp, '');

	const globalReleaseGroupExp = new RegExp(releaseGroupRegexExp.source, 'igu');
	let result: RegExpExecArray | null;
	while ((result = globalReleaseGroupExp.exec(trimmed))) {
		if (!result || !result.groups) {
			continue;
		}

		const group = result.groups.releasegroup ?? '';

		return group;
	}

	return null;
}

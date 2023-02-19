import { AudioCodec, parseAudioCodec } from './audioCodec';
import { Channels, parseAudioChannels } from './audioChannels';
import { Edition, parseEdition } from './edition';
import { Language, isMulti, parseLanguage } from './language';
import { Revision, parseQuality } from './quality';
import { Season, parseSeason } from './season';
import { VideoCodec, parseVideoCodec } from './videoCodec';

import { Resolution } from './resolution';
import { Source } from './source';
import { isComplete } from './complete';
import { parseGroup } from './group';
import { parseTitleAndYear } from './title';
import { removeEmpty } from './utils';

export type ParsedTvInfo = Omit<Season, 'releaseTitle' | 'seriesTitle'>;

interface BaseParsed {
  title: string;
  year: number | null;
  edition: Edition;
  resolution?: Resolution;
  sources: Source[];
  videoCodec?: VideoCodec;
  audioCodec?: AudioCodec;
  audioChannels?: Channels;
  group: string | null;
  revision: Revision;
  languages: Language[];
  multi?: boolean;
  complete?: boolean;
}

export type ParsedMovie = BaseParsed;
export type ParsedShow = ParsedTvInfo & BaseParsed & { isTv: true };
export type ParsedFilename = ParsedMovie | ParsedShow;

/**
 * @param name release / file name
 * @param isTV
 */
export function filenameParse(name: string, isTv = false): ParsedFilename {
	let title: ParsedFilename['title'] = '';
	let year: ParsedFilename['year'] = null;

	if (!isTv) {
		const titleAndYear = parseTitleAndYear(name);
		title = titleAndYear.title;
		year = Number(titleAndYear.year);
	}

	const edition = parseEdition(name);
	const { codec: videoCodec } = parseVideoCodec(name);
	const { codec: audioCodec } = parseAudioCodec(name);
	const { channels: audioChannels } = parseAudioChannels(name);
	const group = parseGroup(name);
	const languages = parseLanguage(name);
	const quality = parseQuality(name);
	const multi = isMulti(name);
	const complete = isComplete(name);

	const result: BaseParsed = {
		title,
		year,
		resolution: quality.resolution,
		sources: quality.sources,
		videoCodec,
		audioCodec,
		audioChannels,
		revision: quality.revision,
		group,
		edition,
		languages,
		multi,
		complete,
	};

	if (isTv) {
		const season = parseSeason(name);
		if (season !== null) {
			const seasonResult: ParsedTvInfo = {
				seasons: season.seasons,
				episodeNumbers: season.episodeNumbers,
				airDate: season.airDate,
				fullSeason: season.fullSeason,
				isPartialSeason: season.isPartialSeason,
				isMultiSeason: season.isMultiSeason,
				isSeasonExtra: season.isSeasonExtra,
				isSpecial: season.isSpecial,
				seasonPart: season.seasonPart,
			};

			return {
				...result,
				title: season.seriesTitle ?? title,
				...seasonResult,
				isTv: true,
			};
		}
	}

	return removeEmpty(result);
}

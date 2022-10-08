/* eslint-disable @typescript-eslint/no-unused-vars */
/*
	Original python script by: echel0n <echel0n@sickrage.ca>
*/

let standard: RegExp;
let extended: RegExp;
export const dvd_regexes = [
	(standard = RegExp(
		[
			// Legend of Korra- Book 1- Air - Disc 1_t00.mkv
			// The Legend of Korra- Book Two- Spirits - Disc 1_t03.mkv
			'(?<title>[\\w\\s]*)', // Title
			'-\\s',
			'(?<subtitle>[\\d\\w\\s-]*)', //
			'\\s-\\s.*',
			'Disc\\s(?<disc>\\d)', // Disc Number
			'_t(?<track>\\d{2,4})', // Track
			'\\.(?<ext>\\w{3,4})$', // Extention
		].join(''),
		'iu'
	)),
	(extended = RegExp(
		[
			// Legend of Korra- Book 1- Air - Disc 1_t00.mkv
			// The Legend of Korra- Book Two- Spirits - Disc 1_t03.mkv
			'(?<title>[\\w\\s]*)',
			'[\\s-]*(?<subtitle>[\\w\\s]*)',
			'[s-](?<part>[\\w\\s]*)',
			'[-\\s]',
			'*Disc (?<disc>d{1,})',
			'_t(?<number>\\d{1,})',
		].join(''),
		'iu'
	)),
];

let standard_repeat: RegExp;
let fov_repeat: RegExp;
let newpct: RegExp;
let mvgroup: RegExp;
let fov: RegExp;
let scene_date_format: RegExp;
let scene_sports_format: RegExp;
let stupid_with_denotative: RegExp;
let stupid: RegExp;
let verbose: RegExp;
let season_only: RegExp;
let no_season_multi_ep: RegExp;
let no_season_general: RegExp;
export const normal_regexes = [
	(standard_repeat = RegExp(
		[
			// Show.Name.S01E02.S01E03.Source.Quality.Etc-Group
			// Show Name - S01E02 - S01E03 - S01E04 - Ep Name
			'^(?<title>.+?)[. _-]+', // Show_Name and separator
			's(?<season_num>\\d+)[. _-]*', // S01 and optional separator
			'e(?<ep_num>\\d+)', // E02 and separator
			'([. _-]+s(?=season_num)[. _-]*', // S01 and optional separator
			'e(?<extra_ep_num>\\d+))+', // E03/etc and separator
			'[. _-]*((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(fov_repeat = RegExp(
		[
			// Show.Name.1x02.1x03.Source.Quality.Etc-Group
			// Show Name - 1x02 - 1x03 - 1x04 - Ep Name
			'^(?<title>.+?)[. _-]+', // Show_Name and separator
			'(?<season_num>\\d+)x', // 1x
			'(?<ep_num>\\d+)', // 02 and separator
			'([. _-]+(?=season_num)x', // 1x
			'(?<extra_ep_num>\\d+))+', // 03/etc and separator
			'[. _-]*((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(standard = RegExp(
		[
			// Show.Name.S01E02.Source.Quality.Etc-Group
			// Show Name - S01E02 - My Ep Name
			// Show.Name.S01.E03.My.Ep.Name
			// Show.Name.S01E02E03.Source.Quality.Etc-Group
			// Show Name - S01E02-03 - My Ep Name
			// Show.Name.S01.E02.E03
			'^((?<title>.+?)[. _-]+)?', // Show_Name and separator
			'\\(?s(?<season_num>\\d+)[. _-]*', // S01 and optional separator
			'e(?<ep_num>\\d+)\\)?', // E02 and separator
			'(([. _-]*e|-)', // linking e/- char
			'(?<extra_ep_num>(?!(1080|720|480)[pi])\\d+)(\\))?)*', // additional E03/etc
			'([. _,-]+((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?)?$', // Group
		].join(''),
		'iu'
	)),
	(newpct = RegExp(
		[
			// American Horror Story - Temporada 4 HDTV x264[Cap.408_409]SPANISH AUDIO -NEWPCT
			// American Horror Story - Temporada 4 [HDTV][Cap.408][Espanol Castellano]
			// American Horror Story - Temporada 4 HDTV x264[Cap.408]SPANISH AUDIO –NEWPCT)
			'(?<title>.+?).-.+\\d{1,2}[ ,.]', // Show name: American Horror Story
			'(?<extra_info>.+)\\[Cap\\.', // Quality: HDTV x264, [HDTV], HDTV x264
			'(?<season_num>\\d{1,2})', // Season Number: 4
			'(?<ep_num>\\d{2})', // Episode Number: 08
			'((_\\d{1,2}(?<extra_ep_num>\\d{2})).*\\]|.*\\])', // Episode number2: 09
		].join(''),
		'iu'
	)),
	(mvgroup = RegExp(
		[
			// BBC.Great.British.Railway.Journeys.Series4.03of25.Stoke-on-Trent.to.Winsford.720p.HDTV.x264.AAC.MVGroup
			// BBC.Great.British.Railway.Journeys.Series.4.03of25.Stoke-on-Trent.to.Winsford.720p.HDTV.x264.AAC.MVGroup
			// Tutankhamun.With.Dan.Snow.Series.1.Part.1.1080p.HDTV.x264.AAC.MVGroup.org.mp4
			'^(?<title>.+?)[. _-]+', // Show_Name and separator
			'series(?:[. _-]?)(?<season_num>\\d+)[. _-]+', // Series.4
			'(?:part[. _-]+)?(?<ep_num>\\d{1,2})(?:of\\d{1,2})?', // 3of4
			'[. _-]+((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^- ]+))?)?$',
		].join(''),
		'iu'
	)),
	(fov = RegExp(
		[
			// Show_Name.1x02.Source_Quality_Etc-Group
			// Show Name - 1x02 - My Ep Name
			// Show_Name.1x02x03x04.Source_Quality_Etc-Group
			// Show Name - 1x02-03-04 - My Ep Name
			'^((?!\\[.+?\\])(?<title>.+?)[\\[. _-]+)?', // Show_Name and separator if no brackets group
			'(?<season_num>\\d+)x', // 1x
			'(?<ep_num>\\d+)', // 02 and separator
			'(([. _-]*x|-)', // linking x/- char
			'(?<extra_ep_num>', // extra ep num
			'(?!(1080|720|480)[pi])(?!(?<=x)264)', // ignore obviously wrong multi-eps
			'\\d+))*', // additional x03/etc
			'[\\]. _-]*((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(scene_date_format = RegExp(
		[
			// Show.Name.2010.11.23.Source.Quality.Etc-Group
			// Show Name - 2010-11-23 - Ep Name
			'^((?<title>.+?)[. _-]+)?', // Show_Name and separator
			'(?<air_date>\\d{4}[. _-]\\d{2}[. _-]\\d{2})', // Air-date
			'[. _-]*((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(scene_sports_format = RegExp(
		[
			// Show.Name.100.Event.2010.11.23.Source.Quality.Etc-Group
			// Show.Name.2010.11.23.Source.Quality.Etc-Group
			// Show Name - 2010-11-23 - Ep Name
			'^(?<title>.*?(UEFA|MLB|ESPN|WWE|MMA|UFC|TNA|EPL|NASCAR|NBA|NFL|NHL|NRL|PGA|SUPER LEAGUE|FORMULA|FIFA|NETBALL|MOTOGP).*?)[. _-]+',
			'((?<series_num>\\d{1,3})[. _-]+)?',
			'(?<air_date>(\\d+[. _-]\\d+[. _-]\\d+)|(\\d+\\w+[. _-]\\w+[. _-]\\d+))[. _-]+',
			'((?<extra_info>.+?)((?<![. _-])',
			'(?<!WEB)-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$',
		].join(''),
		'iu'
	)),
	(stupid_with_denotative = RegExp(
		[
			// aaf-sns03e09
			// flhd-supernaturals07e02-1080p
			'(?<release_group>.+?)(?<!WEB)-(?<title>\\w*)(?<!\\d)[\\. ]?', // aaf-sn
			'(?!264)', // don't count x264
			's(?<season_num>\\d{1,2})', // s03
			'e(?<ep_num>\\d{2})(?:(rp|-(1080p|720p)))?$', // e09
		].join(''),
		'iu'
	)),
	(stupid = RegExp(
		[
			// tpz-abc102
			'(?<release_group>.+?)(?<!WEB)-(?<title>\\w*)(?<!\\d)[\\. ]?', // tpz-abc
			'(?!264)', // don't count x264
			'(?<season_num>\\d{1,2})', // 1
			'(?<ep_num>\\d{2})$', // 02
		].join(''),
		'iu'
	)),
	(verbose = RegExp(
		[
			// Show Name Season 1 Episode 2 Ep Name
			'^(?<title>.+?)[. _-]+', // Show Name and separator
			'(season|series)[. _-]+', // season and separator
			'(?<season_num>\\d+)[. _-]+', // 1
			'episode[. _-]+', // episode and separator
			'(?<ep_num>\\d+)[. _-]+', // 02 and separator
			'(?<extra_info>.+)$', // Source_Quality_Etc-
		].join(''),
		'iu'
	)),
	(season_only = RegExp(
		[
			// Show.Name.S01.Source.Quality.Etc-Group
			'^((?<title>.+?)[. _-]+)?', // Show_Name and separator
			's(eason[. _-])?', // S01/Season 01
			'(?<season_num>\\d+)[. _-]*', // S01 and optional separator
			'[. _-]*((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(no_season_multi_ep = RegExp(
		[
			// Show.Name.E02-03
			// Show.Name.E02.2010
			'^((?<title>.+?)[. _-]+)?', // Show_Name and separator
			'(e(p(isode)?)?|part|pt)[. _-]?', // e, ep, episode, or part
			'(?<ep_num>(\\d+|(?<!e)[ivx]+))', // first ep num
			'((([. _-]+(and|&|to)[. _-]+)|-)', // and/&/to joiner
			'(?<extra_ep_num>(?!(1080|720|480)[pi])(\\d+|(?<!e)[ivx]+))[. _-])', // second ep num
			'([. _-]*(?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(no_season_general = RegExp(
		[
			// Show.Name.E23.Test
			// Show.Name.Part.3.Source.Quality.Etc-Group
			// Show.Name.Part.1.and.Part.2.Blah-Group
			'^((?<title>.+?)[. _-]+)?', // Show_Name and separator
			'(e(p(isode)?)?|part|pt)[. _-]?', // e, ep, episode, or part
			'(?<ep_num>(\\d+|((?<!e)[ivx]+(?=[. _-]))))', // first ep num
			'([. _-]+((and|&|to)[. _-]+)?', // and/&/to joiner
			'((e(p(isode)?)?|part|pt)[. _-]?)', // e, ep, episode, or part
			'(?<extra_ep_num>(?!(1080|720|480)[pi])',
			'(\\d+|((?<!e)[ivx]+(?=[. _-]))))[. _-])*', // second ep num
			'([. _-]*(?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	// bare = RegExp(
	//   [
	//     // Show.Name.102.Source.Quality.Etc-Group
	//     "^(?<title>.+?)[. _-]+",                        // Show_Name and separator
	//     "(?<season_num>\\d{1,2})",                            // 1
	//     "(e?)",                                               // Optional episode separator
	//     "(?<ep_num>\\d{2})",                                  // 02 and separator
	//     "([. _-]+(?<extra_info>(?!\\d{3}[. _-]+)[^-]+)",      // Source_Quality_Etc-
	//     "(-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$",   // Group
	//   ].join(""),
	//   "i"
	// ),
	// no_season = RegExp(
	//   [
	//     // Show Name - 01 - Ep Name
	//     // 01 - Ep Name
	//     // 01 - Ep Name
	//     "^((?<title>.+?)(?:[. _-]{2,}|[. _]))?",            // Show_Name and separator
	//     "(?<ep_num>\\d{1,3})",                                    // 02
	//     "(?:-(?<extra_ep_num>\\d{1,3}))*",                        // -03-04-05 etc
	//     "(\\s*(?:of)?\\s*\\d{1,3})?",                             // of joiner (with or without spaces) and series total ep
	//     "[. _-]+((?<extra_info>.+?)",                             // Source_Quality_Etc-
	//     "((?<![. _-])(?<!WEB)",                                   // Make sure this is really the release group
	//     "-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$",        // Group
	//   ].join(""),
	//   "i"
	// ),
];

let anime_horriblesubs: RegExp;
let anime_erai_raws: RegExp;
let anime_ultimate: RegExp;
let anime_french_fansub: RegExp;
let anime_standard: RegExp;
let anime_standard_round: RegExp;
let anime_slash: RegExp;
let anime_standard_codec: RegExp;
let anime_codec_crc: RegExp;
let anime_SxEE: RegExp;
let anime_SxxExx: RegExp;
let anime_and_normal_reverse: RegExp;
let anime_and_normal_front: RegExp;
let anime_ep_name: RegExp;
let anime_WarB3asT: RegExp;
export const anime_regexes = [
	(anime_horriblesubs = RegExp(
		[
			// [HorribleSubs] Maria the Virgin Witch - 01 [720p].mkv
			'^(?:\\[(?<release_group>HorribleSubs)\\][\\s\\.])',
			'(?:(?<title>.+?)[\\s\\.]-[\\s\\.])',
			'(?<ep_ab_num>((?!(1080|720|480)[pi]))\\d{1,3})',
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?',
			'(?:v(?<version>[0-9]))?',
			'(?:[\\w\\.\\s]*)',
			'(?:(?:(?:[\\[\\(])(?<extra_info>\\d{3,4}[xp]?\\d{0,4}[\\.\\w\\s-]*)(?:[\\]\\)]))|(?:\\d{3,4}[xp]))',
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_erai_raws = RegExp(
		[
			// [Erai-raws] Full Metal Panic! Invisible Victory - 12 END [1080p].mkv
			// [Erai-raws] A.I.C.O. Incarnation - 01 [1080p][Multiple Subtitle].mkv
			'^(?:\\[(?<release_group>Erai-raws)\\][\\s\\.])',
			'(?:(?<title>.+?)[\\s\\.]-[\\s\\.])',
			'(?<ep_ab_num>((?!(1080|720|480)[pi]))\\d{1,3})',
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?',
			'(?:v(?<version>[0-9]))?',
			'(?:[\\w\\.\\s]*)',
			'(?:(?:(?:[\\[\\(])(?<extra_info>\\d{3,4}[xp]?\\d{0,4}[\\.\\w\\s-]*)(?:[\\]\\)]))|(?:\\d{3,4}[xp]))',
			'(?:\\[(?<subs>.+?)?\\])?',
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_ultimate = RegExp(
		[
			'^(?:\\[(?<release_group>.+?)\\][ ._-]*)',
			'(?<title>.+?)[ ._-]+',
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})',
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?[ ._-]+?',
			'(?:v(?<version>[0-9]))?',
			'(?:[\\w\\.]*)',
			'(?:(?:(?:[\\[\\(])(?<extra_info>\\d{3,4}[xp]?\\d{0,4}[\\.\\w\\s-]*)(?:[\\]\\)]))|(?:\\d{3,4}[xp]))',
			'(?:[ ._]?\\[(?<crc>\\w+)\\])?',
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_french_fansub = RegExp(
		[
			// [Kaerizaki-Fansub]_One_Piece_727_[VOSTFR][HD_1280x720].mp4
			// [Titania-Fansub]_Fairy_Tail_269_[VOSTFR]_[720p]_[1921E00C].mp4
			// [ISLAND]One_Piece_726_[VOSTFR]_[V1]_[8bit]_[720p]_[2F7B3FA2].mp4
			// Naruto Shippuden 445 VOSTFR par Fansub-Resistance (1280*720) - version MQ
			// Dragon Ball Super 015 VOSTFR par Fansub-Resistance (1280x720) - HQ version
			// [Mystic.Z-Team].Dragon.Ball.Super.-.épisode.36.VOSTFR.720p
			// [Z-Team][DBSuper.pw] Dragon Ball Super - 028 (VOSTFR)(720p AAC)(MP4)
			// [SnF] Shokugeki no Souma - 24 VOSTFR [720p][41761A60].mkv
			// [Y-F] Ao no Kanata no Four Rhythm - 03 Vostfr HD 8bits
			// Phantasy Star Online 2 - The Animation 04 vostfr FHD
			// Detective Conan 804 vostfr HD
			// Active Raid 04 vostfr [1080p]
			// Sekko Boys 04 vostfr [720p]
			'^(\\[(?<release_group>.+?)\\][ ._-]*)?', // Release Group and separator (Optional)
			'((\\[|\\().+?(\\]|\\))[ ._-]*)?', // Extra info (Optionnal)
			'(?<title>.+?)[ ._-]+', // Show_Name and separator
			'((épisode|episode|Episode)[ ._-]+)?', // Sentence for special fansub (Optionnal)
			'(?<ep_ab_num>\\d{1,3})[ ._-]+', // Episode number and separator
			'(((\\[|\\())?(VOSTFR|vostfr|Vostfr|VostFR|vostFR)((\\]|\\)))?([ ._-])*)+', // Subtitle Language and separator
			'(par Fansub-Resistance)?', // Sentence for special fansub (Optionnal)
			'(\\[((v|V)(?<version>[0-9]))\\]([ ._-])*)?', // Version and separator (Optional)
			'((\\[(8|10)(Bits|bits|Bit|bit)\\])?([ ._-])*)?', // Colour resolution and separator (Optional)
			'((\\[|\\()((FHD|HD|SD)*([ ._-])*((?<extra_info>\\d{3,4}[xp*]?\\d{0,4}[\\.\\w\\s-]*)))(\\]|\\)))?', // Source_Quality_Etc-
			'([ ._-]*\\[(?<crc>\\w{8})\\])?', // CRC (Optional)
			'.*', // Separator and EOL
		].join(''),
		'iu'
	)),
	(anime_standard = RegExp(
		[
			// [Group Name] Show Name.13-14
			// [Group Name] Show Name - 13-14
			// Show Name 13-14
			// [Group Name] Show Name.13
			// [Group Name] Show Name - 13
			// Show Name 13
			'^(\\[(?<release_group>.+?)\\][ ._-]*)?', // Release Group and separator
			'(?<title>.+?)[ ._-]+', // Show_Name and separator
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})', // E01
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?', // E02
			'(v(?<version>[0-9]))?', // version
			'[ ._-]+\\[(?<extra_info>\\d{3,4}[xp]?\\d{0,4}[\\.\\w\\s-]*)\\]', // Source_Quality_Etc-
			'(\\[(?<crc>\\w{8})\\])?', // CRC
			'.*?', // Separator and EOL
		].join(''),
		'iu'
	)),
	(anime_standard_round = RegExp(
		[
			// [Stratos-Subs]_Infinite_Stratos_-_12_(1280x720_H.264_AAC)_[379759DB]
			// [Stratos-Subs]_Infinite_Stratos_-_12_(1280x720_H.264_AAC) [379759DB]
			// [ShinBunBu-Subs] Bleach - 02-03 (CX 1280x720 x264 AAC)
			'^(\\[(?<release_group>.+?)\\][ ._-]*)?', // Release Group and separator
			'(?<title>.+?)[ ._-]+', // Show_Name and separator
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})', // E01
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?', // E02
			'(v(?<version>[0-9]))?', // version
			'[ ._-]+\\((?<extra_info>(\\w+[ ._-]?)?\\d{3,4}[xp]?\\d{0,4}[\\.\\w\\s-]*)\\)[ ._-]+', // Source_Quality_Etc-
			'(\\[(?<crc>\\w{8})\\])?', // CRC
			'.*?', // Separator and EOL
		].join(''),
		'iu'
	)),
	(anime_slash = RegExp(
		[
			// [SGKK] Bleach 312v1 [720p/MKV]
			'^(\\[(?<release_group>.+?)\\][ ._-]*)?', // Release Group and separator
			'(?<title>.+?)[ ._-]+', // Show_Name and separator
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})', // E01
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?', // E02
			'(v(?<version>[0-9]))?', // version
			'[ ._-]+\\[(?<extra_info>\\d{3,4}p)', // Source_Quality_Etc-
			'(\\[(?<crc>\\w{8})\\])?', // CRC
			'.*?', // Separator and EOL
		].join(''),
		'iu'
	)),
	(anime_standard_codec = RegExp(
		[
			// [Ayako]_Infinite_Stratos_-_IS_-_07_[H264][720p][EB7838FC]
			// [Ayako] Infinite Stratos - IS - 07v2 [H264][720p][44419534]
			// [Ayako-Shikkaku] Oniichan no Koto Nanka Zenzen Suki Janain Dakara ne - 10 [LQ][h264][720p] [8853B21C]
			'^(\\[(?<release_group>.+?)\\][ ._-]*)?', // Release Group and separator
			'(?<title>.+?)[ ._]*', // Show_Name and separator
			'([ ._-]+-[ ._-]+[A-Z]+[ ._-]+)?[ ._-]+', // funny stuff, this is sooo nuts ! this will kick me in the butt one day
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})', // E01
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?', // E02
			'(v(?<version>[0-9]))?', // version
			'([ ._-](\\[\\w{1,2}\\])?\\[[a-z][.]?\\w{2,4}\\])?', // codec
			'[ ._-]*\\[(?<extra_info>(\\d{3,4}[xp]?\\d{0,4})?[\\.\\w\\s-]*)\\]', // Source_Quality_Etc-
			'(\\[(?<crc>\\w{8})\\])?',
			'.*?', // Separator and EOL
		].join(''),
		'iu'
	)),
	(anime_codec_crc = RegExp(
		[
			'^(?:\\[(?<release_group>.*?)\\][ ._-]*)?',
			'(?:(?<title>.*?)[ ._-]*)?',
			'(?:(?<ep_ab_num>(((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))[ ._-]*).+?',
			'(?:\\[(?<codec>.*?)\\][ ._-]*)',
			'(?:\\[(?<crc>\\w{8})\\])?',
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_SxEE = RegExp(
		[
			// Show_Name.1x02.Source_Quality_Etc-Group
			// Show Name - 1x02 - My Ep Name
			// Show_Name.1x02x03x04.Source_Quality_Etc-Group
			// Show Name - 1x02-03-04 - My Ep Name
			'^((?!\\[.+?\\])(?<title>.+?)[\\[. _-]+)?', // Show_Name and separator if no brackets group
			'(?<season_num>\\d+)x', // 1x
			'(?<ep_num>\\d+)', // 02 and separator
			'(([. _-]*x|-)', // linking x/- char
			'(?<extra_ep_num>',
			'(?!(1080|720|480)[pi])(?!(?<=x)264)', // ignore obviously wrong multi-eps
			'\\d+))*', // additional x03/etc
			'[\\]. _-]*((?<extra_info>.+?)', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	(anime_SxxExx = RegExp(
		[
			// Show.Name.S01E02.Source.Quality.Etc-Group
			// Show Name - S01E02 - My Ep Name
			// Show.Name.S01.E03.My.Ep.Name
			// Show.Name.S01E02E03.Source.Quality.Etc-Group
			// Show Name - S01E02-03 - My Ep Name
			// Show.Name.S01.E02.E03
			// Show Name - S01E02
			// Show Name - S01E02-03
			'^((?<title>.+?)[. _-]+)?', // Show_Name and separator
			'(\\()?s(?<season_num>\\d+)[. _-]*', // S01 and optional separator
			'e(?<ep_num>\\d+)(\\))?', // E02 and separator
			'(([. _-]*e|-)', // linking e/- char
			'(?<extra_ep_num>(?!(1080|720|480)[pi])\\d+)(\\))?)*', // additional E03/etc
			'([. _-]+((?<extra_info>.+?))?', // Source_Quality_Etc-
			'((?<![. _-])(?<!WEB)', // Make sure this is really the release group
			'-(?<release_group>[^ -]+([. _-]\\[.*\\])?))?)?$', // Group
		].join(''),
		'iu'
	)),
	// anime_and_normal = RegExp(
	//   [
	//     // Bleach - s16e03-04 - 313-314
	//     // Bleach.s16e03-04.313-314
	//     // Bleach s16e03e04 313-314
	//     "^(?<title>.+?)[ ._-]+",                                                // start of string and series name and non optinal separator
	//     "s(?<season_num>\\d+)[. _-]*",                                                // S01 and optional separator
	//     "e(?<ep_num>\\d+)",                                                           // epipisode E02
	//     "(([. _-]*e|-)",                                                              // linking e/- char
	//     "(?<extra_ep_num>\\d+))*",                                                    // additional E03/etc
	//     "([ ._-]{2,}|[ ._]+)",                                                        // if "-" is used to separate at least something else has to be there(->{2,}) "s16e03-04-313-314" would make sens any way
	//     "((?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?",            // absolute number
	//     "(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?",     // "-" as separator and anditional absolute number, all optinal
	//     "(v(?<version>[0-9]))?",                                                      // the version e.g. "v2"
	//     ".*?",
	//   ].join(""),
	//   "i"
	// ),
	// anime_and_normal_x = RegExp(
	//   [
	//     // Bleach - s16e03-04 - 313-314
	//     // Bleach.s16e03-04.313-314
	//     // Bleach s16e03e04 313-314
	//     "^(?<title>.+?)[ ._-]+",                                                // start of string and series name and non optinal separator
	//     "(?<season_num>\\d+)[. _-]*",                                                 // S01 and optional separator
	//     "[xX](?<ep_num>\\d+)",                                                        // epipisode E02
	//     "(([. _-]*e|-)",                                                              // linking e/- char
	//     "(?<extra_ep_num>\\d+))*",                                                    // additional E03/etc
	//     "([ ._-]{2,}|[ ._]+)",                                                        // if "-" is used to separate at least something else has to be there(->{2,}) "s16e03-04-313-314" would make sens any way
	//     "((?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?",            // absolute number
	//     "(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?",     // "-" as separator and anditional absolute number, all optinal
	//     "(v(?<version>[0-9]))?",                                                      // the version e.g. "v2"
	//     ".*?",
	//   ].join(""),
	//   "i"
	// ),
	(anime_and_normal_reverse = RegExp(
		[
			// Bleach - 313-314 - s16e03-04
			'^(?<title>.+?)[ ._-]+', // start of string and series name and non optinal separator
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})', // absolute number
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?', // "-" as separator and anditional absolute number, all optinal
			'(v(?<version>[0-9]))?', // the version e.g. "v2"
			'([ ._-]{2,}|[ ._]+)', // if "-" is used to separate at least something else has to be there(->{2,}) "s16e03-04-313-314" would make sens any way
			's(?<season_num>\\d+)[. _-]*', // S01 and optional separator
			'e(?<ep_num>\\d+)', // epipisode E02
			'(([. _-]*e|-)', // linking e/- char
			'(?<extra_ep_num>\\d+))*', // additional E03/etc
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_and_normal_front = RegExp(
		[
			// 165.Naruto Shippuuden.s08e014
			'^(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})', // start of string and absolute number
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?', // "-" as separator and anditional absolute number, all optinal
			'(v(?<version>[0-9]))?[ ._-]+', // the version e.g. "v2"
			'(?<title>.+?)[ ._-]+',
			's(?<season_num>\\d+)[. _-]*', // S01 and optional separator
			'e(?<ep_num>\\d+)',
			'(([. _-]*e|-)', // linking e/- char
			'(?<extra_ep_num>\\d+))*', // additional E03/etc
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_ep_name = RegExp(
		[
			'^(?:\\[(?<release_group>.+?)\\][ ._-]*)',
			'(?<title>.+?)[ ._-]+',
			'(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})',
			'(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?[ ._-]*?',
			'(?:v(?<version>[0-9])[ ._-]+?)?',
			'(?:.+?[ ._-]+?)?',
			'\\[(?<extra_info>\\w+)\\][ ._-]?',
			'(?:\\[(?<crc>\\w{8})\\])?',
			'.*?',
		].join(''),
		'iu'
	)),
	(anime_WarB3asT = RegExp(
		[
			// 003. Show Name - Ep Name.ext
			// 003-004. Show Name - Ep Name.ext
			'^(?<ep_ab_num>\\d{3,4})(-(?<extra_ab_ep_num>\\d{3,4}))?\\.\\s+(?<title>.+?)\\s-\\s.*',
		].join(''),
		'iu'
	)),
	// anime_bare = RegExp(
	//   [
	//     // One Piece - 102
	//     // [ACX]_Wolf's_Spirit_001.mkv
	//     "^(\\[(?<release_group>.+?)\\][ ._-]*)?",
	//     "(?<title>.+?)[ ._-]+",                                                 // Show_Name and separator
	//     "(?<ep_ab_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3})",               // E01
	//     "(-(?<extra_ab_ep_num>((?!(1080|720|480)[pi])|(?![hx].?264))\\d{1,3}))?",     // E02
	//     "(v(?<version>[0-9]))?",                                                      // v2
	//     ".*?",                                                                        // Separator and EOL
	//   ].join(""),
	//   "i"
	// ),
];

export const movie_regexes = [
	(standard = RegExp(
		[
			'.+[\\\\\\/]',
			'(?<folder>.+)[\\\\\\/]',
			'(?<title>.+)\\.(\\s|\\.|\\()',
			'(?<year>(19|20)[0-9][0-9])(\\)|.*|(?!p))',
			'(?<ext>\\.\\w+)$',
		].join(''),
		'iu'
	)),
];

export default {
	normal_regexes,
	anime_regexes,
	dvd_regexes,
	movie_regexes,
};

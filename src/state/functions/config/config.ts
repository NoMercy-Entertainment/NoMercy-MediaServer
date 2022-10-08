export const createLibraryFile = () => {
	const config = {
		enablePhotos: true,
		enableRealtimeMonitor: true,
		enableChapterImageExtraction: true,
		extractChapterImagesDuringLibraryScan: true,
		pathInfos: {
			mediaPathInfo: {
				path: 'M:\\Anime\\Anime',
			},
		},
		saveLocalMetadata: true,
		enableAutomaticSeriesGrouping: true,
		enableEmbeddedTitles: false,
		enableEmbeddedEpisodeInfos: false,
		automaticRefreshIntervalDays: '30',
		preferredMetadataLanguage: 'nl',
		metadataCountryCode: 'NL',
		seasonZeroDisplayName: 'Specials',
		metadataSavers: {
			string: 'Nfo',
		},
		disabledLocalMetadataReaders: [],
		LocalMetadataReaderOrder: {
			string: 'Nfo',
		},
		disabledSubtitleFetchers: [],
		subtitleFetcherOrder: {
			string: 'Open Subtitles',
		},
		skipSubtitlesIfEmbeddedSubtitlesPresent: false,
		skipSubtitlesIfAudioTrackMatches: false,
		subtitleDownloadLanguages: [],
		requirePerfectSubtitleMatch: true,
		saveSubtitlesWithMedia: true,
		automaticallyAddToCollection: false,
		allowEmbeddedSubtitles: 'AllowAll',
		typeOptions: [
			{
				type: 'Series',
				metadataFetchers: ['TheMovieDb', 'The Open Movie Database'],
				metadataFetcherOrder: ['TheMovieDb', 'The Open Movie Database'],
				imageFetchers: ['TheMovieDb'],
				imageFetcherOrder: ['TheMovieDb'],
				imageOptions: [],
			},
			{
				type: 'Season',
				metadataFetchers: {
					string: 'TheMovieDb',
				},
				metadataFetcherOrder: {
					string: 'TheMovieDb',
				},
				imageFetchers: {
					string: 'TheMovieDb',
				},
				imageFetcherOrder: {
					string: 'TheMovieDb',
				},
				imageOptions: [],
			},
			{
				type: 'Episode',
				metadataFetchers: ['TheMovieDb', 'The Open Movie Database'],
				metadataFetcherOrder: ['TheMovieDb', 'The Open Movie Database'],
				imageFetchers: ['TheMovieDb', 'The Open Movie Database', 'Embedded Image Extractor', 'Screen Grabber'],
				imageFetcherOrder: ['TheMovieDb', 'The Open Movie Database', 'Embedded Image Extractor', 'Screen Grabber'],
				imageOptions: [],
			},
		],
	};

	return;
};

export default {};

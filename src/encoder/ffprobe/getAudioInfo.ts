import { errorLog, ffprobe } from '../../state';

import { AudioFFprobe } from './ffprobe';
import Logger from '../../functions/logger';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

export default (file: string): Promise<AudioFFprobe> => {
	return new Promise((resolve, reject) => {

		ffmpeg.setFfprobePath(ffprobe);

		Logger.log({
			level: 'verbose',
			name: 'Encoder',
			color: 'cyanBright',
			message: `Getting file info from: ${file}`,
		});

		return ffmpeg.ffprobe(file, async (error, audioInfo) => {
			if (error) {
				fs.appendFileSync(errorLog, `${error.toString().replace(/[\w\s\d\W\D\S\n\r]*\n/u, '')}\n`);
				return reject(error);
			}
			let audio: any = {};
			let format: any = {};
			let tags: any = {};

			Logger.log({
				level: 'debug',
				name: 'Encoder',
				color: 'cyanBright',
				message: JSON.stringify(audioInfo),
			});

			await Promise.all([
				audioInfo.streams.map((stream) => {
					if (stream.codec_type == 'audio') {
						audio = {
							index: stream.index,
							codec_name: stream.codec_name,
							codec_long_name: stream.codec_long_name,
							codec_type: stream.codec_type,
							codec_time_base: stream.codec_time_base,
							codec_tag_string: stream.codec_tag_string,
							sample_fmt: stream.sample_fmt,
							sample_rate: stream.sample_rate,
							channels: stream.channels,
							channel_layout: stream.channel_layout,
							bits_per_sample: stream.bits_per_sample,
							time_base: stream.time_base,
							bit_rate: stream.bit_rate,
						};
					}
				}),
				(format = {
					filename: audioInfo.format.filename,
					nb_streams: audioInfo.format.nb_streams,
					nb_programs: audioInfo.format.nb_programs,
					format_name: audioInfo.format.format_name,
					format_long_name: audioInfo.format.format_long_name,
					start_time: audioInfo.format.start_time,
					duration: audioInfo.format.duration,
					size: audioInfo.format.size,
					bit_rate: audioInfo.format.bit_rate,
				}),
				(tags = {
					acoustid_id: audioInfo.format.tags?.['Acoustid Id'] || audioInfo.format.tags?.ACOUSTID_ID,
					MusicBrainz_album_artist_id:
						audioInfo.format.tags?.['MusicBrainz Album Artist Id'] || audioInfo.format.tags?.MUSICBRAINZ_ALBUMARTISTID,
					MusicBrainz_album_id: audioInfo.format.tags?.['MusicBrainz Album Id'] || audioInfo.format.tags?.MUSICBRAINZ_ALBUMID,
					MusicBrainz_album_release_country:
						audioInfo.format.tags?.['MusicBrainz Album Release Country'] || audioInfo.format.tags?.RELEASECOUNTRY,
					MusicBrainz_album_status: audioInfo.format.tags?.['MusicBrainz Album Status'] || audioInfo.format.tags?.RELEASESTATUS,
					MusicBrainz_album_type: audioInfo.format.tags?.['MusicBrainz Album Type'] || audioInfo.format.tags?.RELEASETYPE,
					MusicBrainz_release_group_id:
						audioInfo.format.tags?.['MusicBrainz Release Group Id'] || audioInfo.format.tags?.MUSICBRAINZ_RELEASEGROUPID,
					MusicBrainz_release_track_id:
						audioInfo.format.tags?.['MusicBrainz Release Track Id'] || audioInfo.format.tags?.MUSICBRAINZ_RELEASETRACKID,
					MusicBrainz_work_id: audioInfo.format.tags?.['MusicBrainz Work Id'],
					'artist-sort': audioInfo.format.tags?.['artist-sort'] || audioInfo.format.tags?.ARTISTSORT,

					ARTISTS:
						(audioInfo.format.tags?.ARTISTS as string)?.split(';').map(a => a.trim())
						|| (audioInfo.format.tags?.ALBUMARTISTSORT as string)?.split(';').map(a => a.trim()),
					ASIN: audioInfo.format.tags?.ASIN,
					BARCODE: audioInfo.format.tags?.BARCODE,
					CATALOGNUMBER: audioInfo.format.tags?.CATALOGNUMBER || audioInfo.format.tags?.CATALOGNUMBER,
					MusicBrainz_artist_ids:
						(audioInfo.format.tags?.['MusicBrainz Artist Id'] as string)?.split(';').map(a => a.trim())
						|| (audioInfo.format.tags?.MUSICBRAINZ_ARTISTID as string)?.split(';').map(a => a.trim()),
					SCRIPT: audioInfo.format.tags?.SCRIPT || audioInfo.format.tags?.SCRIPT,
					TDOR: audioInfo.format.tags?.TDOR,
					TIPL: audioInfo.format.tags?.TIPL,
					TIT1: audioInfo.format.tags?.TIT1,
					TMED: audioInfo.format.tags?.TMED,
					TSO2: audioInfo.format.tags?.TSO2,
					TSRC: audioInfo.format.tags?.TSRC,
					Writer: audioInfo.format.tags?.Writer,
					Album: audioInfo.format.tags?.album || audioInfo.format.tags?.ALBUM,
					album_artist: audioInfo.format.tags?.album_artist,
					Artist: audioInfo.format.tags?.artist || audioInfo.format.tags?.ARTIST,
					date: audioInfo.format.tags?.date || audioInfo.format.tags?.DATE,
					disc: audioInfo.format.tags?.disc,
					genre:
						(audioInfo.format.tags?.genre as string)?.split(';').map(g => g.trim())
						|| (audioInfo.format.tags?.GENRE as string)?.split(';').map(g => g.trim()),
					language: audioInfo.format.tags?.language,
					originalyear: audioInfo.format.tags?.originalyear || audioInfo.format.tags?.ORIGINALYEAR,
					publisher: audioInfo.format.tags?.publisher,
					title: audioInfo.format.tags?.title || audioInfo.format.tags?.TITLE,
					track: audioInfo.format.tags?.track,
				}),
			]);
			return resolve({
				audio,
				format,
				tags,
			});
		});
	});
};

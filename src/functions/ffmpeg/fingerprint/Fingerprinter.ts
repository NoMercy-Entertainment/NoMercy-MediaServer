import { exec } from 'child_process';

import type { VideoFFprobe } from '../../../encoder/ffprobe/ffprobe';
import getVideoInfo from '../../../encoder/ffprobe/getVideoInfo';
import { humanTime } from '@server/functions/dateTime';
import { chunk } from '@server/functions/stringArray';
import { ffmpeg } from '@server/state';
import Logger from '../../logger';
import { stringFormat } from '../../stringFormat';

export interface Episode {
	EpisodeId: string;
	title: string;
	path: string;
}

export interface TimeRange {
	start: number;
	end: number;
	duration: number;
	humanStart: string;
	humanEnd: string;
	blackFrames: number[][];
}


export class FFmpegWrapper {

	decibelFloor: string | number = -50;
	startTime: string | number = 10;

	episode: Episode = <Episode>{};

	silenceReg = /silence_(?<type>start|end): (?<time>[0-9\.]+)/gmu;
	BlackFrameRegex = /(pblack|t):[0-9.]+/gu;

	streams: VideoFFprobe['streams'] = <VideoFFprobe['streams']>{};
	chapters: VideoFFprobe['chapters'] | undefined = <VideoFFprobe['chapters']>{};
	format: VideoFFprobe['format'] = <VideoFFprobe['format']>{};
	attachments: VideoFFprobe['streams']['attachments'] = <VideoFFprobe['streams']['attachments']>{};
	limit: string | number | boolean = 0;
	silenceRanges: TimeRange[] = [];
	segmentDurations: number[] = [];
	blackFrames: number[][] = [];

	constructor() {

		return this;
	}

	open(episode: Episode, limit?: number) {
		this.episode = episode;
		return new Promise(async (resolve, reject) => {
			const info = await getVideoInfo(this.episode.path);
			if (info.error) {
				reject(new Error(`Can't process file: ${this.episode.path}`));
			}

			this.streams = info.streams;
			this.chapters = info.chapters;
			this.format = info.format;
			this.attachments = info.streams.attachments;

			this.limit = limit ?? Math.min(this.format.duration as number * 0.25, 600);

			return resolve(this);
		});
	}

	logger(template: string, ...args: (string|number|boolean)[]) {
		Logger.log({
			level: 'info',
			name: 'FFmpegWrapper',
			color: 'cyan',
			message: stringFormat(template, ...args),
		});
	}

	async detectSilence() {

		this.logger(
			'Detecting silence in "{0}" (limit {1}, id {2})',
			this.episode.path,
			this.limit,
			this.episode.EpisodeId
		);

		// -vn, -sn, -dn: ignore video, subtitle, and data tracks
		const args = '-vn -sn -dn -i "{0}" -to {1} -af "silencedetect=noise={2}dB:duration=0.1" -f null -';
		const cmd = stringFormat(args, this.episode.path, this.limit, this.decibelFloor);

		// Cache the output of this command to "GUID-intro-silence-v1"
		const cacheKey = `${this.episode.EpisodeId.toString()}-intro-silence-v1`;

		/* Each match will have a type (either "start" or "end") and a timecode (a double).
		 *
		 * Sample output:
		 * [silencedetect @ 0x000000000000] silence_start: 12.34
		 * [silencedetect @ 0x000000000000] silence_end: 56.123 | silence_duration: 43.783
		*/
		const raw = await this.getOutput(cmd, cacheKey, true);
		const silenceRanges: TimeRange[] = [];

		const matches: {
			[key: string]: string;
		}[] = [];

		raw.split('\n').forEach((s) => {
			const res = /silence_(?<type>start|end): (?<time>[0-9\.]+)/gmu.exec(s);
			if (res?.groups) {
				matches.push(res?.groups);
			}
		});

		for (const match of chunk(matches, 2)) {
			const start = parseFloat(match[0].time);
			const end = parseFloat(match[1].time);

			const blackFrames = await this.detectBlackFrames({ start, end });

			silenceRanges.push({
				start,
				humanStart: humanTime(start),
				end,
				humanEnd: humanTime(end),
				duration: end - start,
				blackFrames: blackFrames,
			});
		}

		this.silenceRanges = silenceRanges;

		return this;
	}

	getSegmentDurations() {
		const segmentDurations: number[] = [];

		for (const [index, segment] of this.silenceRanges.entries()) {
			if (index === 0) {
				segmentDurations.push(segment.start);
			} else {
				segmentDurations.push(segment.start - this.silenceRanges[index - 1].end);
			}
		}

		this.segmentDurations = segmentDurations;

		return this;
	}

	async detectBlackFrames(range: {start: number, end: number}) {

		this.logger(
			'Detecting silence in "{0}" (limit {1}, id {2})',
			this.episode.path,
			this.limit,
			this.episode.EpisodeId
		);

		const args = stringFormat(
			'-ss {0} -i "{1}" -to {2} -an -dn -sn -vf "blackframe=amount=50" -f null -',
			range.start,
			this.episode.path,
			range.end - range.start
		);

		// Cache the results to GUID-blackframes-START-END-v1.
		const cacheKey = stringFormat(
			'{0}-blackframes-{1}-{2}-v1',
			this.episode.EpisodeId.toString(),
			range.start,
			range.end
		);

		const raw = await this.getOutput(args, cacheKey, true);

		const blackFrames: number[][] = [];
		for (const line of raw.split('\n')) {

			if (line.includes('blackframe')) {

				const matches = line.match(/(pblack|t):[0-9.]+/gu);

				if (matches?.length != 2) continue;

				const [strPercent, strTime] = [
					parseInt(matches[0].split(':')[1], 10),
					parseFloat(matches[1].split(':')[1]),
				];

				blackFrames.push([strPercent, strTime]);
			}
		}

		// this.blackFrames = blackFrames;

		return blackFrames;
	}

	getOutput(
		args: string,
		cacheFilename: string,
		stderr = false,
		timeout = 60 * 1000
	): Promise<string> {
		console.log(`"${ffmpeg}" -hide_banner ${args} 2>&1`);

		return new Promise((resolve, reject) => {
			exec(`"${ffmpeg}" -hide_banner ${args} 2>&1`, (error, stdout, stderr) => {
				if (error) {
					Logger.log({
						level: 'error',
						color: 'red',
						name: 'FFmpegWrapper',
						message: error.message,
					});
					return reject(error.message);
				}
				if (stderr) {
					Logger.log({
						level: 'error',
						color: 'red',
						name: 'FFmpegWrapper',
						message: stderr,
					});
					return reject(stderr);
				}

				resolve(stdout);
			});
		});
	}

};


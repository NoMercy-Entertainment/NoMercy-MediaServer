import { ArrayElementType, VideoFFprobe } from '../../encoder/ffprobe/ffprobe';

import { FFMpeg } from './ffmpeg';
import { isoToName } from './language';
import { transcodesPath } from '../../state';

export class OnDemand extends FFMpeg {
	file: string;
	title: string;
	startTime: number;
	streamMaps: string[] = [];
	preferredAudioLanguage: string| null = null;
	preferredSubtitleLanguage: string| null = null;

	constructor({ userId, file, title, startTime }: {userId: string, file: string, title: string, startTime: number}) {
		super();

		this.file = file;
		this.title = title;
		this.startTime = startTime;

		this.toDisk(`${transcodesPath}/${userId}`);
		this.setTitle(title);

		if (startTime) {
			this.addPreInputCommand('-ss', startTime);
		}

		return this;
	}

	setPreferredAudioLanguage(val: string) {
		this.preferredAudioLanguage = val;

		return this;
	}

	setPreferredSubtitleLanguage(val: string) {
		this.preferredSubtitleLanguage = val;

		return this;
	}

	makeStack() {
		if (this.streams.video.length > 0) {
			this.addVideoStream(this.streams.video[0]);
		}

		if (this.preferredAudioLanguage && this.streams.audio.some(a => a.language == this.preferredAudioLanguage)) {
			this.addAudioStream(this.streams.audio.find(a => a.language == this.preferredAudioLanguage)!);
		} else if (this.streams.audio.length > 0) {
			this.addAudioStream(this.streams.audio[0]);
		}

		if (this.preferredSubtitleLanguage && this.streams.subtitle.some(a => a.language == this.preferredSubtitleLanguage)) {
			this.addSubtitleStream(this.streams.subtitle.find(a => a.language == this.preferredSubtitleLanguage)!);
		} else if (this.streams.subtitle.length > 0) {
			this.addSubtitleStream(this.streams.subtitle[0]);
		}

		this.buildHLS();

		return this;
	}

	addVideoStream(
		stream: ArrayElementType<VideoFFprobe['streams']['video']>,
		size?: { width: number, height: number }
	) {

		if (size?.width && size?.height) {
			stream.width = size.width;
			stream.height = size.height;
		}

		const framerate = this.getFrameRate();

		this.addCommand('-map', `0:${stream.index}`);

		// if (stream.codec_name == 'h264') {
		//     this.addCommand('-c:v', 'copy');
		// } else {
		this.addCommand('-c:v', 'h264')
			.addCommand('-movflags', 'faststart')
			.addCommand('-map_metadata', '0')
			.addCommand('-metadata', `title="${this.title}"`)

			.addVideoFilters()
			.addCommand('-keyint_min', framerate)
			.addCommand('-x264opts', `"keyint=${framerate}:min-keyint=${framerate}:no-scenecut"`)
			.addCommand('-g', framerate)
			.addCommand('-r:v', framerate)
			.addCommand('-s', `${stream.width}x${stream.height}`)
			.addCommand('-pix_fmt', 'yuv420p')
			.addCommand('-profile:v', 'high')
			.addCommand('-preset', 'ultrafast')
			.addCommand('-level', '3.1');
		// }

		this.addStreamMap('v:0');

		if (this.streams.audio[0]) {
			this.addStreamMap('agroup:audio');
		}

		if (this.streams.subtitle[0]) {
			this.addStreamMap('sgroup:subs');
		}

		return this;
	}

	addAudioStream(stream: ArrayElementType<VideoFFprobe['streams']['audio']>) {

		this.addCommand('-map', `0:${stream.index}`);

		// if (stream.codec_name == 'aac' && stream.channels == 2) {
		//     this.addCommand('-c:a', 'copy');
		// } else {
		this
			.addCommand('-c:a', 'aac')
			.addCommand('-strict', 2)
			.addCommand('-ac', 2)
			.addAudioFilters();
		// }

		this.addStreamMap('a:0');

		return this;
	}

	addSubtitleStream(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>) {

		this
			.addCommand('-map', `0:${stream.index}`)
			.addCommand('-c:s', 'webvtt');

		this
			.addStreamMap('s:0')
			.addStreamMap('default:yes')
			.addStreamMap('sgroup:subs')
			.addStreamMap(`language:${stream.language}`)
			.addStreamMap(`name:${isoToName(stream.language)}`);

		return this;
	}

	addStreamMap(arg: string) {
		this.streamMaps.push(arg);

		return this;
	}

	buildStreamMaps() {
		const result = this.streamMaps.join(',');
		this.addCommand('-var_stream_map', `"${result}"`);

		return this;
	}

	buildHLS() {

		this
			.addCommand('-f', 'hls')
			.addCommand('-hls_flags', 'independent_segments')
			.addCommand('-segment_list_size', '0')
			.addCommand('-hls_segment_type', 'mpegts')
			.addCommand('-hls_allow_cache', '1')
			.addCommand('-start_number', '0')
			.addCommand('-hls_playlist_type', 'event')
			.addCommand('-segment_time', '4')
			.addCommand('-hls_allow_cache', '1')
			.addCommand('-segment_list_type', 'm3u8')
			.addCommand('-bsf:v', 'h264_mp4toannexb')
			.addCommand('-use_wallclock_as_timestamps', '1')
			.buildStreamMaps()
			.addFile(['video.m3u8']);

		return this;
	}

	check() {
		console.log(this);
		return this;
	}

}

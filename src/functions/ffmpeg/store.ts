import { Library } from '@prisma/client';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { ArrayElementType, VideoFFprobe } from '../../encoder/ffprobe/ffprobe';
import { ffmpeg, transcodesPath } from '../../state';
import { EP, MV, createBaseFolder, createEpisodeFolder, createFileName } from '../../tasks/files/filenameParser';
import { createTimeInterval } from '../dateTime';
import { unique } from '../stringArray';
import { FFMpeg } from './ffmpeg';
import { isoToName } from './language';

export class Store extends FFMpeg {
    file = '';
    title = '';
    segmentDuration = 4;

    streamMaps: string[] = [];
    library: Library = <Library>{};
    manifestFile = '';
    path = transcodesPath;

    videoStreams: string[] = [];

    audioStreams: string[] = [];
    defaultStream = 'YES';

    thumbSize = {
        w: 320,
        h: 180,
    };

    thumbnailsFolder = '';
    previewFiles = '';
    spriteFile = '';

    constructor() {
        super();

        return this;
    }

	toDisk(path: string) {
		mkdirSync(path, { recursive: true });
        this.path = path;
		return this;
	}

    async fromFile(file: string, title: string) {
        await this.open(file);

        this.title = title;
        this.setTitle(title);

        return this;
    }

    async fromDatabase(data: EP | MV) {

        await this.open(data.File[0].path);

        this.title = data.title;

        this.baseFolder = createBaseFolder(data);

        if ((data as EP).airDate) {
            this.episodeFolder = createEpisodeFolder(data as EP);
        }

        this.fileName = createFileName(data);

        this.toDisk(join(data.File[0].Library.Folders[0].folder!.path, this.baseFolder, this.episodeFolder));

        this.thumbnailsFolder = `${this.path}/thumbs/`;
        this.previewFiles = `${this.path}/previews.vtt`;
        this.spriteFile = `${this.path}/sprite.webp`;

        return this;
    }

    makeStack() {

        this.manifestFile = join(this.path, `${this.fileName}.m3u8`);

        // if (existsSync(this.manifestFile)) {
        //     return this;
        // }

        if (this.streams.video.length > 0) {
            this.addVideoStream(this.streams.video[0]);
        }

        for (const stream of unique(this.streams.audio, 'language') ?? []) {
            this.addAudioStream(stream);
        }

        for (const stream of this.streams.subtitle ?? []) {
            this.addSubtitleStream(stream);
        }

        this.addThumbnailsStream();

        this.buildMasterPlaylist();

        return this;
    }

    addVideoStream(
        stream: ArrayElementType<VideoFFprobe['streams']['video']>,
        quality?: {
            width: number;
            height: number;
            crf?: number;
            bitrate?: number;
            maxrate?: number;
        }
    ) {

        this.videoStreams.push(`${stream.width}x${stream.height}`);

        if (existsSync(this.getFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]))) {
            return this;
        }

        if (quality?.width && quality?.height) {
            stream.width = quality.width;
            stream.height = quality.height;
        }

        const framerate = this.getFrameRate();

        this.addCommand('-map', `0:${stream.index}`);

        this
            .addCommand('-c:v', 'h264')
            .addCommand('-an')
            .addCommand('-map_metadata', '0')
            .addCommand('-metadata', `title="${this.title}"`);

            if (quality?.crf) {
                this.addCommand(`-crf ${quality?.crf}`);
            }
            if (quality?.bitrate) {
                this.addCommand(`-b:v ${quality?.bitrate}`);
                this.addCommand('-bufsize 1M');
            }
            if (quality?.maxrate) {
                this.addCommand(`-maxrate ${quality?.maxrate}`);
            }

        this
            .addVideoFilters()
            .addCommand('-keyint_min', framerate)
            .addCommand('-x264opts', `"keyint=${framerate}:min-keyint=${framerate}:no-scenecut"`)
            .addCommand('-g', framerate)
            .addCommand('-r:v', framerate)
            .addCommand('-s', `${stream.width}x${stream.height}`)
            .addCommand('-pix_fmt', 'yuv420p')
            .addCommand('-profile:v', 'high')
            .addCommand('-preset', 'ultrafast')
            .addCommand('-level', 4.1);

        this
            .addCommand('-f', 'hls')
            .addCommand('-hls_allow_cache', 1)
            .addCommand('-hls_flags', 'independent_segments')
            .addCommand('-hls_playlist_type', 'vod')
            .addCommand('-hls_segment_type', 'mpegts')
            .addCommand('-segment_time_delta', 1)
            .addCommand('-hls_list_size', '0')
            .addCommand('-segment_list_type', 'm3u8')
            .addCommand('-hls_time', this.segmentDuration)
            .addCommand('-hls_init_time', this.segmentDuration)
            .addCommand('-start_number', '0')
            .addCommand('-force_key_frames:v', '"expr:gte(t,n_forced*2)"')
            .addCommand('-bsf:v', 'h264_mp4toannexb')
            .addCommand('-use_wallclock_as_timestamps', 1)
            .addCommand('-hls_segment_filename', `video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}_%04d.ts`)
            // .addCommand('-master_pl_name', `video_${stream.width}x${stream.height}_temp.m3u8`)
            .addFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]);

        return this;
    }

    addAudioStream(stream: ArrayElementType<VideoFFprobe['streams']['audio']>) {

        this.audioStreams.push(stream.language);

        if (existsSync(this.getFile([`audio_${stream.language}/audio_${stream.language}.m3u8`]))) {
            return this;
        }

        this.addCommand('-map', `0:${stream.index}`);

        this
            .addCommand('-c:a', 'aac')
            .addCommand('-strict', 2)
            .addCommand('-ac', 2)

            .addAudioFilters()

            .addCommand(`-metadata:s:a:${this.audioStreams.length}`, `language="${stream.language}"`)
            .addCommand(`-metadata:s:a:${this.audioStreams.length}`, `title="${isoToName(stream.language)}"`);

        this
            .addCommand('-f', 'hls')
            .addCommand('-hls_allow_cache', 1)
            .addCommand('-hls_flags', 'independent_segments')
            .addCommand('-hls_playlist_type', 'vod')
            .addCommand('-hls_segment_type', 'mpegts')
            .addCommand('-segment_time_delta', 1)
            .addCommand('-hls_list_size', '0')
            .addCommand('-segment_list_type', 'm3u8')
            .addCommand('-hls_time', this.segmentDuration)
            .addCommand('-hls_init_time', this.segmentDuration)
            .addCommand('-start_number', '0')
            .addCommand('-force_key_frames:v', '"expr:gte(t,n_forced*2)"')
            .addCommand('-use_wallclock_as_timestamps', 1)
            .addCommand('-hls_segment_filename', `audio_${stream.language}/audio_${stream.language}_%04d.ts`)
            // .addCommand('-master_pl_name', `audio_${stream.language}/audio_${stream.language}_temp.m3u8`)
            .addFile([`audio_${stream.language}/audio_${stream.language}.m3u8`]);

        return this;
    }

    // TODO:
    addSubtitleStream(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>) {

        const ext = this.getExtension(stream);
        const type = this.getSubType(stream);

        if (existsSync(this.getFile([`subtitles/${this.fileName}.${stream.language}.${type}.${ext}`]))) {
            return this;
        }

        this
            .addCommand('-map', `0:${stream.index}`)
            .addCommand('-c:s', 'webvtt');

        this
            .addFile([`subtitles/${this.fileName}.${stream.language}.${type}.${ext}`]);

        return this;
    }

    setThumbSize(w: number, h: number) {
        this.thumbSize = {
            w: w,
            h: h,
        };

        return this;
    }

    addThumbnailsStream() {

        if (existsSync(this.getFile(['sprite.webp']))) {
            return this;
        }

        this
            .addCommand('-c:v', 'mjpeg')
            .addVideoFilter('fps', 'fps=1/10')
            .addVideoFilters()
            .addCommand('-ss 1')
            .addCommand(`-s ${this.thumbSize.w}x${this.thumbSize.h}`)
            .addFile(['thumbs/thumb-%04d.jpg']);

        return this;
    }

    addStreamMap(arg: string) {
        this.streamMaps.push(arg);

        return this;
    }

    buildStreamMaps() {
        const result = this.streamMaps.join(' ');
        this.addCommand('-var_stream_map', `"${result}"`);

        return this;
    }

    buildMasterPlaylist() {

        const m3u8_content: string[] = [];

        m3u8_content.push('#EXTM3U');
        m3u8_content.push('#EXT-X-VERSION:6');

        for (const stream of this.audioStreams ?? []) {
            const arg: string[] = [];

            arg.push('#EXT-X-MEDIA:TYPE=AUDIO');
            arg.push('GROUP-ID="group_audio"');
            arg.push(`NAME="${isoToName(stream)}"`);
            arg.push(`DEFAULT=${this.defaultStream}`);
            arg.push('AUTOSELECT=YES');
            arg.push(`LANGUAGE="${stream}"`);
            arg.push(`URI="audio_${stream}/audio_${stream}.m3u8"`);

            m3u8_content.push(arg.join(','));

			this.defaultStream = 'NO';
        }

        for (const stream of this.videoStreams ?? []) {
            const arg: string[] = [];

            arg.push('#EXT-X-STREAM-INF:BANDWIDTH=140800');
            arg.push(`RESOLUTION=${stream}`);
            arg.push('CODECS="avc1.640028,mp4a.40.2"');
            arg.push('AUDIO="group_audio"');
            arg.push(`LABEL="${stream.split('x')[1]}P"`);
            m3u8_content.push(arg.join(','));

            m3u8_content.push(`video_${stream}/video_${stream}.m3u8`);
        }

        // console.log(this.manifestFile, m3u8_content);

		writeFileSync(this.manifestFile, m3u8_content.join('\n'));

        return this;
    }

    buildSprite() {

        if (existsSync(this.spriteFile)) {
            return this;
        }

        const interval = 10;

        const imageFiles = readdirSync(this.thumbnailsFolder).sort();

        if (imageFiles.length == 0) {
            return this;
        }

        const thumbWidth = this.thumbSize.w;
        const thumbHeight = this.thumbSize.h;

        const gridWidth = Math.ceil(Math.sqrt(imageFiles.length));
        const gridHeight = Math.ceil(imageFiles.length / gridWidth);

        const montageCommand = [
            `"${ffmpeg}"`,
            `-i "${`${this.thumbnailsFolder}/thumb-%04d.jpg`}"`,
            `-filter_complex tile="${gridWidth}x${gridHeight}"`,
            `-y "${this.spriteFile}"  2>&1`,
        ].join(' ');

        execSync(montageCommand, { maxBuffer: 1024 * 5000 });

        const times = createTimeInterval(this.format.duration, interval);

        let dst_x = 0;
        let dst_y = 0;

        let jpg = 1;
        const line = 1;

        const thumb_content: string[] = ['WEBVTT'];

        times.forEach((time, index) => {
            thumb_content.push(jpg.toString());
            thumb_content.push(`${time} --> ${times[index + 1]}`);
            thumb_content.push(`sprite.webp#xywh=${dst_x},${dst_y},${thumbWidth},${thumbHeight}`);
            thumb_content.push('');
            if (line <= gridHeight) {
                if (jpg % gridWidth == 0) {
                    dst_x = 0;
                    dst_y += thumbHeight;
                } else {
                    dst_x += thumbWidth;
                }
                jpg++;
            }
        });

        writeFileSync(this.previewFiles, thumb_content.join('\n'));

        existsSync(this.thumbnailsFolder) && rmSync(this.thumbnailsFolder, { recursive: true });

        return this;
    }

    check() {
        console.log(this);
        return this;
    }

    clear() {
        return new Store();
    }
}

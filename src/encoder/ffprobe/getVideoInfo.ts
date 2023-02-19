import { AppState, useSelector } from '../../state/redux';
import { ExecException, exec } from 'child_process';

import Logger from '../../functions/logger';
import { VideoFFprobe } from './ffprobe';
import { errorLog } from '../../state';
import fs from 'fs';
import { sortByPriorityKeyed } from '../../functions/stringArray';

export default (file: string): Promise<VideoFFprobe> => {
	return new Promise((resolve, reject) => {
		const preferredOrder = useSelector((state: AppState) => state.config.preferredOrder);

		Logger.log({
			level: 'verbose',
			name: 'Encoder',
			color: 'cyanBright',
			message: `Getting file info from: ${file}`,
		});

		exec(`ffprobe -v quiet -show_format -show_streams -show_chapters -print_format json "${file}"`,
			async (error: ExecException | null, stdout: string, stderr: string) => {

				if (error || !stdout) {
					fs.appendFileSync(errorLog, `${(error ?? stderr)?.toString().replace(/[\w\s\d\W\D\S\n\r]*\n/u, '')}\n`);
					reject(error);
				}
				if (error || stderr) reject(error ?? stderr);

				const videoInfo = JSON.parse(stdout.toString());

				const video: any[] = [];
				const audio: any[] = [];
				const subtitle: any[] = [];
				let format: any;
				const chapters: any[] = [];
				const attachments: any[] = [];

				await Promise.all([
					videoInfo?.streams?.map((stream) => {
						if (stream.codec_name !== 'mjpeg' && stream.codec_type == 'video') {
							video.push({
								index: stream.index,
								codec_name: stream.codec_name,
								codec_long_name: stream.codec_long_name,
								profile: stream.profile,
								codec_type: stream.codec_type,
								width: stream.width,
								height: stream.height,
								coded_width: stream.coded_width,
								coded_height: stream.coded_height,
								has_b_frames: stream.has_b_frames,
								sample_aspect_ratio: stream.sample_aspect_ratio,
								display_aspect_ratio: stream.display_aspect_ratio,
								pix_fmt: stream.pix_fmt,
								level: stream.level,
								color_range: stream.color_range,
								color_space: stream.color_space,
								color_transfer: stream.color_transfer,
								color_primaries: stream.color_primaries,
								chroma_location: stream.chroma_location,
								field_order: stream.field_order,
								refs: stream.refs,
								is_avc: stream.is_avc,
								nal_length_size: stream.nal_length_size,
								r_frame_rate: stream.r_frame_rate,
								avg_frame_rate: stream.avg_frame_rate,
								time_base: stream.time_base,
								bits_per_raw_sample: stream.bits_per_raw_sample,
								size: stream.tags?.[`NUMBER_OF_BYTES-${stream.tags?.language || 'eng'}`],
								bit_rate: stream.bit_rate,
								language: stream.tags?.language,
								hdr: stream.color_space?.includes('bt2020') || stream.color_primaries?.includes('bt2020'),
							});
						}
						if (stream.codec_type == 'audio') {
							audio.push({
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
								dmix_mode: stream.dmix_mode,
								ltrt_cmixlev: stream.ltrt_cmixlev,
								ltrt_surmixlev: stream.ltrt_surmixlev,
								loro_cmixlev: stream.loro_cmixlev,
								loro_surmixlev: stream.loro_surmixlev,
								time_base: stream.time_base,
								bit_rate: stream.bit_rate,
								size: stream.tags?.[`NUMBER_OF_BYTES-${stream.tags?.language || 'eng'}`],
								language: stream.tags?.language?.replace('fra', 'fre') || 'und',
								title: stream.tags?.title,
							});
						}
						if (stream.codec_type == 'subtitle') {
							subtitle.push({
								index: stream.index,
								codec_name: stream.codec_name,
								codec_long_name: stream.codec_long_name,
								codec_type: stream.codec_type,
								codec_time_base: stream.codec_time_base,
								codec_tag_string: stream.codec_tag_string,
								codec_tag: stream.codec_tag,
								time_base: stream.time_base,
								size: stream.tags?.[`NUMBER_OF_BYTES-${stream.tags?.language || 'eng'}`],
								language: stream.tags?.language,
								title: stream.tags?.title,
							});
						}
						if (stream.codec_type == 'attachment') {
							attachments.push({
								index: stream.index,
								codec_name: stream.codec_name,
								codec_long_name: stream.codec_long_name,
								codec_type: stream.codec_type,
								codec_time_base: stream.codec_time_base,
								codec_tag_string: stream.codec_tag_string,
								codec_tag: stream.codec_tag,
								time_base: stream.time_base,
								filename: stream.tags?.filename,
								mimetype: stream.tags?.mimetype,
							});
						}
					}) ?? [],
					videoInfo?.chapters?.map((chapter, index) => {
						chapters.push({
							index: index,
							title: chapter['TAG:title'],
							start_time: chapter.start_time,
							end_time: chapter.end_time,
						});
					}) ?? [],
					(format = {
						filename: videoInfo?.format?.filename,
						nb_streams: videoInfo?.format?.nb_streams,
						nb_programs: videoInfo?.format?.nb_programs,
						format_name: videoInfo?.format?.format_name,
						format_long_name: videoInfo?.format?.format_long_name,
						start_time: videoInfo?.format?.start_time,
						duration: videoInfo?.format?.duration,
						size: videoInfo?.format?.size,
						bit_rate: videoInfo?.format?.bit_rate,
						probe_score: videoInfo?.format?.probe_score,
						title: videoInfo?.format?.tags?.title,
						encoder: videoInfo?.format?.tags?.encoder,
						creation_time: videoInfo?.format?.tags?.creation_time,
					}),
				]);

				if (video.length == 0 && !file?.includes('audio')) {
					fs.appendFileSync(errorLog, `${file} has no video stream\n`);
					// eslint-disable-next-line prefer-promise-reject-errors
					reject(`${file} has no video stream`);
				}

				const sortFn: any = sortByPriorityKeyed(preferredOrder, 'language');

				resolve({
					streams: {
						video,
						audio: audio.sort(sortFn),
						subtitle,
						attachments,
					},
					format,
					chapters,
				});
			});
	});
};

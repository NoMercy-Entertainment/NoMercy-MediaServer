import { getDecoderOptions, getEncoderOptions } from './ffcheck';

describe('ffmpeg codecs', () => {
	test('ffmpeg has h264 decoders', () => {
		const encoderOptions = getDecoderOptions('video', ['h264']);
		expect(encoderOptions[0]).toHaveProperty('h264');
		expect(encoderOptions[1]).toHaveProperty('h264_qsv');
		expect(encoderOptions[2]).toHaveProperty('h264_cuvid');
	});
	test('ffmpeg has h264 encoders', () => {
		const encoderOptions = getEncoderOptions('video', ['h264']);
		expect(encoderOptions[0]).toHaveProperty('libx264');
		expect(encoderOptions[4]).toHaveProperty('h264_nvenc');
		expect(encoderOptions[5]).toHaveProperty('h264_qsv');
	});

	test('ffmpeg has h265 decoders', () => {
		const encoderOptions = getDecoderOptions('video', ['hevc']);
		expect(encoderOptions[0]).toHaveProperty('hevc');
		expect(encoderOptions[1]).toHaveProperty('hevc_qsv');
		expect(encoderOptions[2]).toHaveProperty('hevc_cuvid');
	});
	test('ffmpeg has h265 encoders', () => {
		const encoderOptions = getEncoderOptions('video', ['hevc']);
		expect(encoderOptions[0]).toHaveProperty('libx265');
		expect(encoderOptions[3]).toHaveProperty('hevc_nvenc');
		expect(encoderOptions[4]).toHaveProperty('hevc_qsv');
	});

	test('ffmpeg has vp9 decoders', () => {
		const encoderOptions = getDecoderOptions('video', ['vp9']);
		expect(encoderOptions[0]).toHaveProperty('vp9');
		expect(encoderOptions[1]).toHaveProperty('libvpx-vp9');
		expect(encoderOptions[2]).toHaveProperty('vp9_cuvid');
		expect(encoderOptions[3]).toHaveProperty('vp9_qsv');
	});
	test('ffmpeg has vp9 encoders', () => {
		const encoderOptions = getEncoderOptions('video', ['vp9']);
		expect(encoderOptions[0]).toHaveProperty('libvpx-vp9');
		expect(encoderOptions[1]).toHaveProperty('vp9_qsv');
	});

	test('ffmpeg has webp encoders', () => {
		const encoderOptions = getEncoderOptions('video', ['webp']);
		expect(encoderOptions[0]).toHaveProperty('libwebp_anim');
		expect(encoderOptions[1]).toHaveProperty('libwebp');
	});

	test('ffmpeg has aac decoders', () => {
		const encoderOptions = getDecoderOptions('audio', ['aac']);
		expect(encoderOptions[0]).toHaveProperty('aac');
		expect(encoderOptions[2]).toHaveProperty('libfdk_aac');
	});
	test('ffmpeg has aac encoders', () => {
		const encoderOptions = getEncoderOptions('audio', ['aac']);
		expect(encoderOptions[0]).toHaveProperty('aac');
		expect(encoderOptions[1]).toHaveProperty('libfdk_aac');
	});

	test('ffmpeg has ac3 decoders', () => {
		const encoderOptions = getDecoderOptions('audio', ['ac3']);
		expect(encoderOptions[0]).toHaveProperty('ac3');
		expect(encoderOptions[6]).toHaveProperty('eac3');
	});
	test('ffmpeg has ac3 encoders', () => {
		const encoderOptions = getEncoderOptions('audio', ['ac3']);
		expect(encoderOptions[0]).toHaveProperty('ac3');
		expect(encoderOptions[3]).toHaveProperty('eac3');
	});

	test('ffmpeg has vorbis decoders', () => {
		const encoderOptions = getDecoderOptions('audio', ['vorbis']);
		expect(encoderOptions[0]).toHaveProperty('vorbis');
		expect(encoderOptions[1]).toHaveProperty('libvorbis');
	});
	test('ffmpeg has vorbis encoders', () => {
		const encoderOptions = getEncoderOptions('audio', ['vorbis']);
		expect(encoderOptions[0]).toHaveProperty('vorbis');
		expect(encoderOptions[1]).toHaveProperty('libvorbis');
	});

	test('ffmpeg has ac3 decoders', () => {
		const encoderOptions = getDecoderOptions('subtitle', ['webvtt', 'ass', 'srt', 'sub']);
		expect(encoderOptions[0]).toHaveProperty('ssa');
		expect(encoderOptions[1]).toHaveProperty('ass');
		expect(encoderOptions[2]).toHaveProperty('dvbsub');
		expect(encoderOptions[3]).toHaveProperty('dvdsub');
		expect(encoderOptions[4]).toHaveProperty('pgssub');
		expect(encoderOptions[7]).toHaveProperty('mov_text');
		expect(encoderOptions[13]).toHaveProperty('srt');
		expect(encoderOptions[14]).toHaveProperty('subrip');
		expect(encoderOptions[19]).toHaveProperty('webvtt');
	});
	test('ffmpeg has ac3 encoders', () => {
		const encoderOptions = getEncoderOptions('subtitle', ['webvtt', 'ass', 'srt', 'sub']);
		expect(encoderOptions[0]).toHaveProperty('ssa');
		expect(encoderOptions[1]).toHaveProperty('ass');
		expect(encoderOptions[2]).toHaveProperty('dvbsub');
		expect(encoderOptions[3]).toHaveProperty('dvdsub');
		expect(encoderOptions[4]).toHaveProperty('mov_text');
		expect(encoderOptions[5]).toHaveProperty('srt');
		expect(encoderOptions[6]).toHaveProperty('subrip');
		expect(encoderOptions[9]).toHaveProperty('webvtt');
	});

	test('ffmpeg test all', () => {
		const encoderOptions = getDecoderOptions();
		expect(encoderOptions[0]).toHaveProperty('012v');
	});
});

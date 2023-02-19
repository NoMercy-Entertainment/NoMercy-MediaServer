const mp3CodecExp = /\b(?<mp3>(LAME(?:\d)+-?(?:\d)+)|(mp3))\b/iu;
const mp2CodecExp = /\b(?<mp2>(mp2))\b/iu;
const dolbyCodecExp = /\b(?<dolby>(Dolby)|(Dolby-?Digital)|(DD)|(AC3D?))\b/iu;
const dolbyAtmosCodecExp = /\b(?<dolbyatmos>(Dolby-?Atmos))\b/iu;
const aacAtmosCodecExp = /\b(?<aac>(AAC))(\d?.?\d?)(ch)?\b/iu;
const eac3CodecExp = /\b(?<eac3>(EAC3|DDP|DD\+))\b/iu;
const flacCodecExp = /\b(?<flac>(FLAC))\b/iu;
const dtsCodecExp = /\b(?<dts>(DTS))\b/iu;
const dtsHdCodecExp = /\b(?<dtshd>(DTS-?HD)|(DTS(?=-?MA)|(DTS-X)))\b/iu;
const trueHdCodecExp = /\b(?<truehd>(True-?HD))\b/iu;
const opusCodecExp = /\b(?<opus>(Opus))\b/iu;
const vorbisCodecExp = /\b(?<vorbis>(Vorbis))\b/iu;
const pcmCodecExp = /\b(?<pcm>(PCM))\b/iu;
const lpcmCodecExp = /\b(?<lpcm>(LPCM))\b/iu;

const audioCodecExp = new RegExp(
	[
		mp3CodecExp.source,
		mp2CodecExp.source,
		dolbyCodecExp.source,
		dolbyAtmosCodecExp.source,
		aacAtmosCodecExp.source,
		eac3CodecExp.source,
		flacCodecExp.source,
		dtsHdCodecExp.source,
		dtsCodecExp.source,
		trueHdCodecExp.source,
		opusCodecExp.source,
		vorbisCodecExp.source,
		pcmCodecExp.source,
		lpcmCodecExp.source,
	].join('|'),
	'iu'
);

export enum AudioCodec {
  MP3 = 'MP3',
  MP2 = 'MP2',
  DOLBY = 'Dolby Digital',
  EAC3 = 'Dolby Digital Plus',
  AAC = 'AAC',
  FLAC = 'FLAC',
  DTS = 'DTS',
  DTSHD = 'DTS-HD',
  TRUEHD = 'Dolby TrueHD',
  OPUS = 'Opus',
  VORBIS = 'Vorbis',
  PCM = 'PCM',
  LPCM = 'LPCM',
}

export function parseAudioCodec(title: string): { codec?: AudioCodec; source?: string } {
	const audioResult = audioCodecExp.exec(title);
	if (!audioResult || !audioResult.groups) {
		return {};
	}

	const { groups } = audioResult;

	if (groups.aac) {
		return { codec: AudioCodec.AAC, source: groups.aac };
	}

	if (groups.dolbyatmos) {
		return { codec: AudioCodec.EAC3, source: groups.dolbyatmos };
	}

	if (groups.dolby) {
		return { codec: AudioCodec.DOLBY, source: groups.dolby };
	}

	if (groups.dtshd) {
		return { codec: AudioCodec.DTSHD, source: groups.dtshd };
	}

	if (groups.dts) {
		return { codec: AudioCodec.DTS, source: groups.dts };
	}

	if (groups.flac) {
		return { codec: AudioCodec.FLAC, source: groups.flac };
	}

	if (groups.truehd) {
		return { codec: AudioCodec.TRUEHD, source: groups.truehd };
	}

	if (groups.mp3) {
		return { codec: AudioCodec.MP3, source: groups.mp3 };
	}

	if (groups.mp2) {
		return { codec: AudioCodec.MP2, source: groups.mp2 };
	}

	if (groups.pcm) {
		return { codec: AudioCodec.PCM, source: groups.pcm };
	}

	if (groups.lpcm) {
		return { codec: AudioCodec.LPCM, source: groups.lpcm };
	}

	if (groups.opus) {
		return { codec: AudioCodec.OPUS, source: groups.opus };
	}

	if (groups.vorbis) {
		return { codec: AudioCodec.VORBIS, source: groups.vorbis };
	}

	return {};
}

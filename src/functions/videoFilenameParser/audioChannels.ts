const eightChannelExp = /\b(?<eight>7.?[01])\b/iu;
const sixChannelExp
  = /\b(?<six>(6[\W]0(?:ch)?)(?=[^\d]|$)|(5[\W][01](?:ch)?)(?=[^\d]|$)|5ch|6ch)\b/iu;
const stereoChannelExp = /(?<stereo>((2[\W]0(?:ch)?)(?=[^\d]|$))|(stereo))/iu;
const monoChannelExp = /(?<mono>(1[\W]0(?:ch)?)(?=[^\\d]|$)|(mono)|(1ch))/iu;

const channelExp = new RegExp(
	[
		eightChannelExp.source,
		sixChannelExp.source,
		stereoChannelExp.source,
		monoChannelExp.source,
	].join('|'),
	'iu'
);

export enum Channels {
  SEVEN = '7.1',
  SIX = '5.1',
  STEREO = 'stereo',
  MONO = 'mono',
}

export function parseAudioChannels(title: string): { channels?: Channels; source?: string } {
	const channelResult = channelExp.exec(title);
	if (!channelResult || !channelResult.groups) {
		return {};
	}

	const { groups } = channelResult;

	if (groups.eight) {
		return { channels: Channels.SEVEN, source: groups.eight };
	}

	if (groups.six) {
		return { channels: Channels.SIX, source: groups.six };
	}

	if (groups.stereo) {
		return { channels: Channels.STEREO, source: groups.stereo };
	}

	if (groups.mono) {
		return { channels: Channels.MONO, source: groups.mono };
	}

	return {};
}

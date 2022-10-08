/* eslint-disable no-negated-condition */
import { execSync } from 'child_process';

const getEveryNth = <T>(arr: T[], nth: number) => {
	const result: T[] = [];
	for (let i = 0; i < arr.length; i += nth) {
		result.push(arr[i]);
	}
	return result;
};

export interface getAvailableCodecOptions {
	[x: string]: {
		codec: string;
		type: string;
		description: string;
		command: string;
		arg_type: string | null;
		arg_description: string | null;
		args: Array<string>;
	}[];
}

export const getAvailableCodecOptions = (argument = 'encoder', encoder: CodecInfo, max = 1): getAvailableCodecOptions => {
	let reg = '';

	for (let j = 0; j < max; j++) {
		reg += `((?<command_${j}>-[\\w_-]+)\\s+(?<valuetype_${j}><\\w+>)\\s+(?<desciption_${j}>.+)[\\n\\r])`;
		for (let i = 0; i < 30; i++) {
			reg += `(\\s+(?<argn${j}_${i}>[\\w\\d\\._-]+)\\s+(?<argv${j}_${i}>[\\d-]+)\\s+(?<argd${j}_${i}>.+)[\\n\\r]?)?`;
		}
	}

	const regex = new RegExp(reg, 'gu');

	const ffEncodercheck = execSync(`ffmpeg -hide_banner -h ${argument}=${encoder[argument]}`).toString();

	let m;

	const encoderOptions: Array<{
		codec: string;
		type: string;
		description: string;
		command: string;
		arg_type: string | null;
		arg_description: string | null;
		args: Array<string>;
	}> = new Array();

	if (!ffEncodercheck.match(regex)) {
		const matches = /(En|De)coder\s(?<command>[\w\d_-]+)\s\[(?<description>.+)\]/u.exec(ffEncodercheck);
		if (matches?.groups) {
			const [command] = Object.entries<string>(matches.groups);
			encoderOptions.push({
				codec: encoder[argument],
				type: encoder.type,
				description: encoder.description,
				command: command[1],
				arg_type: null,
				arg_description: null,
				args: [],
			});

			return {
				[encoder[argument]]: encoderOptions,
			};
		}
	}

	while ((m = regex.exec(ffEncodercheck)) !== null) {
		// if (m.index === regex.lastIndex) regex.lastIndex++;

		const [command, type, description, ...args] = Object.entries<string>(m.groups).filter((g) => g[1] != undefined);

		encoderOptions.push({
			codec: encoder[argument],
			type: encoder.type,
			description: encoder.description,
			command: command[1],
			arg_type: type[1].replace(/[<>]+/gu, ''),
			arg_description: description[1],
			args: getEveryNth(args, 3).map((a) => {
				return a[1];
			}),
		});
	}

	return {
		[encoder[argument]]: encoderOptions,
	};
};

export interface CodecInfo {
	type: string;
	frame: boolean;
	slice: boolean;
	experimental: boolean;
	draw: boolean;
	direct: boolean;
	description: string;
	encoder?: string;
	decoder?: string;
}

export const getCodecInfo = (argument = 'encoder', type: string | null = null, filter: string[] = []): CodecInfo[] => {
	const reg =
		'(?<type>[VAS])(?<frame>[F\\.])(?<slice>[S\\.])(?<experimental>[X\\.])(?<draw>[B\\.])(?<direct>[D\\.])\\s(?<encoder>[\\w-]+)\\s+(?<description>.+)';
	const regex = new RegExp(reg, 'gu');

	const ffcheck = execSync(`ffmpeg -hide_banner -${argument}s`).toString();

	const encoderOptions: Array<CodecInfo> = new Array();

	let m;
	while ((m = regex.exec(ffcheck)) !== null) {
		// if (m.index === regex.lastIndex) regex.lastIndex++;

		const [type, frame, slice, experimental, draw, direct, encoder, description] = Object.entries<any>(m.groups);

		encoderOptions.push({
			type: type[1] == 'V' ? 'video' : type[1] == 'A' ? 'audio' : 'subtitle',
			frame: frame[1] != '.' ? true : false,
			slice: slice[1] != '.' ? true : false,
			experimental: experimental[1] != '.' ? true : false,
			draw: draw[1] != '.' ? true : false,
			direct: direct[1] != '.' ? true : false,
			[argument]: encoder[1],
			description: description[1],
		});
	}

	const result = encoderOptions
		.filter((encoder) => (type != null ? encoder.type.toLocaleLowerCase() == (type as string).toLocaleLowerCase() : encoder.type != null))
		.filter((encoder) =>
			filter.length > 0
				? filter.some((f) => encoder[argument].toLocaleLowerCase().includes(f)) ||
				  filter.some((f) => encoder.description.toLocaleLowerCase().includes(f))
				: encoder.description != null
		);

	return result;
};

export const getEncoderOptions = (type: string | null = null, filter: string[] = []) => {
	return getCodecInfo('encoder', type, filter)
		.filter((encoder) => encoder.encoder != null)
		.map((encoder) => getAvailableCodecOptions('encoder', encoder))
		.filter((encoder) => Object.values(encoder)[0].length > 0);
};

export const getDecoderOptions = (type: string | null = null, filter: string[] = []) => {
	return getCodecInfo('decoder', type, filter)
		.filter((decoder) => decoder.decoder != null)
		.map((decoder) => getAvailableCodecOptions('decoder', decoder))
		.filter((decoder) => Object.values(decoder)[0].length > 0);
};

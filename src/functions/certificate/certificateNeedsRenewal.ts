/* eslint-disable */

import Logger from '@server/functions/logger';
import fs from 'fs';
import { URL } from 'url';

const TYPE_INTEGER = 0x02;
const TYPE_SEQUENCE = 0x10;
const TYPE_UTC_TIME = 0x17;
const TYPE_GENERALIZED_TIME = 0x18;

const subArray = (original: any, start: any, end: number) => {
	const subArr: any[] = [];
	let index = 0;
	for (let i = start; i < end; i++) {
		subArr[index++] = original[i];
	}
	return subArr;
};

const getDigit = (d: any) => {
	switch (d) {
		default:
		case 0x30:
		case '0':
			return 0;
		case 0x31:
		case '1':
			return 1;
		case 0x32:
		case '2':
			return 2;
		case 0x33:
		case '3':
			return 3;
		case 0x34:
		case '4':
			return 4;
		case 0x35:
		case '5':
			return 5;
		case 0x36:
		case '6':
			return 6;
		case 0x37:
		case '7':
			return 7;
		case 0x38:
		case '8':
			return 8;
		case 0x39:
		case '9':
			return 9;
	}
};

const enterTag = (bytes: string | any[], start: number, requiredTypes: number[], name: string) => {
	if (start + 1 > bytes.length) {
		throw new Error('Too short certificate input');
	}
	const typeByte = bytes[start] & 0x0ff;
	const lenByte = bytes[start + 1] & 0x0ff;

	const type = typeByte & 0x1f;
	let len = lenByte;

	let index = start + 2;
	if (requiredTypes.length > 0 && requiredTypes.indexOf(type) == -1) {
		throw new Error('Invalid type');
	}
	let lengthOfLength = 0;
	if (len > 0x07f) {
		lengthOfLength = len & 0x7f;
		len = 0;
		for (let i = 0; i < lengthOfLength && index < bytes.length; i++) {
			len = (len << 8) | (bytes[index] & 0x00ff);
			index++;
		}
	}
	if (index >= bytes.length) {
		throw new Error('Too short certificate input');
	}
	return { index: index, type: type, length: len };
};

const processTag = (bytes: string | any[], start: number, requiredTypes: number[], name: string) => {
	const result = enterTag(bytes, start, requiredTypes, name);

	const index = result.index + result.length;

	if (index >= bytes.length) {
		throw new Error('Too short certificate input');
	}
	const valueStart = result.index;
	const valueEnd = result.index + result.length;
	const value = subArray(bytes, valueStart, valueEnd);
	return {
		index: index,
		type: result.type,
		value: value,
	};
};

const readDate = (bytes: any, start: number, name: string) => {
	const date = new Date();
	const result = processTag(bytes, start, [TYPE_UTC_TIME, TYPE_GENERALIZED_TIME], name);
	let index: number;
	let year: number;
	if (result.type == 0x17) {
		// UTCTime
		if (result.value.length < 12) {
			throw new Error('Invalid type');
		}
		const yearHigh = getDigit(result.value[0]);
		const yearLow = getDigit(result.value[1]);
		const year2Digits = yearHigh * 10 + yearLow;
		if (year2Digits >= 50) {
			year = 1900 + year2Digits;
		} else {
			year = 2000 + year2Digits;
		}
		index = 2;
	} else if ((result.type = 0x18)) {
		// GeneralizedTime
		if (result.value.length < 14) {
			throw new Error('Invalid type');
		}
		const year1 = getDigit(result.value[0]);
		const year2 = getDigit(result.value[1]);
		const year3 = getDigit(result.value[2]);
		const year4 = getDigit(result.value[3]);
		year = year1 * 1000 + year2 * 100 + year3 * 10 + year4;
		index = 4;
	}
	// @ts-ignore
	const monthHigh = getDigit(result.value[index++]);
	// @ts-ignore
	const monthLow = getDigit(result.value[index++]);
	// @ts-ignore
	const dayHigh = getDigit(result.value[index++]);
	// @ts-ignore
	const dayhLow = getDigit(result.value[index++]);
	// @ts-ignore
	const hourHigh = getDigit(result.value[index++]);
	// @ts-ignore
	const hourLow = getDigit(result.value[index++]);
	// @ts-ignore
	const minuteHigh = getDigit(result.value[index++]);
	// @ts-ignore
	const minuteLow = getDigit(result.value[index++]);
	// @ts-ignore
	const secondHigh = getDigit(result.value[index++]);
	// @ts-ignore
	const secondLow = getDigit(result.value[index]);

	const month = monthHigh * 10 + monthLow;
	const day = dayHigh * 10 + dayhLow;
	const hour = hourHigh * 10 + hourLow;
	const minute = minuteHigh * 10 + minuteLow;
	const second = secondHigh * 10 + secondLow;

	if (month < 1 || month > 12) {
		throw new Error('Invalid month');
	}
	if (day < 1 || day > 31) {
		throw new Error('Invalid day');
	}
	if (hour < 0 || hour > 24) {
		throw new Error('Invalid hour');
	}
	if (minute < 0 || minute > 59) {
		throw new Error('Invalid minute');
	}
	if (second < 0 || second > 59) {
		throw new Error('Invalid second ');
	}

	// @ts-ignore
	date.setUTCFullYear(year);
	date.setUTCMonth(month - 1);
	date.setUTCDate(day);
	date.setUTCHours(hour);
	date.setUTCMinutes(minute);
	date.setUTCSeconds(second);

	return {
		index: result.index,
		type: result.type,
		// length: result.length,
		value: result.value,
		date: date,
	};
};

const getValidity = (bytes: string | any[] | null) => {
	if (bytes == null || bytes.length <= 0) {
		return null;
	}
	let index = 0;
	index = enterTag(bytes, index, [TYPE_SEQUENCE], 'Certificate').index;
	index = enterTag(bytes, index, [TYPE_SEQUENCE], 'TBSCertificate').index;
	let result: any = processTag(bytes, index, [0x00, 0x02], 'Version or SerialNumber');
	if (result.type == 0) {
		index = result.index;
		result = processTag(bytes, index, [TYPE_INTEGER], 'SerialNumber');
	}
	index = result.index;
	result = processTag(bytes, index, [TYPE_SEQUENCE], 'Signature AlgorithmIdentifier');
	index = result.index;
	result = processTag(bytes, index, [], 'Issuer Name');
	index = result.index;
	index = enterTag(bytes, index, [TYPE_SEQUENCE], 'Validity').index;
	result = readDate(bytes, index, 'Not Before');
	const notBefore = result.date;
	index = result.index;
	result = readDate(bytes, index, 'Not After');
	const notAfter = result.date;

	return { notBefore: notBefore, notAfter: notAfter };
};

const getNextBase64Chr = (str: any, index: number, equalSignReceived: boolean, alpha: string | null[]) => {
	let chr: any = null;
	let code = 0;
	let padding = equalSignReceived;
	while (index < str.length) {
		chr = str.charAt(index);
		if (chr == ' ' || chr == '\r' || chr == '\n' || chr == '\t') {
			index += 1;
			continue;
		}
		if (chr == '=') {
			padding = true;
		} else {
			if (equalSignReceived) {
				throw new Error('Invalid Base64 Endcoding.');
			}
			// @ts-ignore
			code = alpha.indexOf(chr);
			if (code == -1) {
				throw new Error('Invalid Base64 Encoding .');
			}
		}
		break;
	}
	return { character: chr, code: code, padding: padding, nextIndex: ++index };
};

const fromBase64 = (str: string | any[]) => {
	const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	const value: any[] = [];
	let index = 0;
	let destIndex = 0;
	let padding = false;
	while (true) {
		const first = getNextBase64Chr(str, index, padding, alpha);
		const second = getNextBase64Chr(str, first.nextIndex, first.padding, alpha);
		const third = getNextBase64Chr(str, second.nextIndex, second.padding, alpha);
		const fourth = getNextBase64Chr(str, third.nextIndex, third.padding, alpha);

		index = fourth.nextIndex;
		padding = fourth.padding;

		// ffffffss sssstttt ttffffff
		const base64_first = first.code == null ? 0 : first.code;
		const base64_second = second.code == null ? 0 : second.code;
		const base64_third = third.code == null ? 0 : third.code;
		const base64_fourth = fourth.code == null ? 0 : fourth.code;

		const a = ((base64_first << 2) & 0xfc) | ((base64_second >> 4) & 0x03);
		const b = ((base64_second << 4) & 0xf0) | ((base64_third >> 2) & 0x0f);
		const c = ((base64_third << 6) & 0xc0) | ((base64_fourth >> 0) & 0x3f);

		value[destIndex++] = a;
		if (!third.padding) {
			value[destIndex++] = b;
		} else {
			break;
		}
		if (!fourth.padding) {
			value[destIndex++] = c;
		} else {
			break;
		}
		if (index >= str.length) {
			break;
		}
	}
	return value;
};

export default (cert: string | Buffer | URL) => {
	if (fs.existsSync(cert)) {
		const contents = fs
			.readFileSync(cert, 'utf8')
			.match(/-----BEGIN CERTIFICATE-----\n(?<match>(.*\n.*)*)\n-----END CERTIFICATE-----\n/g)!
			.map((c) => c.replace(/-----BEGIN CERTIFICATE-----\n/gu, '').replace(/[\n\r]{1,2}-----END CERTIFICATE-----/gu, ''));
		// .map(c => c.split("\n").filter(s => !s.includes('CERTIFICATE') && !s.includes('CERTIFICATE')).join("\n"));

		const ceritifcates = contents.map((c) => {
			const bytes = fromBase64(c);

			const validity = getValidity(bytes);
			const notBefore = validity!.notBefore;
			const notAfter = validity!.notAfter;

			const now = new Date();

			if (notBefore.getTime() < now.getTime() && now.getTime() < notAfter.getTime()) {
				Logger.log({
					level: 'verbose',
					name: 'setup',
					color: 'blueBright',
					message: `Certificate is ${Math.floor((notAfter.getTime() - Date.now()) / 1000 / 60 / 60 / 24)} days valid`,
				});
				return Math.floor((notAfter.getTime() - Date.now()) / 1000 / 60 / 60 / 24) < 10;
			}
			Logger.log({
				level: 'info',
				name: 'setup',
				color: 'red',
				message: 'Certificate has expired',
			});
			return true;
		});
		return ceritifcates.find((c) => c);
	}
	return true;
};

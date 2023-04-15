import { createCanvas, loadImage } from '@napi-rs/canvas';

import { encode } from 'blurhash';

const createBlurHash = async (imageUrl: string | Buffer) => {
	const image = await loadImage(imageUrl);

	const canvas = createCanvas(image.width, image.height);
	const context = canvas.getContext('2d');
	context.drawImage(image, 0, 0);

	const imageData = context.getImageData(0, 0, image.width, image.height);

	return encode(imageData.data, imageData.width, imageData.height, 4, 4);
};

export default createBlurHash;


const digitCharacters = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
	'#',
	'$',
	'%',
	'*',
	'+',
	',',
	'-',
	'.',
	':',
	';',
	'=',
	'?',
	'@',
	'[',
	']',
	'^',
	'_',
	'{',
	'|',
	'}',
	'~',
];

export const decode83 = (str: string) => {
	let value = 0;
	for (let i = 0; i < str.length; i++) {
		const c = str[i];
		const digit = digitCharacters.indexOf(c);
		value = value * 83 + digit;
	}
	return value;
};

export const makeId = (length: number) => {
	let result = '';
	const characters = '1234567890';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return parseInt(result, 10);
};

export const generateBlurHash = () => {
	const number = Math.ceil(Math.random() * 265);
	const n = makeId(number);

	let result = '';
	for (let i = 1; i <= (number * 1024); i++) {
		const digit = (Math.floor(n) / 83 ** ((number / 128) - i)) % 83;
		result += digitCharacters[Math.floor(digit)];
	}

	const sizeFlag = decode83(result[0]);
	const numY = Math.floor(sizeFlag / 9) + 1;
	const numX = (sizeFlag % 9) + 1;

	return result.slice(0, 4 + 2 * numX * numY);
};

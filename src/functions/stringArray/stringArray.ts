import { Certification } from '@server/db/media/actions/certifications';
import crypto from 'crypto';
import hexToUuid from 'hex-to-uuid';

/* eslint-disable no-extend-native */
export const breakLogoTitle = (str: string, characters = [':', '!', '?']) => {
	if (!str) {
		return '';
	}

	if (str.split('').some((l: string) => characters.includes(l))) {
		const reg = new RegExp(characters.map(l => (l == '?'
			? `\\${l}`
			: l)).join('|'), 'u');
		const reg2 = new RegExp(characters.map(l => (l == '?'
			? `\\${l}\\s`
			: `${l}\\s`)).join('|'), 'u');
		if (reg && reg2 && str.match(reg2)) {
			return str.replace(
				(str.match(reg2) as any)[0],
				`${(str.match(reg) as any)[0]}\n`
			);
		}
	}

	return str;
};

/**
 * * Create Enum from an array of values.
 * @param {Array} array Array
 */
export const createEnumFromArray = (array: any[]) => {
	return array.reduce(
		(res: { [x: string]: any }, key: string | number, index: number) => {
			res[key] = index + 1;
			return res;
		},
		{}
	);
};

export const copyToClipboard = (text: string): void => {
	navigator.clipboard?.writeText(text).then(
		() => {
			return true;
		},
		() => {
			return false;
		}
	);
};

export const find_most = (array: Array<number>): number => {
	return array.reduce(
		(a: number, b: number, _i, arr: any[]) =>
			(arr.filter(v => v === a).length >= arr.filter(v => v === b).length
				? a
				: b),
		array[0]
	);
};

export const formatDuration = (value: number): string => {
	const minute = Math.floor(value / 60);
	const secondLeft = Math.floor(value - minute * 60);
	return `${pad(minute, 1)}:${pad(secondLeft, 2)}`;
};

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
export const generateRandomString = (length: number): string => {
	let text = '';
	const possible
		= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const mappedEntries = <O>(input: O) => {
	return Object.entries(input as any) as Entries<O>;
};

/**
 * * Group Array of objects by key.
 * * Sort by key (optional)
 * @param {Array} array Array
 * @param {string} key Group key
 * @param {string} key Sort key
 */
export const groupBy = <T>(array: T[], key: string) => {
	const list: {[key: string]: T[]} = {};

	array.map((element: any) => {
		list[element[key]] = array.filter((el: any) => el[key] == element[key]);
	});

	return list;
};

export const hash = (string: string) => {
	const self = string;
	const range = Array(string.length);
	for (let i = 0; i < string.length; i++) {
		range[i] = i;
	}
	return Array.prototype.map
		.call(range, i => self.charCodeAt(i).toString(16))
		.join('');
};

export const isJsonString = (str: string) => {
	try {
		JSON.parse(str);
	} catch (error) {
		return false;
	}
	return true;
};

export const isValidObject = (str: any) => {
	return str.length > 0 && typeof str === 'object';
};

export const limitSentenceByCharacters = (
	str: string,
	characters = 360
): string => {
	if (!str) {
		return '';
	}
	const arr: any = str.substring(0, characters).split('.');
	arr.pop(arr.length);
	return `${arr.join('.')}.`;
};

export const lineBreakLongTitle = (str: string, characters = 45) => {
	if (!str) {
		return '';
	}
	const ep = str.match(/S\d{2}E\d{2}/u);

	if (ep && str.length > characters) {
		const arr = str.split(/\sS\d{2}E\d{2}\s/u);

		return `${arr[0]} \n${ep[0]} ${arr[1]}`;
	}

	return str;
};

export const lineBreakShowTitle = (str: string, removeShow = false) => {
	if (!str) {
		return '';
	}
	const ep = str.match(/S\d{2}E\d{2}/u);

	if (ep) {
		const arr = str.split(/\sS\d{2}E\d{2}\s/u);
		if (removeShow) {
			return `${ep[0]} ${arr[1]}`;
		}
		return `${arr[0]} \n${ep[0]} ${arr[1]}`;
	}

	return str;
};

export const pad = (number: string | number, places = 2): string => {
	if (typeof number !== 'undefined') {
		const zero = places - number.toString().length + 1;

		return Array(+(zero > 0 && zero)).join('0') + number;
	}
	return '';
};

/**
 * * Shuffle array,
 * @param {Array} array Array
 */
export const shuffle = <T>(array: Array<T>): Array<T> => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

/**
 * * SortCallback.
 * ** Deprecated,
 * Use "sort_updated" with direction
 */
export const sort_updated_asc = (
	a: Record<string, string | number | Date>,
	b: Record<string, string | number | Date>
) => {
	const keyA = new Date(a.updated_at);
	const keyB = new Date(b.updated_at);
	if (keyA > keyB) {
		return -1;
	}
	if (keyA < keyB) {
		return 1;
	}
	return 0;
};

/**
 * * SortCallback.
 * ** Deprecated,
 * Use "sort_updated" with direction
 */
export const sort_updated_desc = (
	a: Record<string, string | number | Date>,
	b: Record<string, string | number | Date>
) => {
	const keyA = new Date(a.updated_at);
	const keyB = new Date(b.updated_at);
	if (keyA < keyB) {
		return -1;
	}
	if (keyA > keyB) {
		return 1;
	}
	return 0;
};

export const sortBy = <T>(
	arr: T[],
	key: string,
	direction = 'asc',
	subKey = ''
) => {
	return arr.sort((a: any, b: any) => {
		let x: typeof a;
		let y: typeof b;
		if (direction == 'desc') {
			x = subKey
				? b[key]?.[subKey]
				: b[key];
			y = subKey
				? a[key]?.[subKey]
				: a[key];
		} else {
			x = subKey
				? a[key]?.[subKey]
				: a[key];
			y = subKey
				? b[key]?.[subKey]
				: b[key];
		}
		return x < y
			? -1
			: x > y
				? 1
				: 0;
	});
};

/**
 * * SortCallback.
 * * Sort Array of objects by a priority list.
 * @param {Array} array Array
 * @param {Array} sortingOrder Sorting Order
 * @param {string} key Sort key
 * @param {string} key Sort direction
 */
export const sortByPriorityKeyed = (sortingOrder: { [x: string]: any; }, key: PropertyKey, order = 'desc') => {
	if (Array.isArray(sortingOrder)) {
		sortingOrder = createEnumFromArray(sortingOrder);
	}
	return function (a: string, b: string): number {
		// eslint-disable-next-line no-prototype-builtins
		if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
			return 0;
		}

		if (!a[key]) {
			return 0;
		}

		const first
			= a[key].toString().toLowerCase() in sortingOrder
				? sortingOrder[a[key]]
				: Number.MAX_SAFE_INTEGER;
		const second
			= b[key].toString().toLowerCase() in sortingOrder
				? sortingOrder[b[key]]
				: Number.MAX_SAFE_INTEGER;

		let result = 0;
		if (first > second) {
			result = -1;
		} else if (first < second) {
			result = 1;
		}
		return order === 'desc'
			? ~result
			: result;
	};
};

export const sortByType = <T>(
	itemList: T[],
	sortType: string,
	sortOrder: string,
	setSortOrder: (val: string) => string
): any[] => {
	if (sortType == 'name') {
		if (!sortOrder) {
			setSortOrder('asc');
		}
		return sortBy(itemList, 'name', sortOrder);
	}
	if (sortType == 'artist') {
		if (!sortOrder) {
			setSortOrder('asc');
		}
		return sortBy(itemList, 'artist', sortOrder, 'name');
	}
	if (sortType == 'album') {
		if (!sortOrder) {
			setSortOrder('asc');
		}
		return sortBy(itemList, 'album', sortOrder, 'name');
	}
	if (sortType == 'date') {
		if (!sortOrder) {
			setSortOrder('desc');
		}
		return sortBy(itemList, 'date', sortOrder || 'desc');
	}
	if (sortType == 'duration') {
		if (!sortOrder) {
			setSortOrder('desc');
		}
		return sortBy(itemList, 'duration', sortOrder || 'desc');
	}

	return sortBy(itemList, 'id', 'asc');
};

export const ucfirst = (str: string): string => {
	const firstLetter = str.substr(0, 1);
	return firstLetter.toUpperCase() + str.substr(1);
};

/**
 * * Return only unique objects by key,
 * @param {Array} array Array
 * @param {string} key Unique key
 */
export const unique = <T>(array: T[], key: string): T[] => {
	if (!array || !Array.isArray(array)) {
		return [];
	}

	return array.filter(
		(obj: any, pos, arr) =>
			arr.map((mapObj: any) => mapObj[key]).indexOf(obj[key]) === pos
	);
};

/**
 * * Return only unique objects by key,
 * @param {string} value
 * @param {string} index
 * @param {string} self
 */
export const distinct = (value: any, index: any, self: string | any[]) => {
	return self.indexOf(value) === index;
};

/**
 * * FilterCallback.
 */
export const Unique = (value: any, index: any, self: string | any[]) => {
	return self.indexOf(value) === index;
};

/**
 * * Generate a random string.
 * * returns only aphanumeric characters.
 * @param {number} length Lenght
 */
export const random_string = (length: number) => {
	let result = '';
	const characters
		= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

/**
 * * Group Array of objects by key,
 * * Sort by key (optional),
 * @param {Array} array Array
 * @param {string} key Group key
 * @param {string} key Sort key
 */
export const sortByPriority = (arr: any[], preferredOrder: string | any[]) => {
	const result: any[] = [];
	let i: number;
	let j: any;
	for (i = 0; i < preferredOrder.length; i++) {
		while ((j = arr.indexOf(preferredOrder[i])) != -1) {
			result.push(arr.splice(j, 1)[0]);
		}
	}
	return result.concat(arr);
};

/**
 * * SortCallback.
 * * Sort Array of objects by Updated at,
 * @param {Array} array Array
 * @param {string} key Group key
 * @param {string} direction Sort direction
 */
export const sort_updated = (
	a: { updated_at: string | number | Date },
	b: { updated_at: string | number | Date },
	direction = 'asc'
) => {
	const keyA = new Date(a.updated_at);
	const keyB = new Date(b.updated_at);
	if (keyA < keyB) {
		return direction == 'desc'
			? -1
			: 1;
	}
	if (keyA > keyB) {
		return direction == 'desc'
			? 1
			: -1;
	}
	return 0;
};

export const uniqBy = <T>(a: T, key: string): T => {
	return ([...new Map((a as T[]).map(item => [item[key], item])).values()] as unknown) as T;
};

export const trackSort = function (a: any, b: any) {
	if (a.disc === b.disc) {
		return a.track - b.track;
	}
	return pad(a.track, 2) > pad(b.track, 2)
		? 1
		: -1;
};

export const sortByPosterAlphabetized = <T>(
	data: T[],
	sort = 'name',
	uniqued: string | null = null
): T[] => {
	if (uniqued) {
		data = unique<T>(data, uniqued);
	}

	const current = Object.create(null);
	const finalArr: any[] = new Array<any>();

	data.forEach((o: any) => {
		if (!current[o.name]) {
			current[o.name] = [];
			finalArr.push({ ...o, department: current[o.name] });
		}
		current[o.name].push(o.department);
	});

	const postered = finalArr
		.filter((d: { profile: null }) => d.profile != null)
		.sort(
			(a: { [x: string]: number }, b: { [x: string]: number }) =>
				+(a[sort] > b[sort]) || -(a[sort] < b[sort])
		);
	const nulled = finalArr
		.filter((d: { profile: null }) => d.profile == null)
		.sort(
			(a: { [x: string]: number }, b: { [x: string]: number }) =>
				+(a[sort] > b[sort]) || -(a[sort] < b[sort])
		);

	return postered.concat(nulled);
};

export const javaHash = (input: crypto.BinaryLike) => {
	const md5Bytes = crypto.createHash('md5').update(input)
		.digest();
	md5Bytes[6] &= 0x0f; // clear version
	md5Bytes[6] |= 0x30; // set to version 3
	md5Bytes[8] &= 0x3f; // clear variant
	md5Bytes[8] |= 0x80; // set to IETF variant
	return hexToUuid(md5Bytes.toString('hex'));
};

export const chunk = <T>(arr: T[], amount: number): T[][] => {
	return arr.reduce((all, one, i) => {
		const ch = Math.floor(i / amount);
		// @ts-ignore
		all[ch] = [].concat(all[ch] || [], one);

		return all;
	}, []);
};

declare global {
	interface String {
		capitalize: () => string
		toTitleCase: () => string
		toPascalCase: () => string
		toUcFirst: () => string
		titleCase: (lang: string | 'NL' | 'FR', withLowers: boolean) => string
	}
}

String.prototype.capitalize = function (): string {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toTitleCase = function (): string {
	let i: number;
	let j: number;
	let str: string;

	str = this.replace(/([^\W_]+[^\s-]*) */gu, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});

	// Certain minor words should be left lowercase unless
	// they are the first or last words in the string

	['a', 'for', 'so', 'an', 'in', 'the', 'and', 'nor', 'to', 'at', 'of', 'up', 'but', 'on', 'yet', 'by', 'or'];
	const lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
	for (i = 0, j = lowers.length; i < j; i++) {
		str = str.replace(new RegExp(`\\s${lowers[i]}\\s`, 'gu'), (txt) => {
			return txt.toLowerCase();
		});
	}

	// Certain words such as initialisms or acronyms should be left uppercase
	const uppers = ['Id', 'Tv'];
	for (i = 0, j = uppers.length; i < j; i++) { str = str.replace(new RegExp(`\\b${uppers[i]}\\b`, 'gu'), uppers[i].toUpperCase()); }

	return str;
};

/**
 * @param  {string} lang EN|NL|FR
 * @param  {boolean} withLowers true|false
 */
String.prototype.titleCase = function (lang = navigator.language.split('-')[0], withLowers = true): string {
	let string = '';
	let lowers: string[] = [];

	string = this.replace(/([^\s:\-'])([^\s:\-']*)/gu, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}).replace(/Mc(.)/gu, (_match, next) => {
		return `Mc${next.toUpperCase()}`;
	});

	if (withLowers) {
		lowers = ['A', 'An', 'The', 'At', 'By', 'For', 'In', 'Of', 'On', 'To', 'Up', 'And', 'As', 'But', 'Or', 'Nor', 'Not'];
		if (lang == 'FR') {
			lowers = ['Un', 'Une', 'Le', 'La', 'Les', 'Du', 'De', 'Des', 'À', 'Au', 'Aux', 'Par', 'Pour', 'Dans', 'Sur', 'Et', 'Comme', 'Mais', 'Ou', 'Où', 'Ne', 'Ni', 'Pas'];
		} else if (lang == 'NL') {
			lowers = ['De', 'Het', 'Een', 'En', 'Van', 'Naar', 'Op', 'Door', 'Voor', 'In', 'Als', 'Maar', 'Waar', 'Niet', 'Bij', 'Aan'];
		}
		for (let i = 0; i < lowers.length; i++) {
			string = string.replace(new RegExp(`\\s${lowers[i]}\\s`, 'gu'), (txt) => {
				return txt.toLowerCase();
			});
		}
	}

	const uppers = ['Id', 'R&d'];
	for (let i = 0; i < uppers.length; i++) {
		string = string.replace(new RegExp(`\\b${uppers[i]}\\b`, 'gu'), uppers[i].toUpperCase());
	}

	return string;
};

String.prototype.toPascalCase = function (): string {
	const pascal = (this
		.match(/[a-z0-9]+/giu) as string[])
		.map((word: string) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
		.join('_');

	return pascal;
};

String.prototype.toUcFirst = function (): string {
	return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
};


export const matchPercentage = (strA: string, strB: string): number => {
	let result = 0;
	// eslint-disable-next-line no-cond-assign
	for (let i = strA.length; (i -= 1);) {
		if (typeof strB[i] == 'undefined' || strA[i] == strB[i]) {
			//
		} else if (strA[i].toLowerCase() == strB[i].toLowerCase()) {
			result += 1;
		} else {
			result += 4;
		}
	}
	return (
		100
		- ((result + 4 * Math.abs(strA.length - strB.length))
			/ (2 * (strA.length + strB.length)))
		* 100
	);
};

/**
 * * Sort Array of objects by the percentage matched,
 * @param {Array} array Array
 * @param {string} key Group key
 * @param {string} match Match to
 */
export const sortByMatchPercentage = (
	array: any[],
	key: string | number,
	match: string
) => {
	return array.sort((a, b) => {
		const x = matchPercentage(match, a[key]);
		const y = matchPercentage(match, b[key]);
		return x > y
			? -1
			: x < y
				? 1
				: 0;
	});
};

export const objectsEqual = <T, S>(
	o1: T | any,
	o2: S | any
): boolean => {
	if (o2 === null && o1 !== null) { return false; }
	return o1 !== null && typeof o1 === 'object' && Object.keys(o1).length > 0
		? Object.keys(o1).length === Object.keys(o2).length
		&& Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
		: o1 !== null
			&& Array.isArray(o1)
			&& Array.isArray(o2)
			&& !o1.length
			&& !o2.length
			? true
			: o1 === o2;
};

export const create_UUID = () => {
	let dt = new Date().getTime();
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
		const r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x'
			? r
			: (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};

/**
 * @name stringFormat
 * @description Parses the template string with the values given as extra arguments
 * @author: Stoney_Eagle <stoney@nomercy.tv>
 *
 * @example stringFormat(
	"/{0}/{1}/season/{2}/episode/{3}?api_key={4}&language={5}",
	'tv',
	1433,
	1,
	1,
	'ABCDEFGHIJK',
	'en-US'
	) // /tv/1433/season/1/episode/1?api_key=ABCDEFGHIJK&language=en-US
 */
export const stringFormat = (template: string, ...values: Array<string | number>): string => {
	if (values.length === 0) return template;

	const regex = new RegExp(/\{(?<index>\d+)\}/u, 'gu');
	const matches = template.match(regex);
	if (matches?.length == null) return '';

	let string = template;

	for (let i = 0; i < matches.length; i++) {
		const element: string = matches[i];
		const index: number = parseInt(matches[i][1], 10);

		string = string.replace(element, values[index].toString());
	}

	return string;
};


export const translate = (t: (arg: string) => string, template: string, ...value: Array<string | number>) => {

	const translatedTemplate = t(template);

	return stringFormat(translatedTemplate, ...value);

};

type itemMap = (n: any) => any;
interface SortConfig<T> {
	key: keyof T;
	reverse?: boolean;
	map?: itemMap;
}
export function byObjectValues<T extends object>(keys: ((keyof T) | SortConfig<T>)[]): (a: T, b: T) => 0 | 1 | -1 {
	return function (a: T, b: T) {
		const firstKey: keyof T | SortConfig<T> = keys[0];
		const isSimple = typeof firstKey === 'string';
		const key: keyof T = isSimple
			? (firstKey as keyof T)
			: (firstKey as SortConfig<T>).key;
		const reverse: boolean = isSimple
			? false
			: !!(firstKey as SortConfig<T>).reverse;
		const map: itemMap | null = isSimple
			? null
			: (firstKey as SortConfig<T>).map || null;

		const valA = map
			? map(a[key])
			: a[key];
		const valB = map
			? map(b[key])
			: b[key];
		if (valA === valB) {
			if (keys.length === 1) {
				return 0;
			}
			return byObjectValues<T>(keys.slice(1))(a, b);
		}
		if (reverse) {
			return valA > valB
				? -1
				: 1;
		}
		return valA > valB
			? 1
			: -1;
	};
}

export const jsonToString = (arg: any) => JSON.stringify(arg, null, 2);

export const dualSort = <T>(data: T[], key1: string, key2: string, sortKey: string, uniqued?: string): T[] => {

	if (uniqued) {
		data = unique<T>(data, uniqued);
	}

	const current = Object.create(null);
	const finalArr: any[] = [];

	data.forEach((o: any) => {
		if (!current[o.name ?? o.title]) {
			current[o.name ?? o.title] = [];
			finalArr.push({ ...o, department: current[o.name ?? o.title] });
		}
		current[o.name ?? o.title].push(o.department);
	});

	const hasPoster = finalArr
		.filter(d => d[key1])
		.sort((a: { [x: string]: number }, b: { [x: string]: number }) => +(a[sortKey] > b[sortKey]) || -(a[sortKey] < b[sortKey]));

	const nulled = finalArr
		.filter(d => d[key2])
		.sort((a: { [x: string]: number }, b: { [x: string]: number }) => +(a[sortKey] > b[sortKey]) || -(a[sortKey] < b[sortKey]));

	console.log(hasPoster);

	return hasPoster.concat(nulled);

};

export const removeDiacritics = (str: string) => {

	const defaultDiacriticsRemovalMap = [
	  { 'base': 'A', 'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/gu },
	  { 'base': 'AA', 'letters': /[\uA732]/gu },
	  { 'base': 'AE', 'letters': /[\u00C6\u01FC\u01E2]/gu },
	  { 'base': 'AO', 'letters': /[\uA734]/gu },
	  { 'base': 'AU', 'letters': /[\uA736]/gu },
	  { 'base': 'AV', 'letters': /[\uA738\uA73A]/gu },
	  { 'base': 'AY', 'letters': /[\uA73C]/gu },
	  { 'base': 'B', 'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/gu },
	  { 'base': 'C', 'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/gu },
	  { 'base': 'D', 'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/gu },
	  { 'base': 'DZ', 'letters': /[\u01F1\u01C4]/gu },
	  { 'base': 'Dz', 'letters': /[\u01F2\u01C5]/gu },
	  { 'base': 'E', 'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/gu },
	  { 'base': 'F', 'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/gu },
	  { 'base': 'G', 'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/gu },
	  { 'base': 'H', 'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/gu },
	  { 'base': 'I', 'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/gu },
	  { 'base': 'J', 'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/gu },
	  { 'base': 'K', 'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/gu },
	  { 'base': 'L', 'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/gu },
	  { 'base': 'LJ', 'letters': /[\u01C7]/gu },
	  { 'base': 'Lj', 'letters': /[\u01C8]/gu },
	  { 'base': 'M', 'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/gu },
	  { 'base': 'N', 'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/gu },
	  { 'base': 'NJ', 'letters': /[\u01CA]/gu },
	  { 'base': 'Nj', 'letters': /[\u01CB]/gu },
	  { 'base': 'O', 'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/gu },
	  { 'base': 'OI', 'letters': /[\u01A2]/gu },
	  { 'base': 'OO', 'letters': /[\uA74E]/gu },
	  { 'base': 'OU', 'letters': /[\u0222]/gu },
	  { 'base': 'P', 'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/gu },
	  { 'base': 'Q', 'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/gu },
	  { 'base': 'R', 'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/gu },
	  { 'base': 'S', 'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/gu },
	  { 'base': 'T', 'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/gu },
	  { 'base': 'TZ', 'letters': /[\uA728]/gu },
	  { 'base': 'U', 'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/gu },
	  { 'base': 'V', 'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/gu },
	  { 'base': 'VY', 'letters': /[\uA760]/gu },
	  { 'base': 'W', 'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/gu },
	  { 'base': 'X', 'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/gu },
	  { 'base': 'Y', 'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/gu },
	  { 'base': 'Z', 'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/gu },
	  { 'base': 'a', 'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/gu },
	  { 'base': 'aa', 'letters': /[\uA733]/gu },
	  { 'base': 'ae', 'letters': /[\u00E6\u01FD\u01E3]/gu },
	  { 'base': 'ao', 'letters': /[\uA735]/gu },
	  { 'base': 'au', 'letters': /[\uA737]/gu },
	  { 'base': 'av', 'letters': /[\uA739\uA73B]/gu },
	  { 'base': 'ay', 'letters': /[\uA73D]/gu },
	  { 'base': 'b', 'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/gu },
	  { 'base': 'c', 'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/gu },
	  { 'base': 'd', 'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/gu },
	  { 'base': 'dz', 'letters': /[\u01F3\u01C6]/gu },
	  { 'base': 'e', 'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/gu },
	  { 'base': 'f', 'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/gu },
	  { 'base': 'g', 'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/gu },
	  { 'base': 'h', 'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/gu },
	  { 'base': 'hv', 'letters': /[\u0195]/gu },
	  { 'base': 'i', 'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/gu },
	  { 'base': 'j', 'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/gu },
	  { 'base': 'k', 'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/gu },
	  { 'base': 'l', 'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/gu },
	  { 'base': 'lj', 'letters': /[\u01C9]/gu },
	  { 'base': 'm', 'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/gu },
	  { 'base': 'n', 'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/gu },
	  { 'base': 'nj', 'letters': /[\u01CC]/gu },
	  { 'base': 'o', 'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/gu },
	  { 'base': 'oi', 'letters': /[\u01A3]/gu },
	  { 'base': 'ou', 'letters': /[\u0223]/gu },
	  { 'base': 'oo', 'letters': /[\uA74F]/gu },
	  { 'base': 'p', 'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/gu },
	  { 'base': 'q', 'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/gu },
	  { 'base': 'r', 'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/gu },
	  { 'base': 's', 'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/gu },
	  { 'base': 't', 'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/gu },
	  { 'base': 'tz', 'letters': /[\uA729]/gu },
	  { 'base': 'u', 'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/gu },
	  { 'base': 'v', 'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/gu },
	  { 'base': 'vy', 'letters': /[\uA761]/gu },
	  { 'base': 'w', 'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/gu },
	  { 'base': 'x', 'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/gu },
	  { 'base': 'y', 'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/gu },
	  { 'base': 'z', 'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/gu },
	];

	for (let i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
	  str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
	}

	return str;
};

export const getClosestRating = <T extends Array<{ certification: Certification }>>(ratings: T, country: string): T[0]|undefined => {
	const newRatings = ratings.map((r) => {
		return {
			rating: r.certification.rating,
			meaning: r.certification.meaning,
			order: r.certification.order,
			iso31661: r.certification.iso31661,
			image: `/${r.certification.iso31661}/${r.certification.iso31661}_${r.certification.rating}.svg`,
		};
	});

	let newRating;

	if (!newRatings || newRatings.length == 0) return;

	newRating = newRatings.find(r => r.iso31661 == country.toUpperCase());
	if (!newRating) {
		newRating = newRatings.find(r => r.iso31661 == 'US');
	}

	return newRating;
};

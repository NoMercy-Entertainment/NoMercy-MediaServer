import crypto from 'crypto';
import hexToUuid from 'hex-to-uuid';

/* eslint-disable no-extend-native */
export const breakLogoTitle = (str: string, characters = [':', '!', '?']) => {
	if (!str) {
		return '';
	}

	if (str.split('').some((l: string) => characters.includes(l))) {
		const reg = new RegExp(characters.map(l => (l == '?' ? `\\${l}` : l)).join('|'), 'u');
		const reg2 = new RegExp(characters.map(l => (l == '?' ? `\\${l}\\s` : `${l}\\s`)).join('|'), 'u');
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
			(arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b),
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

/**
 * * Group Array of objects by key.
 * * Sort by key (optional)
 * @param {Array} array Array
 * @param {string} key Group key
 * @param {string} key Sort key
 */
export const groupBy = <T>(array: T[], key: string) => {
	const list: any = {};

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
export const shuffle = (array: Array<any>): Array<any> => {
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
			x = subKey ? b[key]?.[subKey] : b[key];
			y = subKey ? a[key]?.[subKey] : a[key];
		} else {
			x = subKey ? a[key]?.[subKey] : a[key];
			y = subKey ? b[key]?.[subKey] : b[key];
		}
		return x < y ? -1 : x > y ? 1 : 0;
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
			= a[key].toString().toLowerCase() in sortingOrder ? sortingOrder[a[key]] : Number.MAX_SAFE_INTEGER;
		const second
			= b[key].toString().toLowerCase() in sortingOrder ? sortingOrder[b[key]] : Number.MAX_SAFE_INTEGER;

		let result = 0;
		if (first > second) {
			result = -1;
		} else if (first < second) {
			result = 1;
		}
		return order === 'desc' ? ~result : result;
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

export const uniqueBy = (array: any, key: any) => {
	if (!array) {
		return [];
	}
	return Array.from(new Map(array.map((x: any) => [key(x), x])).values());
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
		return direction == 'desc' ? -1 : 1;
	}
	if (keyA > keyB) {
		return direction == 'desc' ? 1 : -1;
	}
	return 0;
};

export const uniqBy = <T>(a: any, key: string): T => {
	return ([...new Map(a.map((item: { [x: string]: any; }) => [item[key], item])).values()] as unknown) as T;
};

export const trackSort = function (a: any, b: any) {
	if (a.disc === b.disc) {
		return a.track - b.track;
	}
	return pad(a.track, 2) > pad(b.track, 2) ? 1 : -1;
};

export const sortByPosterAlphabetized = <T>(
	data: T[],
	sort = 'name',
	uniqued:string|null = null
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
		.filter((d: { profilePath: null }) => d.profilePath != null)
		.sort(
			(a: { [x: string]: number }, b: { [x: string]: number }) =>
				+(a[sort] > b[sort]) || -(a[sort] < b[sort])
		);
	const nulled = finalArr
		.filter((d: { profilePath: null }) => d.profilePath == null)
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

export const chunk = (arr: any[], amount: number) => {
	return arr.reduce((all, one, i) => {
		const ch = Math.floor(i / amount);

		all[ch] = [].concat(all[ch] || [], one);

		return all;
	}, []);
};

declare global {
  interface String {
    capitalize: () => string
    toTitleCase: () => string
    toPascalCase: (string: any) => string
    titlecase: (lang: string|'NL'|'FR', withLowers: boolean) => string
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
String.prototype.titlecase = function (lang = navigator.language.split('-')[0], withLowers = true): string {
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
		return x > y ? -1 : x < y ? 1 : 0;
	});
};

export const objectsEqual = <T, S>(
	o1: T | any,
	o2: S | any
): boolean => {
	if (o2 === null && o1 !== null) { return false; }
	return o1 !== null && typeof o1 === 'object' && Object.keys(o1).length > 0 ? Object.keys(o1).length === Object.keys(o2).length
		&& Object.keys(o1).every(p => objectsEqual(o1[p], o2[p])) : o1 !== null
			&& Array.isArray(o1)
			&& Array.isArray(o2)
			&& !o1.length
			&& !o2.length ? true : o1 === o2;
};

export const create_UUID = () => {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

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
	const regex = new RegExp(/\{(?<index>\d+)\}/, 'gu');
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

    return stringFormat(translatedTemplate, ...value)

}

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
        const key: keyof T = isSimple ? (firstKey as keyof T) : (firstKey as SortConfig<T>).key;
        const reverse: boolean = isSimple ? false : !!(firstKey as SortConfig<T>).reverse;
        const map: itemMap | null = isSimple ? null : (firstKey as SortConfig<T>).map || null;

        const valA = map ? map(a[key]) : a[key];
        const valB = map ? map(b[key]) : b[key];
        if (valA === valB) {
            if (keys.length === 1) {
                return 0;
            }
            return byObjectValues<T>(keys.slice(1))(a, b);
        }
        if (reverse) {
            return valA > valB ? -1 : 1;
        }
        return valA > valB ? 1 : -1;
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
        .filter((d) => d[key1])
        .sort((a: { [x: string]: number }, b: { [x: string]: number }) => +(a[sortKey] > b[sortKey]) || -(a[sortKey] < b[sortKey]));
		
    const nulled = finalArr
        .filter((d) => d[key2])
        .sort((a: { [x: string]: number }, b: { [x: string]: number }) => +(a[sortKey] > b[sortKey]) || -(a[sortKey] < b[sortKey]));

	console.log(hasPoster);

    return hasPoster.concat(nulled);

} 
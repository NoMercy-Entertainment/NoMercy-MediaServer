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

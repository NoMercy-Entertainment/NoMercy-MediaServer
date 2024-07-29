import { Logger } from 'drizzle-orm';
import { customType } from 'drizzle-orm/sqlite-core';
import { appendFileSync } from 'fs';

export class MyLogger implements Logger {
	logQuery(query: string, params: unknown[]): void {
		appendFileSync('query.log', `${query}\n${JSON.stringify(params)}\n\n`);
		// console.log({ query, params });
	}
}

export const boolean = customType<{ data: boolean }>({
	dataType() {
		return 'boolean';
	},
});

export const datetime = customType<{ data: number | string }>({
	dataType() {
		return 'datetime';
	},
});

export const convertBooleans = <T>(data: T, withUpdatedAt = false): T => {
	for (const element in data) {
		if (typeof data[element] === 'boolean') {
			// @ts-ignore
			data[element] = data[element]
				? 1
				: 0;
		}
	}

	if (withUpdatedAt) {
	// 	// @ts-ignore
	// 	data.updated_at = new Date().toISOString()
	// 		.slice(0, 19)
	// 		.replace('T', ' ');
	}

	return data;
};

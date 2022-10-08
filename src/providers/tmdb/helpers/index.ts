export type FilterAppends<Source, Condition> = {
	[K in keyof Source]: Source[K] extends Condition ? K : never;
};

export interface PaginatedResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

export const mappedEntries = <O>(input: any): O => {
	return Object.entries(input) as any;
};

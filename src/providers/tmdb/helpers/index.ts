export type FilterAppends<Source, Condition> = {
	[K in keyof Source]: Source[K] extends Condition ? K : never;
};

export interface PaginatedResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const mappedEntries = <O>(input: O) => {
	return Object.entries(input as any) as Entries<O>;
};

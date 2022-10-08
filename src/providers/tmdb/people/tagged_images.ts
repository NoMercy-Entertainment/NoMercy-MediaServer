import { Movie } from '../movie';
import { Image } from '../shared/image';
import { TvShow } from '../tv';

export interface TaggedImages {
	page: number;
	results: TaggedImageResult[];
	total_pages: number;
	total_results: number;
}

export interface TaggedImageResult extends Image {
	id: number;
	media: TvShow | Movie;
	media_type: string;
}

import { Image } from '../shared/image';

export interface MovieImages {
	id: number;
	backdrops: Image[];
	posters: Image[];
    logos: Image[];
}

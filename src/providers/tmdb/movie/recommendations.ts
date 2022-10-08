import { Movie } from './movie';
import { PaginatedResponse } from '../helpers';

export type MovieRecommendations = PaginatedResponse<Movie>;

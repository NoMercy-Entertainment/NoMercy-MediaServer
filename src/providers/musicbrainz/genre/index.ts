import { AxiosResponse } from "axios";
import Logger from "../../../functions/logger";
import mbApiClient from "../mbApiClient";

export interface PaginatedGenreResponse {
    "genre-count":  number;
    "genre-offset": number;
    genres:         Genre[];
}

export interface Genre {
    name:           string;
    id:             string;
    count?:          number;
    disambiguation: string;
}

export const musicGenres = async () => {
	Logger.log({
		level: "info",
		name: "musicBrainz",
		color: "blue",
		message: `Fetching music genres`,
	});

	try {
		
		const arr: Genre[] = [];
		
		const { data } = await mbApiClient.get<PaginatedGenreResponse>(`genre/all`, {
			params: {
				limit: 100,
				offset: 0,
			}
		});
	
		for (let j = 0; j < data.genres.length; j++) {
			arr.push(data.genres[j]);
		}
	
		const promises: Promise<AxiosResponse<PaginatedGenreResponse>>[] = [];
	
		for (let i = 1; i < Math.floor(data['genre-count'] / data.genres.length); i++) {
			
			promises.push(
				mbApiClient.get<PaginatedGenreResponse>(`genre/all`, {
					params: { 
						limit: data.genres.length,
						offset: i * data.genres.length
					},
				})
			);
		}
	
		const data2 = await Promise.all(promises);
	
		for (let g = 0; g < data2.length; g++) {
			for (let j = 0; j < data2[g].data.genres.length; j++) {
				arr.push(data2[g].data.genres[j]);
			}
		}
		return arr;

	} catch (error) {
		Logger.log({
			level: "info",
			name: "musicBrainz",
			color: "red",
			message: `Error fetching music genres`,
		});

		return [];
	}

}
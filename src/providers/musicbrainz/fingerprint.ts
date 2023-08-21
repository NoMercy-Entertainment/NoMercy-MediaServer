import { ParsedFileList } from '@server/tasks/files/filenameParser';
import { execSync } from 'child_process';
import { fingerprintCalc } from '@server/state';
import Logger from '@server/functions/logger';
import mbApiClient from './mbApiClient';

export const getAcousticFingerprintFromParsedFileList = async (file: ParsedFileList): Promise<void | Result> => {

	Logger.log({
		name: 'fingerprint',
		color: 'blue',
		level: 'info',
		message: `Getting fingerprint for: ${file.path}`,
	});

	const fingerprint = execSync(`${fingerprintCalc} -json "${file.path}"`).toString();

	console.log(fingerprint);
	if (!fingerprint) {
		return;
	}

	const fingerprintData = JSON.parse(fingerprint ?? '{}');

	const meta = [
		'recordings',
		'releases',
		'tracks',
		'compress',
	].join('+');

	try {
		const response = await mbApiClient.get<FingerprintLookup>(`https://api.acoustid.org/v2/lookup?meta=${meta}`, {
			params: {
				client: process.env.ACOUSTIC_ID,
				duration: parseInt(fingerprintData.duration, 10),
				fingerprint: fingerprintData.fingerprint,
			},
		});

		console.log(response.data);

		return response.data?.results?.[0];

	} catch (error: any) {
		console.log(error.response.data.error);
	}
};


export interface FingerprintLookup {
    results: Result[];
    status: string;
}

export interface Result {
    id: string;
    recordings: Recording[];
    score: Score;
}

export interface Recording {
    artists: Artist[];
    duration: number;
    id: string;
    releases: Release[];
    title: string;
}

export interface Artist {
    id: string;
    name: string;
}

export interface Release {
    artists?: Artist[];
    country: string;
    date: DateClass;
    id: string;
    medium_count: number;
    mediums: Medium[];
    releaseevents: ReleaseEvent[];
    title: string;
    track_count: number;
}

export interface DateClass {
    day?: number;
    month?: number;
    year: number;
}

export interface Medium {
    format: Format;
    position: number;
    track_count: number;
    tracks: Track[];
}

export enum Format {
    CD = 'CD',
    CopyControlCD = 'Copy Control CD',
    DigitalMedia = 'Digital Media',
    The12Vinyl = '12" Vinyl',
}

export interface Track {
    artists?: Artist[];
    id: string;
    position: number;
    title?: string;
}

export interface ReleaseEvent {
    country: string;
    date: DateClass;
}

export interface Score {
    value: string;
    type: string;
}

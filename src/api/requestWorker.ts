import { AppState, useSelector } from '@server/state/redux';

interface RequestWorkerResponse {
	result?: any;
	error?: {
		message: string;
		code: number;
	};
}
export const requestWorker = ({ filename, ...args }: { [x: string]: any; filename: any; }): Promise<RequestWorkerResponse> => {

	const queue = useSelector((state: AppState) => state.config.requestWorker);
	const job = queue.add({
		file: filename,
		fn: 'exec',
		args: args,
	});

	return new Promise((resolve) => {
		queue.once(job.id, (message: RequestWorkerResponse) => {
			try {
				return resolve(message);
			} catch (error) {
				//
			}
		});
	});
};

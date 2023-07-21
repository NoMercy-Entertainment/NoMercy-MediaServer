import mediaDb from '@server/db/media';
import queueDb from '@server/db/queue';

process.on('message', async (message: any) => {
	
	mediaDb();
	queueDb();

	if (message.type == 'job') {

		const { file, fn: func, args } = JSON.parse(message.job.payload ?? '');

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const req = require(file);
		if (typeof req[func] == 'function') {
			try {
				await req[func]({ ...args, job: message.job })
					.then(result => (process as any).send({ job: message.job, result }));
			} catch (error) {
				(process as any).send({ job: message.job, error });
			}
		} else {
			const error = 'function does not exist';

			(process as any).send({ job: message.job, error });
		}
	}
});

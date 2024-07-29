import queueDb from '@server/db/queue';
import mediaDb from '@server/db/media';

process?.on('message', async (message: any) => {

	mediaDb();
	queueDb();

	if (message.type == 'job') {

		const { file, fn: func, args } = message.job.payload;

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const req = require(file);
		if (typeof req[func] == 'function') {
			try {
				await req[func]({ ...args })
					.then((result: any) => (process as any).send({ result }));
			} catch (error) {
				(process as any).send({ error });
			}
		} else {
			const error = 'function does not exist';

			(process as any).send({ error });
		}
	}
});


process.on('message', async (job: any) => {
	const { file, fn: func, args } = JSON.parse(job.payload ?? '');

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const req = require(file);
	if (typeof req[func] == 'function') {
		try {
			await req[func]({ ...args, job: job })
				.then(result => (process as any).send({ job, result }));
		} catch (error) {
			(process as any).send({ job, error });
		}
	} else {
		const error = 'function does not exist';

		(process as any).send({ job, error });
	}
});

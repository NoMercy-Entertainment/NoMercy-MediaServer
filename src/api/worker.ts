import { parentPort } from 'worker_threads';

parentPort?.on('message', async (message) => {
	if (message === 'exit') {
		parentPort?.postMessage('sold!');
		parentPort?.close();
	}

	if (message.type == 'job') {

		const { file, fn: func, args } = message.payload;

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const req = require(file);
		if (typeof req[func] == 'function') {
			try {
				await req[func]({ ...args })
					.then(result => parentPort?.postMessage({ result }));
			} catch (error) {
				parentPort?.postMessage({ error });
			}
		} else {
			const error = 'function does not exist';

			parentPort?.postMessage({ error });
		}
	}
});


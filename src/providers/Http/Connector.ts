import Queue from 'queue-promise';
import promiseRetry from 'promise-retry';

import Request from './Request';

class Connector extends Request {

	protected static queue: Queue | undefined;

	/**
	 * Object containing rate limit configuration for requests.
	 * @property {number} concurrent - The maximum number of concurrent requests allowed.
	 * @property {number} interval - The interval in milliseconds between each request.
	 * @property {boolean} start - Whether to start the rate limiting immediately.
	 */
	protected static rateLimit: {
		concurrent: number,
		interval: number,
		start: boolean,
	} = {
			concurrent: 2,
			interval: 1000,
			start: true,
		};

	public static enqueue<T>(func: () => Promise<T>): Promise<T> {
		const queue = Connector.getQueue();
		const key = `${Connector.name}_${Math.random()
			.toString(36)
			.substring(3)}`;

		return promiseRetry((retry) => {
			queue.enqueue(async () => {
				return {
					key: key,
					data: await func(),
				};
			});

			return new Promise((resolve) => {
				queue.on('resolve', (result) => {
					if (result.key && key === result.key) {
						return resolve(result.data as T);
					}
				});
				queue.on('reject', (result) => {
					if (result.key && key === result.key) {
						return retry(result.data as Error);
					}
				});
			});
		})
			.then((value) => {
				return value as T;
			}, (err) => {
				return Promise.reject(err);
				// TODO: store error in database
			});
	}

	protected static getQueue() {
		if (!Connector.queue) {
			Connector.queue = new Queue(Connector.rateLimit);
		}
		return Connector.queue;
	}
}

export default Connector;

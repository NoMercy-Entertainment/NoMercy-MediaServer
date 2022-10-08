// import { resolve } from "path";
import { AppState, useSelector } from '../../state/redux';

export default () => {
	const queue = useSelector((state: AppState) => state.config.queueWorker);
	const queueWorkers = useSelector((state: AppState) => state.config.queueWorkers);

	queue.setWorkers(queueWorkers);
	queue.retry();
	queue.start();

	// for (let i = 0; i < 1000; i++) {
	//     queue.add({
	//         file: resolve(__dirname, '..', 'jobs'),
	//         fn: 'sum',
	//         args: { a: i, b: i },
	//     });
	// }
};

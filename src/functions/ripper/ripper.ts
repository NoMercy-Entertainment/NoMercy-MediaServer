// import { confDb } from '../../database/config';
// import { Configuration } from '../../database/config/client';

// import { AppState, useSelector } from '../../state/redux';

import { Ripper } from './RipperClass';

export default () => {

	// const dbConf: Configuration[] = await confDb.configuration.findMany();

	// const queueWorkers = dbConf.find(conf => conf.key == 'queueWorkers')?.value as string;
	// const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	// queueWorker.setWorkers(parseInt(queueWorkers ?? '1', 10)).start();

	const ripper = new Ripper();
	// const socket = useSelector((state: AppState) => state.system.socket);

	// socket.on('connection', (s) => {
	// 	s.emit('ripper-message', 'Ripper initialized');
	// 	console.log('Ripper initialized');

	// 	s.on('ripper-eject', () => {
	// 		console.log('ejecting');
	// 		s.emit('ripper-message', 'ejecting');
	// 		ripper.eject();
	// 	});
	// 	s.on('ripper-start', () => {
	// 		console.log('starting');
	// 		s.emit('ripper-message', 'starting');
	// 		ripper.start();
	// 	});
	// 	s.on('ripper-stop', () => {
	// 		console.log('stopping');
	// 		s.emit('ripper-message', 'stopping');
	// 		ripper.stop();
	// 	});
	// 	s.on('ripper-state', () => {
	// 		console.log('getting state');
	// 		s.emit('ripper-message', 'getting state');
	// 		ripper.state();
	// 	});
	// 	s.on('ripper-execute', () => {
	// 		console.log('executing');
	// 		s.emit('ripper-message', 'executing');
	// 		ripper.execute();
	// 	});
	// 	s.on('ripper-get-drives', () => {
	// 		console.log('getting drives');
	// 		s.emit('ripper-message', 'getting drives');
	// 		ripper.getDrives();
	// 	});
	// });

};

// import progress from '../../controllers/encoder/ffmpeg/progress';
// import cpuStats from '../../controllers/monitor/cpu';
import Logger from '../../functions/logger';
import audio from './audio';
// import content from './content';
import dashboard from './dashboard';
import video from './video';

export default function (socket, io) {
	socket.on('notification', (data) => {
		Logger.log({
			level: 'http',
			name: 'notification',
			color: 'yellow',
			user: socket.decoded_token.name,
			message: data.value,
		});
		socket.nsp.to(socket.decoded_token.sub).emit('notification', data);
	});

	socket.on('command', (data) => {
		Logger.log({
			level: 'http',
			name: 'command',
			color: 'yellow',
			user: socket.decoded_token.name,
			message: data.value,
		});
		socket.nsp.to(socket.decoded_token.sub).emit('command', data);
	});

	socket.on('log', (data) => {
		Logger.log({
			level: 'http',
			name: 'log',
			color: 'yellow',
			user: socket.decoded_token.name,
			message: data.value,
		});
	});

	audio(socket, io);
	// content(socket, io);
	dashboard(socket, io);
	// progress(socket, io);
	video(socket, io);
	// cpuStats(socket, io);

}

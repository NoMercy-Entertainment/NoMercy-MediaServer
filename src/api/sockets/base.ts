import Logger from '@server/functions/logger';
import audio from './audio';
import cast from './cast';
import cpuStats from './cpu';
import syncPlay from './syncPlay';
import dashboard from './dashboard';
import video from './video';
import SocketIO from 'socket.io';

export declare enum NotificationType {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info',
	DEFAULT = 'default'
}

export interface NotificationProps {
	title: string,
	body?: string,
	type: NotificationType,
	visibleOnly?: boolean,
	duration?: number,
}

export default function(socket: SocketIO.Socket & { decoded_token: { sub: string, name: string } }) {
	socket.on('notify', (data) => {
		Logger.log({
			level: 'http',
			name: 'notify',
			color: 'yellow',
			user: socket.decoded_token.name,
			message: data.value,
		});
		socket.nsp.to(socket.decoded_token.sub)
			.emit('notify', data);
	});

	socket.on('command', (data) => {
		Logger.log({
			level: 'http',
			name: 'command',
			color: 'yellow',
			user: socket.decoded_token.name,
			message: data,
		});
		socket.nsp.to(socket.decoded_token.sub)
			.emit('command', data);
	});

	socket.on('log', (data) => {
		Logger.log({
			level: 'http',
			name: 'log',
			color: 'yellow',
			user: socket.decoded_token.name,
			message: data?.value ?? data,
		});
	});

	socket.on('ui-update', (data) => {
		socket.nsp.to(socket.decoded_token.sub)
			.emit('ui-update', data);
	});

	video(socket);
	syncPlay(socket);
	audio(socket);
	// content(socket, io);
	dashboard(socket);
	// progress(socket, io);
	cpuStats(socket);

	cast(socket);

}


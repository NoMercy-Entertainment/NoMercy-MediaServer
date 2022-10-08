import { AppState, useSelector } from '../state/redux';
import { Server, Socket } from 'socket.io';

import EventEmitter from 'events';
import Logger from '../functions/logger';
import base from '../api/sockets/base';
import { socketCors } from '../functions/networking';
import socketioJwt from 'socketio-jwt';

let io: any = null;
let myClientList: any[] = [];

const emitter = new EventEmitter();

// emitter.setMaxListeners(300);
// process.setMaxListeners(300);
// EventEmitter.prototype.setMaxListeners(300);

const updatedList = (socket: Socket) =>
	myClientList
		.filter((c) => c.sub == (socket as any).decoded_token.sub)
		.map((s) => ({
			socket_id: s.id,
			id: s.client_id,
			type: s.client_type,
			name: s.client_name,
			secure_connection: s.secure_connection,
		}));

export type SocketIoServer = typeof socket;

export const socket = {
	listen: function (event: any, values: any) {
		if (io) {
			io.listen(event, values);
		}
	},
	emit: function (event: any, values: any) {
		if (io) {
			io.emit(event, values);
		}
	},
	use: function (event: any, values: any) {
		if (io) {
			io.sockets.use(event, values);
		}
	},
	on: function (event: any, values: any) {
		if (io) {
			socket.on(event, values);
		}
	},
	once: function (event: any, values: any) {
		if (io) {
			socket.once(event, values);
		}
	},
	connect: function (server: any) {
		io = new Server(server, socketCors);

		io.use(
			socketioJwt.authorize({
				secret: useSelector((state: AppState) => state.config.keycloakCertificate),
				timeout: 15000,
				handshake: true,
				auth_header_required: true,
			})
		);

		io.once(
			'connection',
			(socket: {
				emit: (
					arg0: any,
					arg1?: any
				) => void;
			}) => {
				socket.emit('update_content');

				socket.emit('notification', {
					id: 1,
					title: 'NoMercy Mediaserver',
					body: 'Your server has started.',
					silent: false,
					notify: true,
					read: false,
					from: 'NoMercy Mediaserver',
					method: 'add',
					to: '*',
					image: 'https://cdn.nomercy.tv/img/favicon.ico',
					created_at: Date.now(),
				});
			}
		);

		const uniqueFilter = 'connection';

		io.on('connection', async (socket: any) => {
			if (uniqueFilter == 'connection') {
				myClientList = myClientList.filter((s) => s.id != socket.id);
			} else if (uniqueFilter == 'device') {
				myClientList = myClientList.filter((s) => s.client_id != socket.handshake.headers.device_id);
			}

			myClientList.push({
				sub: socket.decoded_token.sub,
				email: socket.decoded_token.email,
				id: socket.id,
				address: socket.handshake.address,
				connected: socket.connected,
				disconnected: socket.disconnected,
				secure_connection: socket.handshake.secure,
				client_id: socket.handshake.headers.device_id,
				client_name: socket.handshake.headers.device_name,
				client_type: socket.handshake.headers.device_type,
				rooms: socket.adapter.rooms,
				socket,
			});

			socket.join(socket.decoded_token.sub);

			Logger.log({
				level: 'http',
				name: 'socket',
				color: 'yellow',
				user: socket.decoded_token.name,
				message: `connected, ${updatedList(socket).length} ${uniqueFilter}${
					updatedList(socket).length == 1 ? '' : 's'
				} ${uniqueFilter == 'connection' ? 'established' : 'connected'}.`,
			});
			socket.nsp.to(socket.decoded_token.sub).emit('get_devices', updatedList(socket));

			socket.on('disconnect', () => {
				if (uniqueFilter == 'connection') {
					myClientList = myClientList.filter((s) => s.id != socket.id);
				} else if (uniqueFilter == 'device') {
					myClientList = myClientList.filter((s) => s.client_id != socket.handshake.headers.device_id);
				}

				Logger.log({
					level: 'http',
					name: 'socket',
					color: 'yellow',
					user: socket.decoded_token.name,
					message: `disconnected, ${updatedList(socket).length} ${uniqueFilter}${
						updatedList(socket).length == 1 ? '' : 's'
					} ${uniqueFilter == 'connection' ? 'established' : 'connected'}.`,
				});

				socket.nsp.to(socket.decoded_token.sub).emit('get_devices', updatedList(socket));
			});

			await base(socket, io, updatedList);
		});

		// io.of("/").adapter.on("create-room", (room) => {
		// 	console.log(`room ${room} was created`);
		// });

		// io.of("/").adapter.on("join-room", (room, id) => {
		// 	if(room.includes(35)){
		// 		console.log(`socket ${id} has joined room ${room}`);
		// 	}
		// });

		// io.of("/").adapter.on("leave-room", (room, id) => {
		// 	if(room.includes(35)){
		// 		console.log(`socket ${id} has left room ${room}`);
		// 	}
		// });
	},
};

/**
 * @param  {import('express').Request} req
 * @param  {String} event
 * @param  {String} message
 * @description Send a custom socket event on the requestee socket connection.
 */

export const sendTo = (to: any, event: any, message = null) => {
	myClientList.filter((c) => c.sub == to).forEach((c) => c.io.sockets.emit(event, message));
};

/**
 * @param  {String} to User id or email
 * @param  {String} message
 * @description Send a message to a user on their socket connection.
 */
export const sendMessageTo = (to: any, message: any) => {
	myClientList.filter((c) => c.email == to || c.sub == to).forEach((c) => c.io.sockets.emit('message', message));
};

/**
 * @param  {String} to User id or email
 * @param  {String} message
 * @description Send a notification to a user on their socket connection.
 */
export const sendNotificationTo = (to: any, message: any) => {
	myClientList.filter((c) => c.email == to || c.sub == to).forEach((c) => c.io.sockets.emit('notification', message));
};

export default {
	socket,
	sendTo,
	sendMessageTo,
	sendNotificationTo,
};

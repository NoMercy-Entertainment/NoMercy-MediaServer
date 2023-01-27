import { AppState, useSelector } from '../state/redux';
import { Server, Socket } from 'socket.io';

import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Logger from '../functions/logger';
import base from '../api/sockets/base';
import { confDb } from '../database/config';
import socketioJwt from 'socketio-jwt';
import { storeServerActivity } from '../api/userData/activity/post';

const io: any = null;
export let myClientList: any[] = [];

process.setMaxListeners(300);

const updatedList = (socket: Socket) =>
	myClientList
		.filter(c => c.sub == (socket as any).decoded_token.sub)
		.map(s => ({
			socket_id: s.id,
			id: s.client_id,
			type: s.client_type,
			name: s.client_name,
			os: s.client_os,
			secure_connection: s.secure_connection,
		}));

export type SocketIoServer = typeof socket;

export const socket = {
	listen(event: any, values: any) {
		if (io) {
			io.listen(event, values);
		}
	},
	emit(event: any, values: any) {
		if (io) {
			io.emit(event, values);
		}
	},
	use(event: any, values: any) {
		if (io) {
			io.sockets.use(event, values);
		}
	},
	on(event: any, values: any) {
		if (io) {
			'';
			io.on(event, values);
		}
	},
	once(event: any, values: any) {
		if (io) {
			io.once(event, values);
		}
	},
	connect(io: Server<DefaultEventsMap, any>) {

		io.use(
			socketioJwt.authorize({
				secret: useSelector((state: AppState) => state.config.keycloakCertificate),
				// timeout: 15000,
				handshake: true,
				auth_header_required: false,
			})
		);

		io.use((socket, next) => {
			const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

			if (allowedUsers.some(u => u.email == (socket as any).decoded_token.email)) {
				return next();
			}

			next(new Error('thou shall not pass'));
		});

		io.once('connection', (socket: { emit: (arg0: any, arg1?: any) => void }) => {
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
		});

		const uniqueFilter = 'connection';

		io.on('connection', async (socket: any) => {

			if (uniqueFilter == 'connection') {
				myClientList = myClientList.filter(s => s.id != socket.id);
			} else if (uniqueFilter == 'device') {
				myClientList = myClientList.filter(s => s.client_id != socket.handshake.headers.device_id);
			}

			myClientList.push({
				sub: socket.decoded_token.sub,
				email: socket.decoded_token.email,
				id: socket.id,
				address: socket.handshake.address,
				connected: socket.connected,
				disconnected: socket.disconnected,
				secure_connection: socket.handshake.secure,
				client_id: socket.handshake.query.device_id,
				client_name: socket.handshake.query.device_name,
				client_type: socket.handshake.query.device_type,
				client_os: socket.handshake.query.device_os,
				rooms: socket.adapter.rooms,
				socket,
			});

			const data: any = {};
			data.sub_id = socket.decoded_token.sub;
			data.time = new Date();
			data.device_id = socket.handshake.query.device_id;
			data.from = socket.request.connection.remoteAddress;
			data.device_name = socket.handshake.query.device_name;
			data.device_type = socket.handshake.query.device_type;
			data.device_os = socket.handshake.query.device_os;
			data.version = '0.0.5';
			data.type = 'Connected';
			await storeServerActivity(data);

			socket.join(socket.decoded_token.sub);

			// setClientList(myClientList);

			Logger.log({
				level: 'http',
				name: 'socket',
				color: 'yellow',
				user: socket.decoded_token.name,
				message: `connected, ${updatedList(socket).length} ${uniqueFilter}${updatedList(socket).length == 1
					? ''
					: 's'} ${
					uniqueFilter == 'connection'
						? 'established'
						: 'connected'
				}.`,
			});
			socket.nsp.to(socket.decoded_token.sub).emit('setConnectedDevices', updatedList(socket));

			await confDb.device.upsert({
				where: {
					id: socket.handshake.query.device_id,
				},
				update: {
					id: socket.handshake.query.device_id,
					deviceId: socket.handshake.query.device_id,
					ip: socket.request.connection.remoteAddress,
					title: socket.handshake.query.device_name,
					type: socket.handshake.query.device_os,
					version: '0.0.5',
					updated_at: new Date(),
				},
				create: {
					id: socket.handshake.query.device_id,
					deviceId: socket.handshake.query.device_id,
					ip: socket.request.connection.remoteAddress,
					title: socket.handshake.query.device_name,
					type: socket.handshake.query.device_os,
					version: '0.0.5',
					updated_at: new Date(),
				},
			})
            .then(async () => {
                const devices = await confDb.device.findMany();
                socket.broadcast.emit('setDevices', devices);
            })
            .catch(() => {
				//
            });

			socket.on('connect_error', (err) => {
				console.log(`connect_error due to ${err.message}`);
			});

			socket.on('disconnect', async () => {
				if (uniqueFilter == 'connection') {
					myClientList = myClientList.filter(s => s.id != socket.id);
				} else if (uniqueFilter == 'device') {
					myClientList = myClientList.filter(s => s.client_id != socket.handshake.query.device_id);
				}

				const data: any = {};
				data.sub_id = socket.decoded_token.sub;
				data.time = new Date();
				data.device_id = socket.handshake.query.device_id;
				data.from = socket.request.connection.remoteAddress;
				data.device_name = socket.handshake.query.device_name;
				data.device_type = socket.handshake.query.device_type;
				data.device_os = socket.handshake.query.device_os;
				data.version = '0.0.5';
				data.type = 'Disconnected';
				await storeServerActivity(data);

				Logger.log({
					level: 'http',
					name: 'socket',
					color: 'yellow',
					user: socket.decoded_token.name,
					message: `disconnected, ${updatedList(socket).length} ${uniqueFilter}${updatedList(socket).length == 1
						? ''
						: 's'} ${
						uniqueFilter == 'connection'
							? 'established'
							: 'connected'
					}.`,
				});

				socket.nsp.to(socket.decoded_token.sub).emit('setConnectedDevices', updatedList(socket));
			});

			await base(socket, io);
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
	myClientList.filter(c => c.sub == to).forEach(c => c.io.sockets.emit(event, message));
};

/**
 * @param  {String} to User id or email
 * @param  {String} message
 * @description Send a message to a user on their socket connection.
 */
export const sendMessageTo = (to: any, message: any) => {
	myClientList.filter(c => c.email == to || c.sub == to).forEach(c => c.io.sockets.emit('message', message));
};

/**
 * @param  {String} to User id or email
 * @param  {String} message
 * @description Send a notification to a user on their socket connection.
 */
export const sendNotificationTo = (to: any, message: any) => {
	myClientList.filter(c => c.email == to || c.sub == to).forEach(c => c.io.sockets.emit('notification', message));
};

import { AppState, store, useSelector } from '@server/state/redux';
import { Server, Socket } from 'socket.io';

import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Logger from '../functions/logger';
import { DisplayList, MutedState, PlayState, Song, State } from '../types/music';
import base from '../api/sockets/base';
import { emitData } from '../api/sockets/helpers';
import {
	setBackLog, setCurrentDevice, setCurrentSong, setDisplayList, setIsCurrentDevice,
	setLyrics, setMutedState, setPlaylists, setPlayState, setDuration,
	setQueue, setShowLyrics, setState, setVolume
} from '@server/state/redux/music/actions';
import socketioJwt from 'socketio-jwt';
import { storeServerActivity } from '../api/userData/activity/post';

const io: any = null;
export let myClientList: {
	sub: string;
	email: string;
	id: string;
	address: string;
	connected: boolean;
	disconnected: boolean;
	secure_connection: boolean;
	client_id: string;
	client_name: string;
	client_type: string;
	client_os: string;
	socket: Socket;
}[] = [];

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
			// @ts-ignore
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

		io.once('connection', (socket: { emit: (arg0: any, arg1?: any) => void; }) => {
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
				image: `https://cdn${process.env.ROUTE_SUFFIX ?? ''}.nomercy.tv/img/favicon.ico`,
				created_at: Date.now(),
			});
		});

		const uniqueFilter = 'connection';

		io.on('connection', async (socket) => {
			base(socket);

			const toAll = socket.nsp.to((socket as any).decoded_token.sub);

			if (uniqueFilter == 'connection') {
				myClientList = myClientList.filter(s => s.id != socket.id);
			} else if (uniqueFilter == 'device') {
				myClientList = myClientList.filter(s => s.client_id != socket.handshake.headers.device_id);
			}

			myClientList.push({
				sub: (socket as any).decoded_token.sub,
				email: (socket as any).decoded_token.email,
				id: socket.id,
				address: socket.handshake.address,
				connected: socket.connected,
				disconnected: socket.disconnected,
				secure_connection: socket.handshake.secure,

				client_id: socket.handshake.query.id as string,
				client_os: socket.handshake.query.os as string,
				client_type: socket.handshake.query.type as string,
				client_name: socket.handshake.query.name as string,
				socket,
			});

			const data: any = {
				sub_id: (socket as any).decoded_token.sub,
				time: new Date(),
				from: socket.request.socket.remoteAddress,
				id: socket.handshake.query.id,
				browser: socket.handshake.query.browser,
				os: socket.handshake.query.os,
				device: socket.handshake.query.device,
				type: socket.handshake.query.type,
				name: socket.handshake.query.name,
				version: socket.handshake.query.version,
				activity_type: 'Connected',
			};
			await storeServerActivity(data);

			socket.join((socket as any).decoded_token.sub);

			Logger.log({
				level: 'http',
				name: 'socket',
				color: 'yellow',
				user: (socket as any).decoded_token.name,
				message: `connected, ${updatedList(socket).length} ${uniqueFilter}${updatedList(socket).length == 1
					? ''
					: 's'} ${uniqueFilter == 'connection'
					? 'established'
					: 'connected'
				}.`,
			});
			socket.nsp.to((socket as any).decoded_token.sub).emit('setConnectedDevices', updatedList(socket));

			socket.on('connect_error', (err) => {
				console.log(`connect_error due to ${err.message}`);
			});

			socket.on('disconnect', async () => {
				if (uniqueFilter == 'connection') {
					myClientList = myClientList.filter(s => s.id != socket.id);
				} else if (uniqueFilter == 'device') {
					myClientList = myClientList.filter(s => s.client_id != socket.handshake.query.device_id);
				}

				if (myClientList.length == 0 || store.getState().music.currentDevice == socket.handshake.query.device_id) {
					toAll.emit('setPlayState', emitData(PlayState.paused));
					setPlayState(PlayState.paused);
				} else {
					toAll.emit('setCurrentDevice',
						emitData(myClientList.filter(s => s.client_id != socket.handshake.headers.device_id)[myClientList.length - 1]?.client_id));
				}

				if (myClientList.length == 0) {
					setCurrentDevice('');
					setState(State.idle);
					setCurrentSong(<Song>{});
					setIsCurrentDevice(true);
					setPlayState(PlayState.paused);
					setMutedState(MutedState.unmuted);
					setVolume(0.8);
					setDuration(0);
					setDuration(0);
					setLyrics('');
					setShowLyrics(false);
					setPlaylists([]);
					setQueue([]);
					setBackLog([]);
					setDisplayList(<DisplayList>{});
				}

				const data: any = {
					sub_id: (socket as any).decoded_token.sub,
					time: new Date(),
					from: socket.request.socket.remoteAddress,
					id: socket.handshake.query.id,
					browser: socket.handshake.query.browser,
					os: socket.handshake.query.os,
					device: socket.handshake.query.device,
					type: socket.handshake.query.type,
					name: socket.handshake.query.name,
					version: socket.handshake.query.version,
					activity_type: 'Disconnected',
				};
				await storeServerActivity(data);

				Logger.log({
					level: 'http',
					name: 'socket',
					color: 'yellow',
					user: (socket as any).decoded_token.name,
					message: `disconnected, ${updatedList(socket).length} ${uniqueFilter}${updatedList(socket).length == 1
						? ''
						: 's'} ${uniqueFilter == 'connection'
						? 'established'
						: 'connected'
					}.`,
				});

				socket.nsp.to((socket as any).decoded_token.sub).emit('setConnectedDevices', updatedList(socket));
			});

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

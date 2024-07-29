import SocketIO from 'socket.io';

const sessions: Host[] = [];

export default function(socket: SocketIO.Socket & { decoded_token: { sub: string, name: string } }) {

	socket.on('party', () => {
		console.log('party', socket.decoded_token.name);

		const session = sessions.find(s => s.sub === socket.decoded_token.sub);

		if (session) {
			socket.nsp.to(socket.decoded_token.sub)
				.emit('party', session);
		}

		session?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('party', sessions.find(s => s.sub === socket.decoded_token.sub));
			});
	});

	socket.on('partyTime', (data) => {
		// console.log('partyTime', socket.decoded_token.name);
		sessions.find(s => s.sub === socket.decoded_token.sub)
			?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('partyTime', data);
			});
	});
	socket.on('partyPlay', () => {
		// console.log('partyPlay', socket.decoded_token.name);
		sessions.find(s => s.sub === socket.decoded_token.sub)
			?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('partyPlay');
			});
	});
	socket.on('partyPause', () => {
		// console.log('partyPause', socket.decoded_token.name);
		sessions.find(s => s.sub === socket.decoded_token.sub)
			?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('partyPause');
			});
	});
	socket.on('partySeek', (data) => {
		// console.log('partySeek', socket.decoded_token.name);
		sessions.find(s => s.sub === socket.decoded_token.sub)
			?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('partySeek', data);
			});
	});
	socket.on('partyPlaylistItem', (data) => {
		// console.log('partyPlaylistItem', socket.decoded_token.name);
		sessions.find(s => s.sub === socket.decoded_token.sub)
			?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('partyPlaylistItem', data);
			});
	});
	socket.on('setRemoteId', (data) => {
		// console.log('setRemoteId', socket.decoded_token.name);
		sessions.find(s => s.sub === socket.decoded_token.sub)
			?.clients
			.forEach((c) => {
				socket.to(c.socketId)
					.emit('setRemoteId', data);
			});
	});

	socket.on('createSession', () => {
		console.log('createSession', socket.decoded_token.name);

		let session = sessions.find(s => s.sub === socket.decoded_token.sub);
		if (session) {
			socket.join(session.sessionId);

			socket.nsp.to(session.sessionId)
				.emit('createSession', session);
			return;
		}
		// const sessionId = (new Date()).getTime()
		// 	.toString(36) + Math.random()
		// 	.toString(36)
		// 	.slice(2);
		const sessionId = 'ls6c65vko29bd1uvsgk';
		socket.join(sessionId);

		session = {
			sessionId: sessionId,
			deviceId: socket.handshake.query.id as string,
			socketId: socket.id,
			sub: socket.decoded_token.sub,
			clients: [],
		};

		sessions.push(session);

		socket.nsp.to(sessionId)
			.emit('createSession', session);
	});

	socket.on('destroySession', () => {
		console.log('destroySession', socket.decoded_token.name);

		const session = sessions.find(s => s.sub === socket.decoded_token.sub);

		if (!session) return;

		sessions.splice(sessions.indexOf(session), 1);

	});

	socket.on('leaveSession', (data: string) => {
		console.log('leaveSession', socket.decoded_token.name);

		const session = sessions.find(s => s.sessionId === data);
		if (!session) return;

		session.clients = session.clients.filter(c => c.socketId != socket.id);

		socket.nsp.to(session.sessionId)
			.emit('leaveSession', sessions);
	});

	socket.on('disconnect', () => {
		console.log('disconnect', socket.decoded_token.name);

		const session = sessions.find(s => s.clients.some(c => c.socketId == socket.id));
		if (!session) return;

		const client = session.clients.find(c => c.socketId == socket.id)!;

		client.timeout = setTimeout(() => {

			session.clients = session.clients.filter(c => c.socketId != socket.id);

			socket.nsp.to(session.sessionId)
				.emit('leaveSession', sessions);
		}, 1000 * 130);

		session.clients = session.clients.filter(c => c.socketId != socket.id);

		socket.nsp.to(session.sessionId)
			.emit('leaveSession', sessions);
	});

	socket.on('joinSession', (data: string) => {
		console.log('joinSession', socket.decoded_token.name);

		const session = sessions.find(s => s.sessionId === data);
		if (!session || session.clients.some(c => c.socketId == socket.id)) return;

		session?.clients.push({
			socketId: socket.id,
			deviceId: socket.handshake.query.id as string,
			sub: socket.decoded_token.sub,
		});

		socket.join(session.sessionId);

		socket.nsp.to(session.sessionId)
			.emit('joinSession', session);
	});

	const session = sessions.find(s => s.clients.some(c => c.socketId == socket.id));
	if (!session) return;

	const client = session.clients.find(c => c.socketId == socket.id)!;
	clearTimeout(client.timeout);

}

interface Host {
	sessionId: string;
	socketId: string;
	deviceId: string;
	sub: string;
	clients: Client[];
	timeout?: NodeJS.Timeout;
}

interface Client {
	socketId: string;
	deviceId: string;
	sub: string;
	timeout?: NodeJS.Timeout;
}

//
// setInterval(() => {
// 	// if (sessions.length === 0) return;
// 	console.log('sessions', JSON.stringify(sessions, null, 2));
// }, 1000 * 10);

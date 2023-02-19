/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-var-requires */

import assert from 'assert';
import { Server as _Server } from 'https';
import { Server as __Server } from 'http';
import { Server as ___Server } from 'tls';
import { Socket } from 'net';
import { _extend, inherits } from 'util';
import { create as _create } from 'select-hose';
import { connection as _connection } from 'spdy-transport';
import { EventEmitter } from 'events';
// eslint-disable-next-line no-undef
const debug = require('debug')('spdy:server');

// Node.js 0.8, 0.10 and 0.12 support
Object.assign
  // eslint-disable-next-line no-undef
  = process.versions.modules >= 46
  	? Object.assign // eslint-disable-next-line
    : _extend;

import { handle as _handle, Socket as _Socket, response } from '../spdy';
import { Buffer } from 'buffer';

const proto = {};

function instantiate(base) {
	function Server(options, handler) {
		this._init(base, options, handler);
	}
	inherits(Server, base);

	Server.create = function create(options, handler) {
		return new Server(options, handler);
	};

	Object.keys(proto).forEach((key) => {
		Server.prototype[key] = proto[key];
	});

	return Server;
}

proto._init = function _init(base, options, handler) {
	const state = {};
	this._spdyState = state;

	state.options = options.spdy || {};

	const protocols = state.options.protocols || ['h2', 'spdy/3.1', 'spdy/3', 'spdy/2', 'http/1.1', 'http/1.0'];

	const actualOptions = {
		NPNProtocols: protocols,

		// Future-proof
		ALPNProtocols: protocols,
		...options,
	};

	state.secure = this instanceof ___Server;

	if (state.secure) {
		base.call(this, actualOptions);
	} else {
		base.call(this);
	}

	// Support HEADERS+FIN
	this.httpAllowHalfOpen = true;

	const event = state.secure
		? 'secureConnection'
		: 'connection';

	state.listeners = this.listeners(event).slice();
	assert(state.listeners.length > 0, 'Server does not have default listeners');
	this.removeAllListeners(event);

	if (state.options.plain) {
		this.on(event, this._onPlainConnection);
	} else {
		this.on(event, this._onConnection);
	}

	if (handler) {
		this.on('request', handler);
	}

	debug('server init secure=%d', state.secure);
};

proto._onConnection = function _onConnection(socket) {
	const state = this._spdyState;

	let protocol;
	if (state.secure) {
		protocol = socket.npnProtocol || socket.alpnProtocol;
	}

	this._handleConnection(socket, protocol);
};

proto._handleConnection = function _handleConnection(socket, protocol) {
	const state = this._spdyState;

	if (!protocol) {
		protocol = state.options.protocol;
	}

	debug('incoming socket protocol=%j', protocol);

	// No way we can do anything with the socket
	if (!protocol || protocol === 'http/1.1' || protocol === 'http/1.0') {
		debug('to default handler it goes');
		return this._invokeDefault(socket);
	}

	socket.setNoDelay(true);

	const connection = _connection.create(
		socket,
		{
			protocol: /spdy/u.test(protocol)
				? 'spdy'
				: 'http2',
			isServer: true,
			...(state.options.connection || {}),
		}
	);

	// Set version when we are certain
	if (protocol === 'http2') {
		connection.start(4);
	} else if (protocol === 'spdy/3.1') {
		connection.start(3.1);
	} else if (protocol === 'spdy/3') {
		connection.start(3);
	} else if (protocol === 'spdy/2') {
		connection.start(2);
	}

	connection.on('error', () => {
		socket.destroy();
	});

	const self = this;
	connection.on('stream', (stream) => {
		self._onStream(stream);
	});
};

// HTTP2 preface
const PREFACE = 'PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n';
const PREFACE_BUFFER = Buffer.from(PREFACE);

function hoseFilter(data, callback) {
	if (data.length < 1) {
		return callback(null, null);
	}

	// SPDY!
	if (data[0] === 0x80) {
		return callback(null, 'spdy');
	}

	const avail = Math.min(data.length, PREFACE_BUFFER.length);
	for (let i = 0; i < avail; i++) {
		if (data[i] !== PREFACE_BUFFER[i]) {
			return callback(null, 'http/1.1');
		}
	}

	// Not enough bytes to be sure about HTTP2
	if (avail !== PREFACE_BUFFER.length) {
		return callback(null, null);
	}

	return callback(null, 'h2');
}

proto._onPlainConnection = function _onPlainConnection(socket) {
	const hose = _create(socket, {}, hoseFilter);

	const self = this;
	hose.on('select', (protocol, socket) => {
		self._handleConnection(socket, protocol);
	});

	hose.on('error', (err) => {
		debug('hose error %j', err.message);
		socket.destroy();
	});
};

proto._invokeDefault = function _invokeDefault(socket) {
	const state = this._spdyState;

	for (let i = 0; i < state.listeners.length; i++) {
		state.listeners[i].call(this, socket);
	}
};

proto._onStream = function _onStream(stream) {
	const state = this._spdyState;

	const handle = _handle.create(this._spdyState.options, stream);

	const socketOptions = {
		handle: handle,
		allowHalfOpen: true,
	};

	let socket;
	if (state.secure) {
		socket = new _Socket(stream.connection.socket, socketOptions);
	} else {
		socket = new Socket(socketOptions);
	}

	// This is needed because the `error` listener, added by the default
	// `connection` listener, no longer has bound arguments. It relies instead
	// on the `server` property of the socket. See https://github.com/nodejs/node/pull/11926
	// for more details.
	// This is only done for Node.js >= 4 in order to not break compatibility
	// with older versions of the platform.
	// eslint-disable-next-line no-undef
	if (process.versions.modules >= 46) {
		socket.server = this;
	}

	handle.assignSocket(socket);

	// For v0.8
	socket.readable = true;
	socket.writable = true;

	this._invokeDefault(socket);

	// For v0.8, 0.10 and 0.12
	// eslint-disable-next-line no-undef
	if (process.versions.modules < 46) {
		// eslint-disable-next-line
    this.listenerCount = EventEmitter.listenerCount.bind(this);
	}

	// Add lazy `checkContinue` listener, otherwise `res.writeContinue` will be
	// called before the response object was patched by us.
	if (stream.headers.expect !== undefined && /100-continue/iu.test(stream.headers.expect) && this.listenerCount('checkContinue') === 0) {
		this.once('checkContinue', function (req, res) {
			res.writeContinue();

			this.emit('request', req, res);
		});
	}

	handle.emitRequest();
};

proto.emit = function emit(event, req, res) {
	if (event !== 'request' && event !== 'checkContinue') {
		return EventEmitter.prototype.emit.apply(this, arguments);
	}

	if (!(req.socket._handle instanceof _handle)) {
		debug('not spdy req/res');
		req.isSpdy = false;
		req.spdyVersion = 1;
		res.isSpdy = false;
		res.spdyVersion = 1;
		return EventEmitter.prototype.emit.apply(this, arguments);
	}

	const handle = req.connection._handle;

	req.isSpdy = true;
	req.spdyVersion = handle.getStream().connection.getVersion();
	res.isSpdy = true;
	res.spdyVersion = req.spdyVersion;
	req.spdyStream = handle.getStream();

	debug('override req/res');
	res.writeHead = response.writeHead;
	res.end = response.end;
	res.push = response.push;
	res.writeContinue = response.writeContinue;
	res.spdyStream = handle.getStream();

	res._req = req;

	handle.assignRequest(req);
	handle.assignResponse(res);
	req.method = req.spdyStream.method;

	return EventEmitter.prototype.emit.apply(this, arguments);
};

export const Server = instantiate(_Server);
export const PlainServer = instantiate(__Server);

export function create(base, options, handler) {
	if (typeof base === 'object') {
		handler = options;
		options = base;
		base = null;
	}

	if (base) {
		return instantiate(base).create(options, handler);
	}

	if (options.spdy && options.spdy.plain) {
		return PlainServer.create(options, handler);
	}
	return Server.create(options, handler);

}

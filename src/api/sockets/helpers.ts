import { SocketData } from './audio';

export const emitData = (data: unknown): SocketData => {
	return {
		value: data,
		deviceId: 'server',
	};
};

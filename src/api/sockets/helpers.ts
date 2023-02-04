import { SocketData } from './audio';

export const emitData = (data: any): SocketData => {
	return {
		value: data,
		deviceId: 'server',
	};
};

import { AppState, store, useSelector } from '../../state/redux';
import { setExternalIp, setInternalIp } from '../../state/redux/system/actions';

import { Client } from '@runonflux/nat-upnp';
import Logger from '../../functions/logger';
import axios from 'axios';
import chalk from 'chalk';
import os from 'os';

export const get_external_ip = async () => {
	await axios
		.get<string>('https://api.ipify.org/')
		.then(({ data }) => {
			setExternalIp(data);
		})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'networking',
				color: 'red',
				message: error?.response ?? 'failed to obtain public ip address.',
			});
		});
};

export const get_internal_ip = () => {
	const interfaces = os.networkInterfaces();
	const addresses: any[] = [];
	for (const k in interfaces) {
		for (const k2 in interfaces[k]) {
			const address = interfaces?.[k]?.[k2];
			if (!address) {
				continue;
			}
			addresses.push(address);
		}
	}

	const result = addresses.find(
		a =>
			!a.address.startsWith('127') && !a.address.startsWith('172') && a.family === 'IPv4' && !a.internal && a.netmask == '255.255.255.0'
	);

	setInternalIp(result?.address ?? process.env.INTERNAL_IP);
};

export const portMap = async () => {
	const external_ip = useSelector((state: AppState) => state.system.external_ip);
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);
	const secureExternalPort = useSelector((state: AppState) => state.system.secureExternalPort);

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Trying to add the server to UPnP',
	});

	const client = new Client();
	const result = await client
		.createMapping({
			public: {
				host: external_ip,
				port: secureInternalPort,
			},
			private: {
				host: internal_ip,
				port: secureInternalPort,
			},
			description: 'NoMercy MediaServer',
			protocol: 'tcp',
			ttl: 60 * 60 * 24 * 31,
		})
		.then(() => {
			Logger.log({
				level: 'info',
				name: 'setup',
				color: 'blueBright',
				message: `Successfully mapped the internal port: ${secureInternalPort} to external port: ${secureExternalPort}`,
			});
		})
		.catch(() => {
			const message = `${
				chalk.hex('#bd7b00')`Sorry, Your router does not let me add the record, you need to add a port forward manually.
	    For more information, visit: `
				+ chalk.bold.underline.hex('#c3c3c3')`https://portforward.com/how-to-port-forward`
				+ chalk.hex('#bd7b00')`
	    You can only use the app on your local network until you forward port `
				+ secureInternalPort
				+ chalk.hex('#bd7b00')` to `
				+ secureExternalPort
			}.`;

			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: message,
			});
		});
	// const puip = await client.getMappings();
	// const gateway = await client.getGateway();
	// console.log(puip);

	return result;
};

export const allowedOrigins = [
	'https://*.nomercy.tv',
	`https://*.nomercy.tv:${store.getState().system.secureInternalPort}`,
	'wss://*.nomercy.tv',
	'ws://*.nomercy.tv',
	'https://app.nomercy.tv',
	'https://beta.nomercy.tv',
	'https://dev.nomercy.tv',
	'https://node.nomercy.tv',
	'http://localhost:3000',
	'http://localhost:5173',
	`https://${get_internal_ip()}:3000`,
	`https://${get_internal_ip()}:5173`,
	`http://${get_internal_ip()}:3000`,
	`http://${get_internal_ip()}:5173`,
];

export const socketCors = {
	cors: {
		origin: allowedOrigins,
		methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
		credentials: true,
		exposedHeaders: ['Content-Length', 'Range'],
		acceptRanges: 'byes',
	},
};

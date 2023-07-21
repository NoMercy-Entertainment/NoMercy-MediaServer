import { AppState, useSelector } from '@server/state/redux';

import Logger from '@server/functions/logger';
import ping from '../../loaders/ping';
import serverRunning from '../../loaders/serverRunning';

export default () => {
	const socket = useSelector((state: AppState) => state.system.socket);
	const httpsServer = useSelector((state: AppState) => state.system.server);
	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	httpsServer.close();

	httpsServer
		.listen(secureInternalPort, '0.0.0.0', () => {
			serverRunning();
			ping();
		})
		.on('error', (error) => {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'magentaBright',
				message: `Sorry Something went wrong starting the secure server: ${JSON.stringify(error, null, 2)}`,
			});
			process.exit(1);
		});

	(socket as any).connect(httpsServer);
};

import { AppState, useSelector } from '../state/redux';

import chalk from 'chalk';

export const serverRunning = () => {
	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	const g = () => chalk.hex('#00a10d');
	const cc = () => chalk.hex('#cccccc');
	const c3 = () => chalk.bold.hex('#c3c3c3');
	const a7 = () => chalk.hex('#5ffa71');
	const link = () => chalk.bold.underline.hex('#c3c3c3');

	console.log(
		g()`╔══════════════════════════════════════════════╗\n` +
		g()`║     `+		a7()`Secure server running: on port: `	+		c3()`${secureInternalPort}`.replace(', ', '')	+		g()`     ║\n` +
		g()`║       `+		cc()`visit: `							+	  link()`https://app.nomercy.tv`					+		g()`          ║\n` +
		g()`╚══════════════════════════════════════════════╝`
	);
};

export default serverRunning;

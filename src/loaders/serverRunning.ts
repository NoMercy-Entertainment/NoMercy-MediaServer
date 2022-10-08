import chalk from 'chalk';
import { AppState, useSelector } from '../state/redux';

export const serverRunning = () => {
	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	console.log(chalk.hex('#00a10d')`╔════════════════════════════════════════════════╗`);

	console.log(
		chalk.hex('#00a10d')`║     `,
		chalk.hex('#5ffa71')`Secure server running: on port:`,
		chalk.bold.hex('#c3c3c3')`${secureInternalPort}`.replace(', ', ''),
		chalk.hex('#00a10d')`     ║`
	);
	console.log(
		chalk.hex('#00a10d')`║       `,
		chalk.hex('#cccccc')`visit:`,
		chalk.bold.underline.hex('#c3c3c3')`https://app.nomercy.tv`,
		chalk.hex('#00a10d')`          ║`
	);

	console.log(chalk.hex('#00a10d')`╚════════════════════════════════════════════════╝ `);
};

export default serverRunning;

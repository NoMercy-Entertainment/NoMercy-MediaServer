import chalk from 'chalk';
import winston from 'winston';

const myCustomLevels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6,
	socket: 3,
	cyan: 2,
};

winston.addColors({
	socket: 'magenta',
	cyan: 'cyan',
});

const transports: any[] = [];
// if (process.env.NODE_ENV !== 'development') {
// 	transports.push(new winston.transports.Console());
// } else {
transports.push(
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			winston.format.splat(),
			winston.format.json(),

			winston.format.printf(
				info =>
					`${spacer(
						`${info.color ? color(info.color, info.name) : info.level} ${dateFormat(Date.now(), 'Y-M-D hh:m')}`,
						20
					)}: ${info.message}`
			)
		),
	})
);
// }

const color = (color: string, msg: string) => {
	switch (color) {
	case 'black':
		return chalk.black(msg);
	case 'red':
		return chalk.red(msg);
	case 'green':
		return chalk.green(msg);
	case 'yellow':
		return chalk.yellow(msg);
	case 'blue':
		return chalk.blue(msg);
	case 'magenta':
		return chalk.magenta(msg);
	case 'cyan':
		return chalk.cyan(msg);
	case 'blackBright':
		return chalk.blackBright(msg);
	case 'redBright':
		return chalk.redBright(msg);
	case 'greenBright':
		return chalk.greenBright(msg);
	case 'yellowBright':
		return chalk.hex('#BFB900')(spacer(msg, 10));
	case 'blueBright':
		return chalk.blueBright(msg);
	case 'magentaBright':
		return chalk.magentaBright(msg);
	case 'cyanBright':
		return chalk.cyanBright(msg);
	case 'whiteBright':
		return chalk.whiteBright(msg);
	default:
		return chalk.white(msg);
	}
};

const Logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'http',
	levels: myCustomLevels,
	transports,
});

export default Logger;

const spacer = (text: string, rightpadding: number) => {
	const spacing: any[] = [];
	spacing.push(text);
	for (let i = 0; i < rightpadding - text.length; i++) {
		spacing.push('');
	}
	return spacing.join(' ');
};


export const dateFormat = (date: Date | number, format: string) => {
	// @ts-expect-error
	return (new Date(date)).format(format);
};
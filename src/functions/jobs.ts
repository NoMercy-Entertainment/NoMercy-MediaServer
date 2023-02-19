import { sleep } from '../functions/dateTime';

export const sum = ({ a, b, jid }: { a: number; b: number; jid: null }) => {
	if (jid) {
		console.log(`job id ${jid} ${a} * ${b}`);
	}

	sleep(2000);

	return a * b;
};

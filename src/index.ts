import boot from './functions/boot';
import env from 'dotenv';

env.config();

globalThis.allowedUsers = [];

(async () => {
	await boot();
})();

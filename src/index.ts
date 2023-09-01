import './functions/auth/config';

import boot from './functions/boot';
import env from 'dotenv';

env.config();

(async () => {
	await boot();
})();

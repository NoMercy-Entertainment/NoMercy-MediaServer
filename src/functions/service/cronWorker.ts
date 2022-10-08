import { queDb } from '../../database/config';
import schedule from 'node-schedule';

export const cronWorker = async () => {

    const jobs = await queDb.queueJob.findMany({
        where: {
            queue: 'cron',
        }
    });
    
    for (const job of jobs) {
        schedule.scheduleJob(job.cron!, async () => {
            
            const { file, fn: func, args } = JSON.parse(job.payload ?? '{}');
            
            const req = require(file);
            if (typeof req[func] == 'function') {
                try {
                    console.log('The answer to life, the universe, and everything!');
                    // await req[func]({ ...args, job: job })
                    //     .then((result: any) => console.log({ job, result }));
                } catch (error) {
                    console.log({ job, error });
                }
            } else {
                const error = 'function does not exist';

                console.log(error);
            }
        });
    }
}

export default cronWorker;

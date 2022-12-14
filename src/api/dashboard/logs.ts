import { Request, Response } from "express";
import { logLevels, logNames, winstonLog } from "../../state";

import { KAuthRequest } from "types/keycloak";
import Logger from "../../functions/logger";
import winston from "winston";
import { writeFileSync } from "fs";

export const logs = async (req: Request, res: Response) => {

	const { from, until, limit, start, order, level, name, message, user } = req.body;

	const options: winston.QueryOptions = {
		// @ts-ignore
		from: from ?? new Date() - 24 * 60 * 60 * 1000,
		until: until ?? new Date(),
		limit: limit ?? 1000,
		start: start ?? 0,
		order: order ?? "desc",
		fields: ["name", "message", "level", "timestamp", "user"],
	};

    try {
        Logger.query(options, function (err, results) {

            if(!results || !Array.isArray(results?.file)) {
                return res.json([]);
            }

            const filteredResults = results.file.map((r, index) => ({...r, id: index, user: r.user ?? ''}))
                .filter((r) => !r.message?.includes('/api/dashboard/manage/logs') ?? true)
                .filter((r) => level ? r.level.includes(level) : true)
                .filter((r) => name?.length > 0 ? name.includes(r.name) : true)
                .filter((r) => message ? r.message.toLowerCase().includes(message.toLowerCase()) : true)
                .filter((r) => user ? r.user?.includes(user) ?? false : true)
    
            return res.json(filteredResults);
        });
        
    } catch (error) {
        Logger.log({
            level: 'error',
            name: logNames['access'],
            color: 'magentaBright',
            message: `Error fetching logs`
        });
        return res.json({
            status: 'error',
            message: `Something went wrong fetching logs: ${error}`
        })
    }
};

export const deleteLogs  = async (req: Request, res: Response) => {

    try {
        writeFileSync(winstonLog, '');
        
        Logger.log({
            level: 'info',
            name: logNames['app'],
            color: 'magentaBright',
            user: (req as KAuthRequest).kauth.grant?.access_token.content.name,
            message: `Cleared the logs`
        });

        return res.json({
            status: 'ok',
            message: `Logs have been deleted`
        })
            
    } catch (error) {
        Logger.log({
            level: 'error',
            name: logNames['system'],
            color: 'red',
            message: `Error deleting logs`
        });
        return res.json({
            status: 'error',
            message: `Something went wrong deleting logs: ${error}`
        });
    }
};

export const logOptions = async (req: Request, res: Response) => {

    return res.json({
        logLevels: logLevels,
        logNames: logNames,
    });
}
import { AbleUser, AddUser, notificationSettings, removeUser, updateUserPermissions, userPermissions } from '../dashboard/users';
import {
	addLibraryFolder,
	addNewItem as addLibrary,
	createLibrary,
	deleteLibrary,
	deleteLibraryFolder,
	encodeLibrary,
	libraries,
	rescanLibrary,
	sortLibrary,
	updateLibrary
} from '../dashboard/library';
import { configuration, createConfiguration, updateConfiguration } from '../dashboard/configuration';
import { countries, language } from '../dashboard/general';
import { createEncoderProfiles, encoderProfiles, updateEncoderProfiles } from '../dashboard/encoder';
import { createSpecials, searchSpecials, special, specialz, updateSpecials } from '../dashboard/specials';
import { deleteLogs, logOptions, logs } from '../dashboard/logs';
import { deleteTask, encoderQueue, pauseTasks, resumeTasks, runningTaskWorkers, tasks } from '../dashboard/tasks';
import { editMiddleware, permissions } from '../middleware/permissions';
import { metadatas, serverInfo, serverPaths } from '../dashboard/serverInfo';
import { startServer, stopServer } from '../dashboard/server';

import addFiles from '../dashboard/contentManagement/addFiles';
import { deleteDevices } from '../userData/devices/delete';
import deleteServerActivity from '../userData/activity/delete';
import devices from '../userData/devices/get';
import express, { Request, Response } from 'express';
import { group } from '../routeGroup';
import serverActivity from '../userData/activity/get';
import { storeServerActivity } from '../userData/activity/post';
import directoryTree, { fileList } from '../dashboard/directorytree';

// import addDevices from '../userData/devices/post';


const router = express.Router();

router.get('/configuration/languages', language);
router.get('/configuration/countries', countries);

router.post('/manage/users/notificationsettings', notificationSettings);

router.get('/permissions', permissions);

router.use(
	'/',
	editMiddleware,
	group((route) => {
		route.post('/', (req, res) => {
			return res.json({
				status: 'ok',
			});
		});

		route.get('/users', AddUser);
		route.get('/users/able', AbleUser);
		route.delete('/users', removeUser);

		route.get('/users/permissions', userPermissions);
		route.patch('/users/permissions', updateUserPermissions);

		route.get('/encoderprofiles', encoderProfiles);
		route.post('/encoderprofiles', createEncoderProfiles);
		route.patch('/encoderprofiles', updateEncoderProfiles);

		route.get('/specials', specialz);
		route.get('/special/:id', special);
		route.post('/specials', createSpecials);
		route.patch('/specials', updateSpecials);
		route.post('/specials/search', searchSpecials);

		route.get('/libraries', libraries);
		route.patch('/libraries', updateLibrary);
		route.patch('/libraries/sort', sortLibrary);
		route.post('/libraries', createLibrary);
		route.patch('/libraries/:id', updateLibrary);
		route.post('/libraries/:id/rescan', rescanLibrary);
		route.delete('/libraries/:id', deleteLibrary);
		route.post('/libraries/:id', addLibrary);
		route.delete('/libraries/:id/folders/:folderId', deleteLibraryFolder);
		route.post('/libraries/:id/folders', addLibraryFolder);

		route.get('/configuration', configuration);
		route.post('/configuration', createConfiguration);
		route.patch('/configuration', updateConfiguration);

		route.get('/server/info', serverInfo);
		route.get('/server/paths', serverPaths);
		route.get('/server/setup', (req: Request, res: Response) => {
			return res.json({
				status: 'ok',
				data: {
					setup_complete: true,
				},
			});
		});

		route.get('/activity', serverActivity);
		route.post('/activity/create', storeServerActivity);
		route.post('/activity/delete', deleteServerActivity);

		route.get('/devices', devices);
		// route.get('/devices', addDevices);
		route.delete('/devices/delete', deleteDevices);

		route.get('/tasks', tasks);
		route.delete('/tasks', deleteTask);
		route.post('/tasks/pause', pauseTasks);
		route.post('/tasks/resume', resumeTasks);
		route.get('/tasks/runners', runningTaskWorkers);
		route.get('/tasks/queue', encoderQueue);

		route.post('/server/start', startServer);
		route.post('/server/stop', stopServer);

		route.post('/logs', logs);
		route.post('/logs/delete', deleteLogs);
		route.post('/logs/options', logOptions);


		route.post('/encode/:id', encodeLibrary);
		route.post('/addFiles', addFiles);
		route.post('/directorytree', directoryTree);
		route.post('/fileList', fileList);
		route.post('/metadata', metadatas);
	})
);

export default router;

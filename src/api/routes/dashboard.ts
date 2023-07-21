import {
	AddUser,
	notificationSettings,
	removeUser,
	updateUserPermissions,
	userPermissions
} from '../dashboard/users';
import {
	addNewItem,
	createLibrary,
	deleteLibrary,
	encodeLibrary,
	librarie,
	rescanLibrary,
	updateLibrary
} from '../dashboard/library';
import {
	configuration,
	createConfiguration,
	updateConfiguration
} from '../dashboard/configuration';
import { countries, language } from '../dashboard/general';
import {
	createEncoderProfiles,
	encoderProfiles,
	updateEncoderProfiles
} from '../dashboard/encoder';
import { createSpecials, searchSpecials, special, specialz, updateSpecials } from '../dashboard/specials';
import {
	deleteLogs,
	logOptions,
	logs
} from '../dashboard/logs';
import {
	deleteTask,
	encoderQueue,
	pauseTasks,
	resumeTasks,
	runningTaskWorkers,
	tasks
} from '../dashboard/tasks';
import directoryTree, { fileList } from '../dashboard/directoryTree';
import {
	editMiddleware,
	permissions
} from '../middleware/permissions';
import {
	metadatas,
	serverInfo,
	serverPaths
} from '../dashboard/serverInfo';
import {
	startServer,
	stopServer
} from '../dashboard/server';

import addFiles from '../dashboard/contentManagement/addFiles';
import { deleteDevices } from '../userData/devices/delete';
import deleteServerActivity from '../userData/activity/delete';
import devices from '../userData/devices/get';
import express from 'express';
import { group } from '../routeGroup';
import serverActivity from '../userData/activity/get';
import {
	storeServerActivity
} from '../userData/activity/post';

// import addDevices from '../userData/devices/post';


const router = express.Router();

router.post('/general/languages', language);
router.post('/general/countries', countries);

router.post('/manage/users/notificationsettings', notificationSettings);

router.get('/permissions', permissions);

router.use(
	'/manage',
	editMiddleware,
	group((route) => {
		route.post('/', (req, res) => {
			return res.json({
				status: 'ok',
			});
		});

		route.post('/users', AddUser);
		route.post('/users/delete', removeUser);

		route.post('/users/permissions', userPermissions);
		route.post('/users/permissions/update', updateUserPermissions);

		route.post('/encoderprofiles', encoderProfiles);
		route.post('/encoderprofiles/create', createEncoderProfiles);
		route.post('/encoderprofiles/update', updateEncoderProfiles);

		route.post('/specials', specialz);
		route.post('/special/:id', special);
		route.post('/specials/create', createSpecials);
		route.post('/specials/update', updateSpecials);
		route.post('/specials/search', searchSpecials);

		route.post('/libraries', librarie);
		route.patch('/libraries', updateLibrary);
		route.post('/libraries/create', createLibrary);
		route.post('/libraries/update', updateLibrary);
		route.post('/libraries/:id/rescan', rescanLibrary);
		route.post('/libraries/:id/delete', deleteLibrary);
		route.post('/libraries/:id/add', addNewItem);

		route.post('/configuration', configuration);
		route.post('/configuration/create', createConfiguration);
		route.post('/configuration/update', updateConfiguration);

		route.post('/serverinfo', serverInfo);
		route.post('/serverpaths', serverPaths);

		route.post('/serveractivity', serverActivity);
		route.post('/serveractivity/create', storeServerActivity);
		route.post('/serveractivity/delete', deleteServerActivity);

		route.post('/devices', devices);
		// route.post('/devices', addDevices);
		route.post('/devices/delete', deleteDevices);

		route.post('/tasks', tasks);
		route.post('/tasks/delete', deleteTask);
		route.post('/tasks/pause', pauseTasks);
		route.post('/tasks/resume', resumeTasks);
		route.post('/tasks/runners', runningTaskWorkers);
		route.post('/tasks/queue', encoderQueue);

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

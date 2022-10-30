import { AddUser, notificationSettings, removeUser, updateUserPermissions, userPermissions } from '../dashboard/users'
import { addNewItem, createLibrary, deleteLibrary, libraries, rescanLibrary, updateLibrary } from '../dashboard/library'
import { configuration, createConfiguration, updateConfiguration } from '../dashboard/configuration'
import { countries, languages } from '../dashboard/general'
import { createEncoderProfiles, encoderProfiles, updateEncoderProfiles } from '../dashboard/encoder'
import { deleteLogs, logOptions, logs } from '../dashboard/logs'
import { deleteTask, pauseTasks, resumeTasks, runningTaskWorkers, tasks } from '../dashboard/tasks'
import { devices, metadata, serverActivity, serverInfo, serverPaths } from '../dashboard/serverInfo'
import { editMiddleware, permissions } from '../middlewares/permissions'
import { startServer, stopServer } from '../dashboard/server'

import directorytree from '../dashboard/directorytree'
import express from 'express'
import { group } from '../routeGroup'

const router = express.Router();

router.get("/general/languages", languages);
router.get("/general/countries", countries);

router.patch("/manage/users/notificationsettings", notificationSettings);

router.get("/permissions", permissions);

router.use(
	"/manage",
	editMiddleware,
	group((route) => {
		route.get("/", (req, res) => {
			return res.json({
				status: "ok",
			});
		});

		route.post("/users", AddUser);
		route.delete("/users", removeUser);

		route.get("/users/permissions", userPermissions);
		route.patch("/users/permissions", updateUserPermissions);

		route.get("/encoderprofiles", encoderProfiles);
		route.post("/encoderprofiles", createEncoderProfiles);
		route.patch("/encoderprofiles", updateEncoderProfiles);

		route.get("/libraries", libraries);
		route.post("/libraries", createLibrary);
		route.patch("/libraries", updateLibrary);
		route.post("/libraries/:id/rescan", rescanLibrary);
		route.post("/libraries/:id/delete", deleteLibrary);
		route.post("/libraries/:id/add", addNewItem);

		route.get("/directorytree", directorytree);

		route.get("/configuration", configuration);
		route.post("/configuration", createConfiguration);
		route.patch("/configuration", updateConfiguration);

		route.get("/serverinfo", serverInfo);
		route.get("/serverpaths", serverPaths);
		route.get("/serveractivity", serverActivity);

		route.get("/tasks", tasks);
		route.post("/tasks", deleteTask);
		route.post("/tasks/pause", pauseTasks);
		route.post("/tasks/resume", resumeTasks);
		route.get("/tasks/runners", runningTaskWorkers);

		route.post("/server/start", startServer);
		route.post("/server/stop", stopServer);

		route.get("/devices", devices);
		route.get("/metadata", metadata);
		route.post("/logs", logs);
		route.post("/logs/delete", deleteLogs);
		route.get("/logoptions", logOptions);
	})
);

export default router;

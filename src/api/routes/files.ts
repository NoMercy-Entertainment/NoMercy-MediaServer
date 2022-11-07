import { Request, Response } from "express";
import { imagesPath, publicPath, subtitlesPath, transcodesPath } from "../../state";

import { confDb } from "../../database/config";
import { existsSync } from "fs";
import express from "express";
import { staticPermissions } from "../middleware/permissions";
import { unique } from "../../functions/stringArray";

const router = express.Router();

export const serveImagesPath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/).some((p) => p.startsWith("."))) {
		return res.status(401).json({
			status: "error",
			message: "Access denied",
		});
	}
	if (existsSync(imagesPath + "/" + req.params[0])) {
		return res.sendFile(imagesPath + "/" + req.params[0]);
	} else {
		return res.status(404).end();
	}
};

export const serveTranscodePath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/).some((p) => p.startsWith("."))) {
		return res.status(401).json({
			status: "error",
			message: "Access denied",
		});
	}
	if (existsSync(transcodesPath + "/" + req.params[0])) {
		return res.sendFile(transcodesPath + "/" + req.params[0]);
	} else {
		return res.status(404).end();
	}
};

export const serveSubtitlesPath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/).some((p) => p.startsWith("."))) {
		return res.status(401).json({
			status: "error",
			message: "Access denied",
		});
	}
	if (existsSync(subtitlesPath + "/" + req.params[0])) {
		return res.sendFile(subtitlesPath + "/" + req.params[0]);
	} else {
		return res.status(404).end();
	}
};

export const servePublicPath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/).some((p) => p.startsWith("."))) {
		return res.status(401).json({
			status: "error",
			message: "Access denied",
		});
	}
	if (existsSync(publicPath + "/" + req.params[0])) {
		return res.sendFile(publicPath + "/" + req.params[0]);
	} else {
		return res.status(404).end();
	}
};

export const serveLibraryPaths = async (app) => {
	await confDb.folder
		.findMany({
			include: {
				Libraries: true,
			},
		})
		.then((folders) => {
			unique(folders, "path")
				.filter((r) => r.path)
				.map((r) => {
					app.get(`/${r.Libraries[0].libraryId}/*`, staticPermissions, function (req, res) {
						if (req.params[0].split(/[\\\/]/).some((p) => p.startsWith("."))) {
							return res.status(401).json({
								status: "error",
								message: "Access denied",
							});
						}
						return res.sendFile(r.path + "/" + req.params[0]);
					});
				});
		});
};

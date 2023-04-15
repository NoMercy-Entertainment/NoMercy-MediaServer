import dirTree, { DirectoryTree, DirectoryTreeOptions } from 'directory-tree';
import { existsSync, readFileSync, writeFile } from 'fs';
import path from 'path';

import { fileChangedAgo } from '../../functions/dateTime';
import Logger from '../../functions/logger';
import { chunk, jsonToString, sortBy } from '../../functions/stringArray';
import { cpuCores } from '../../functions/system';
import { cachePath } from '@/state';
import { FolderList, ParsedFileList, parseFileName, parseFolderName } from './filenameParser';

interface FileListProps {
	folder: string;
	recursive?: boolean;
	filter?: string[];
	foldersOnly?: boolean;
	ignoreBaseFilter?: boolean;
}

export default async ({
	folder,
	recursive = false,
	filter = ['mp4', 'mkv', 'avi', 'ogv', 'm3u8', 'webm', 'vp9', 'mkv'],
	foldersOnly = false,
	ignoreBaseFilter = false,
}: FileListProps): Promise<FileList> => {
	const fileList = new FileList({ folder, recursive, filter, foldersOnly, ignoreBaseFilter });
	await fileList.start();

	return fileList;
};

interface IObj {
	[key: string]: any;
}

export class FileList {
	folder: string;
	array: any[] = [];
	tree: DirectoryTree<IObj> = <DirectoryTree<IObj>>{};
	recursive: boolean;
	filter: string[];
	foldersOnly: boolean;
	ignoreBaseFilter: boolean;
	hasCache = false;
	folderFile: string;
	ignoreRegex = /video_.*|audio_.*|subtitles|scans|cds.*|ost|album|music|original|fonts|thumbs|metadata|NCED|NCOP|~/iu;

	constructor({
		folder,
		recursive = false,
		filter = ['mp4', 'mkv', 'avi', 'ogv', 'm3u8', 'webm', 'vp9'],
		foldersOnly = false,
		ignoreBaseFilter = false,
	}: FileListProps) {
		this.folder = folder;
		this.recursive = recursive;
		this.filter = filter;
		this.foldersOnly = foldersOnly;
		this.ignoreBaseFilter = ignoreBaseFilter;
		this.folderFile = path.join(cachePath, 'temp', `${this.folderToFileName(folder)}.json`);
	}

	folderToFileName(folder: string): string {
		return folder?.replace(/[\/\\]/gu, '_')?.replace(':', '_');
	}

	folderList(folder: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {

			const options: DirectoryTreeOptions = {
				extensions: new RegExp(`\\.(${this.filter.join('|')})$`, 'u'),
				exclude: this.ignoreBaseFilter
					? undefined
					: this.ignoreRegex,
				normalizePath: true,
				depth: this.recursive
					? undefined
					: 1,
				followSymlinks: true,
				attributes: [
					'mode',
					'nlink',
					'uid',
					'gid',
					'type',
					'extension',
					'atimeMs',
					'mtimeMs',
					'ctimeMs',
					'birthtimeMs',
					'size',
				],
			};
			if (!this.recursive) {
				options.attributes = [
					'mode',
					'nlink',
					'uid',
					'gid',
					'type',
					'extension',
					'atimeMs',
					'mtimeMs',
					'ctimeMs',
					'birthtimeMs',
				];
			}

			try {
				this.tree = dirTree(folder, options);

				resolve();
			} catch (error) {
				return reject(error);
			}
		});
	}

	start(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				if (existsSync(this.folderFile) && fileChangedAgo(this.folderFile, 'days') < 50) {
					try {
						this.tree = JSON.parse(readFileSync(this.folderFile, 'utf-8'));
						return resolve();
					} catch (error) {
						return reject(error);
					}
				}

				Logger.log({
					level: 'info',
					name: 'job',
					color: 'magentaBright',
					message: `Starting file listing folder: ${this.folder}`,
				});

				this.folderList(this.folder).then(() => {
					Logger.log({
						level: 'info',
						name: 'job',
						color: 'magentaBright',
						message: `File listing done folder: ${this.folder}`,
					});

					const result = {
						...this.tree,
						children: sortBy(this.tree?.children ?? [], 'path'),
					};

					writeFile(this.folderFile, jsonToString(result), () => resolve());
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	getList(): dirTree.DirectoryTree<IObj> {
		return this.tree;
	}

	getFolders(): dirTree.DirectoryTree<IObj> {
		return this.tree;
	}

	getParsedFolders(): FolderList[] {
		if (!this?.tree?.children) return [];
		return sortBy<DirectoryTree<IObj>>(this.tree.children ?? [], 'name')
			?.map(f => parseFolderName(f))
			.filter(f => f.title != null || f.name != null);
	}

	mapFiles(tree: DirectoryTree<IObj>): void {
		tree?.children?.map((f) => {
			if (f.type == 'file') {
				this.array.push(f);
			} else {
				this.mapFiles(f);
			}
		});
	}

	getFiles(): FolderList[] {
		this.mapFiles(this.tree);
		return this.array;
	}

	async getParsedFiles(isTvShow = false): Promise<ParsedFileList[]> {
		this.mapFiles(this.tree);

		const newArray: ParsedFileList[] = [];

		for (const array of chunk(this.array, cpuCores * 1)) {

			const promises: Promise<any>[] = [];

			for (const item of array) {
				promises.push(parseFileName(item, isTvShow).then(data => newArray.push(data)));
			}

			await Promise.all(promises);
		}

		const faultyFiles = newArray.filter(f => !f.ffprobe);

		for (const faultyFile of faultyFiles) {
			if (faultyFile.extension == '.m3u8') {
				const path = faultyFile.path?.replace(/(.+[\\\/])/u, '$1');
				console.log(path);
				// rmSync(path, { recursive: true});
			} else if (faultyFile.extension == '.mp4') {
				const path = faultyFile.path?.replace(/(\w.+[\\\/])/u, '$1');
				console.log(path);
				// rmSync(path, { recursive: true});
			}
		}

		return newArray.filter(f => (f.title != null || f.name != null) && f.ffprobe);
	}
}

import { VideoFFprobe } from '../../../encoder/ffprobe/ffprobe';
import fs from 'fs';

const makeAttachmentsFile = function (attachments: VideoFFprobe['streams']['attachments'], location: string|null = null) {
	const attachmentsFile = `${location}/fonts.json`;
	if (attachments.length > 0) {
		const data: any[] = [];

		attachments.map((c) => {
			data.push({
				file: c.filename.toLowerCase(),
				mimeType: c.mimetype,
			});
		});
		fs.writeFileSync(attachmentsFile, JSON.stringify(data));
	}
};

export default makeAttachmentsFile;

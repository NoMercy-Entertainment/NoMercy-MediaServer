export const getQualityTag = function (ffprobe) {
	const sizes = ffprobe.streams.video.map((s) => {
		if (s.width >= 600 && s.width < 1200) {
			return 'SD';
		}
		if (s.width >= 1200 && s.width < 1900) {
			return 'HD720p';
		}
		if (s.width >= 1900 && s.width < 2000) {
			return 'HD1080p';
		}
		if (s.width >= 2000 && s.width < 3000) {
			return '2K';
		}
		if (s.width >= 3000) {
			return '4K';
		}
		return 'Unknown';
	});

	return sizes.join(',');
};

export const getQualities = function (ffprobe) {
	let hq = JSON.parse(process.env.CONFIG as string).folderRoots.find(
		f =>
			f.path.replace(/\/$/u, '')
			== ffprobe.format.filename
				.replace(/[\\\/][\w\s\._\-?()']*$/u, '')
				.replace(/[\w\s\._\-?()']*$/u, '')
				.replace(/\\/gu, '/')
				.replace(/\/$/u, '')
	)?.hq;

	if (!hq) {
		hq = JSON.parse(process.env.CONFIG as string).folderRoots.find(
			f =>
				f.path.replace(/\/$/u, '')
				== ffprobe.format.filename
					.replace(/[\\\/][\w\s\._\-?()]*$/u, '')
					.replace(/\\/gu, '/')
					.replace(/\/$/u, '')
		)?.hq;
	}

	let qualities = JSON.parse(process.env.CONFIG as string)
		.encodingQualities.filter(q => q.enabled)
		.filter(
			q =>
				q.width == ffprobe.streams.video[0].width
				|| q.width < ffprobe.streams.video[0].width + 100
		)
		.filter(q => (q.width < 2000 && !hq) || hq);

	if (qualities.length == 0) {
		qualities = JSON.parse(
			process.env.CONFIG as string
		).encodingQualities.filter(
			q =>
				q.width == ffprobe.streams.video[0].width
				|| (q.width > ffprobe.streams.video[0].width - 100
					&& q.width < ffprobe.streams.video[0].width + 100)
		);
	}
	if (qualities.length == 0) {
		qualities = JSON.parse(process.env.CONFIG as string)
			.encodingQualities.filter(q => q.enabled)
			.filter(
				q =>
					q.height == ffprobe.streams.video[0].height
					|| (q.height > ffprobe.streams.video[0].height - 100
						&& q.height < ffprobe.streams.video[0].height + 100)
			);
	}
	// if(qualities.length == 0){
	//     qualities = JSON.parse((process.env.CONFIG as string)).encodingQualities.filter(q => q.height == ffprobe.streams.video[0].height || (q.height > ffprobe.streams.video[0].height - 100 && q.height < ffprobe.streams.video[0].height + 100))
	// }

	return qualities;
};

export default {
	getQualityTag,
	getQualities,
};

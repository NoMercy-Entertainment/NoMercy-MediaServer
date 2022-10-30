export const createDataImageURL = (data, format) => {
	const base64String = Buffer.from(data).toString('base64');

	return `data:${format};base64,${base64String}`;
};

export default createDataImageURL;

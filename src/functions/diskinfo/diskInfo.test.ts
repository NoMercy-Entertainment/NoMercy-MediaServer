import getDiskInfo from './diskinfo';

describe('getDiskInfo', () => {
	it('should return an array of drive information', () => {
		const driveInfo = getDiskInfo();
		expect(Array.isArray(driveInfo)).toBe(true);
		expect(driveInfo.length).toBeGreaterThan(0);
		expect(driveInfo[0]).toHaveProperty('filesystem');
		expect(driveInfo[0]).toHaveProperty('blocks');
		expect(driveInfo[0]).toHaveProperty('used');
		expect(driveInfo[0]).toHaveProperty('available');
		expect(driveInfo[0]).toHaveProperty('capacity');
		expect(driveInfo[0]).toHaveProperty('mounted');
	});
});

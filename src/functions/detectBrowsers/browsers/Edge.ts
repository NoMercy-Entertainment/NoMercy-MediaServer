let CMD;

try {
	CMD = require.resolve('edge-launcher/dist/x86/MicrosoftEdgeLauncher.exe');
} catch (e) {
	CMD = '';
}

export default {
	name: 'Edge',
	DEFAULT_CMD: {
		win32: [CMD],
	},
	ENV_CMD: 'EDGE_BIN',
};

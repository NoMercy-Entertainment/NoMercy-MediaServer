

const client_id = '4c01e10681b24fc8b18a2f9a1f7bdbfb';
const client_secret = '6ee29fb8093046aeaecebaa6f4ba3d3b';

export async function getAccessToken(): Promise<string> {
	const data = new URLSearchParams();
	data.append('client_id', client_id);
	data.append('grant_type', 'client_credentials');

	const x = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${btoa(`${client_id}:${client_secret}`).toString('base64')}`,
		},
		body: data,
	});

	return await x.json();
};

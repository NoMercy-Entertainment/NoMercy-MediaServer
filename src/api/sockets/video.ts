import { confDb } from '../../database/config';

export default function (socket: any, io: any) {
	socket.on('setTime', async (data: any) => {
		if (data.tmdb_id && data.video_id) {
			const progressInsert = {
				sub_id: socket.decoded_token.sub,
				movieId: data.type == 'movie'
					? parseInt(data.tmdb_id, 10)
					: undefined,
				tvId: data.type == 'tv'
					? parseInt(data.tmdb_id, 10)
					: undefined,
				videoFileId: parseInt(data.video_id, 10),
				audio: data.audio,
				subtitle: data.subtitle,
				subtitleType: data.subtitle_type,
				time: parseInt(data.time, 10),
			};
			// console.log('setTime', progressInsert);

			try {
				await confDb.userData.upsert({
					where: {
						movieId_videoFileId_sub_id: data.type == 'movie'
							? {
								sub_id: socket.decoded_token.sub,
								movieId: parseInt(data.tmdb_id, 10),
								videoFileId: data.video_id,
							}
							: undefined,
						tvId_videoFileId_sub_id: data.type == 'tv'
							? {
								sub_id: socket.decoded_token.sub,
								tvId: parseInt(data.tmdb_id, 10),
								videoFileId: data.video_id,
							}
							: undefined,
					},
					update: progressInsert,
					create: progressInsert,
				});
			} catch (error) {
				//
			}
		}
	});
	socket.on('addToList', async (data: any) => {
		// console.log(data);
		const id = Math.floor(Math.random() * 1000000);

		const progressInsert = {
			sub_id: socket.decoded_token.sub,
			tmdb_id: parseInt(data.tmdb_id, 10),
			time: 0,
			video_id: id,
		};

		try {
			await confDb.userData.upsert({
				where: {
					movieId_videoFileId_sub_id: data.type == 'movie'
						? {
							sub_id: socket.decoded_token.sub,
							movieId: parseInt(data.tmdb_id, 10),
							videoFileId: data.video_id,
						}
						: undefined,
					tvId_videoFileId_sub_id: data.type == 'tv'
						? {
							sub_id: socket.decoded_token.sub,
							tvId: parseInt(data.tmdb_id, 10),
							videoFileId: data.video_id,
						}
						: undefined,
				},
				update: {
					sub_id: socket.decoded_token.sub,
					movieId: data.type == 'movie'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					tvId: data.type == 'tv'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					videoFileId: parseInt(data.video_id, 10),
					played: false,
				},
				create: progressInsert,
			});
		} catch (error) {
			//
		}

		socket.emit('addToList', true);
	});
	socket.on('load', async (data: any) => {
		// console.log("load",data);
		if (data.tmdb_id) {
			const start = await confDb.userData.findFirst({
				where: {
					sub_id: socket.decoded_token.sub,
					movieId: data.type == 'movie'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					tvId: data.type == 'tv'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					videoFileId: {
						not: null,
					},
				},
				orderBy: {
					updatedAt: 'desc',
				},
			});
			// console.log('load', start);
			socket.emit('load', start);
		}
	});
	socket.on('getTime', async (data: any) => {
		// console.log("getTime",data);
		if (data.tmdb_id) {
			const start = await confDb.userData.findFirst({
				where: {
					sub_id: socket.decoded_token.sub,
					movieId: data.type == 'movie'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					tvId: data.type == 'tv'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					subtitle: data.subtitle,
					subtitleType: data.subtitle_type,
					videoFileId: parseInt(data.video_id, 10),
				},
				orderBy: {
					updatedAt: 'desc',
				},
			});

			if (start == null) {
				// console.log('getTime', {time: 0});
				socket.emit('getTime', {
					time: 0,
				});
			} else {
				// console.log('getTime', start);
				socket.emit('getTime', start);
			}
		}
	});
	socket.on('remove-watched', async (data: any) => {
		// console.log("remove-watched",data);
		if (data.tmdb_id && data.type) {
			const video = await confDb.userData.findMany({
				where: {
					sub_id: socket.decoded_token.sub,
					movieId: data.type == 'movie'
						? parseInt(data.tmdb_id, 10)
						: undefined,
					tvId: data.type == 'tv'
						? parseInt(data.tmdb_id, 10)
						: undefined,
				},
			});
			if (video.length > 0) {
				await confDb.userData.deleteMany({
					where: {
						id: {
							in: video.map(v => v.id),
						},
					},
				});
				socket.emit('remove-watched', data);
			}
		}
	});

	socket.on('log', (data: any) => {
		// console.log("log",data);
		console.log(data);
	});

	// socket.on('join', (data) => {
	// 	// console.log("join",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('join', data);
	// });
	// socket.on('joinTime', (data) => {
	// 	// console.log("joinTime",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('joinTime', data);
	// });
	// socket.on('joinPlay', (data) => {
	// 	// console.log("joinPlay",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('joinPlay', data);
	// });
	// socket.on('joinPause', (data) => {
	// 	// console.log("joinPause",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('joinPause', data);
	// });
	// socket.on('joinSeek', (data) => {
	// 	// console.log("joinSeek",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('joinSeek', data);
	// });
	// socket.on('joinPlaylistitem', (data) => {
	// 	// console.log("joinPlaylistitem",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('joinPlaylistitem', data);
	// });
	// socket.on('get_caster', () => {
	// 	// console.log("get_caster");
	// 	socket.nsp.to(socket.decoded_token.sub).emit('get_caster');
	// });
	// socket.on('send_caster', (data) => {
	// 	// console.log("send_caster",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('send_caster', data);
	// });
	// socket.on('set_remote_id', (data) => {
	// 	// console.log("set_remote_id",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('set_remote_id', data);
	// });

	// socket.on('remote_audio_list', (data) => {
	// 	// console.log("remote_audio_list",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_audio_list', data);
	// });
	// socket.on('remote_active_audio', (data) => {
	// 	// console.log("remote_active_audio",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_active_audio', data);
	// });
	// socket.on('remote_change_audio', (data) => {
	// 	// console.log("remote_change_audio",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_change_audio', data);
	// });

	// socket.on('remote_subtitle_list', (data) => {
	// 	// console.log("remote_subtitle_list",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_subtitle_list', data);
	// });
	// socket.on('remote_active_subtitle', (data) => {
	// 	// console.log("remote_active_subtitle",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_active_subtitle', data);
	// });
	// socket.on('remote_change_subtitle', (data) => {
	// 	// console.log("remote_change_subtitle",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_change_subtitle', data);
	// });

	// socket.on('remote_quality_list', (data) => {
	// 	// console.log('remote_quality_list', data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_quality_list', data);
	// });
	// socket.on('remote_active_quality', (data) => {
	// 	// console.log('remote_active_quality', data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_active_quality', data);
	// });
	// socket.on('remote_change_quality', (data) => {
	// 	// console.log('remote_change_quality', data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_change_quality', data);
	// });

	// socket.on('remote_backward', (data) => {
	// 	// console.log("remote_backward",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_backward', data);
	// });

	// socket.on('remote_current_time', (data) => {
	// 	// console.log("remote_current_time",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_current_time', data);
	// });
	// socket.on('remote_duration', (data) => {
	// 	// console.log("remote_duration",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_duration', data);
	// });

	// socket.on('remote_forward', (data) => {
	// 	// console.log("remote_forward",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_forward', data);
	// });
	// socket.on('remote_kill', (data) => {
	// 	// console.log("remote_kill",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_kill', data);
	// });

	// socket.on('remote_load', (data) => {
	// 	// console.log("remote_load",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_load', data);
	// });
	// socket.on('remote_metadata', (data) => {
	// 	// console.log("remote_metadata",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_metadata', data);
	// });

	// socket.on('remote_mute', (data) => {
	// 	// console.log("remote_mute",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_mute', data);
	// });
	// socket.on('remote_next', (data) => {
	// 	// console.log("remote_next",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_next', data);
	// });
	// socket.on('remote_pause', (data) => {
	// 	// console.log("remote_pause",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_pause', data);
	// });
	// socket.on('remote_play', (data) => {
	// 	// console.log("remote_play",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_play', data);
	// });
	// socket.on('remote_playlist', (data) => {
	// 	// console.log('remote_playlist', data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_playlist', data);
	// });

	// socket.on('remote_playlist_item', (data) => {
	// 	// console.log("remote_playlist_item",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_playlist_item', data);
	// });

	// socket.on('remote_prev', (data) => {
	// 	// console.log("remote_prev",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_prev', data);
	// });
	// socket.on('remote_restart', (data) => {
	// 	// console.log("remote_restart",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_restart', data);
	// });
	// socket.on('remote_stop', (data) => {
	// 	// console.log("remote_stop",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_stop', data);
	// });
	// socket.on('remote_time', (data) => {
	// 	// console.log("remote_time",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_time', data);
	// });
	// socket.on('remote_volume', (data) => {
	// 	// console.log("remote_volume",data);
	// 	socket.nsp.to(socket.decoded_token.sub).emit('remote_volume', data);
	// });
}

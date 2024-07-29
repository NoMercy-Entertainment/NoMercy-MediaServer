CREATE TABLE `activityLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`time` datetime NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `album_artist` (
	`album_id` text NOT NULL,
	`artist_id` text NOT NULL,
	PRIMARY KEY(`album_id`, `artist_id`),
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `album_library` (
	`album_id` text NOT NULL,
	`library_id` text NOT NULL,
	PRIMARY KEY(`album_id`, `library_id`),
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `album_track` (
	`album_id` text NOT NULL,
	`track_id` text NOT NULL,
	PRIMARY KEY(`album_id`, `track_id`),
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`folder` text,
	`cover` text,
	`country` text,
	`year` integer,
	`tracks` integer,
	`colorPalette` text,
	`blurHash` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `alternativeTitles` (
	`id` text PRIMARY KEY,
	`iso31661` text NOT NULL,
	`title` text NOT NULL,
	`movie_id` integer,
	`tv_id` integer,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `artist_library` (
	`artist_id` text NOT NULL,
	`library_id` text NOT NULL,
	PRIMARY KEY(`artist_id`, `library_id`),
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `artist_track` (
	`artist_id` text NOT NULL,
	`track_id` text NOT NULL,
	PRIMARY KEY(`artist_id`, `track_id`),
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`folder` text,
	`cover` text,
	`colorPalette` text,
	`blurHash` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `casts` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` integer NOT NULL,
	`movie_id` integer,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `certification_movie` (
	`iso31661` text,
	`certification_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	PRIMARY KEY(`certification_id`, `iso31661`, `movie_id`),
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `certification_tv` (
	`iso31661` text,
	`certification_id` integer NOT NULL,
	`tv_id` integer NOT NULL,
	PRIMARY KEY(`certification_id`, `iso31661`, `tv_id`),
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`iso31661` text NOT NULL,
	`meaning` text NOT NULL,
	`order` integer NOT NULL,
	`rating` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collection_library` (
	`collection_id` integer NOT NULL,
	`library_id` integer NOT NULL,
	PRIMARY KEY(`collection_id`, `library_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collection_movie` (
	`collection_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	PRIMARY KEY(`collection_id`, `movie_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`backdrop` text,
	`overview` text,
	`parts` integer,
	`poster` text,
	`title` text NOT NULL,
	`titleSort` text NOT NULL,
	`blurHash` text,
	`colorPalette` text,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `configuration` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`modified_by` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`iso31661` text NOT NULL,
	`english_name` text,
	`native_name` text
);
--> statement-breakpoint
CREATE TABLE `creators` (
	`person_id` integer NOT NULL,
	`tv_id` integer NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crews` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` integer NOT NULL,
	`movie_id` integer,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY,
	`device_id` text NOT NULL,
	`browser` text NOT NULL,
	`os` text NOT NULL,
	`device` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`custom_name` text,
	`version` text NOT NULL,
	`ip` text NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `encoderProfile_library` (
	`encoderProfile_id` text NOT NULL,
	`library_id` text NOT NULL,
	PRIMARY KEY(`encoderProfile_id`, `library_id`),
	FOREIGN KEY (`encoderProfile_id`) REFERENCES `encoderProfiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `encoderProfiles` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`container` text,
	`param` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`airDate` text,
	`episodeNumber` integer NOT NULL,
	`imdbId` text,
	`overview` text,
	`productionCode` text,
	`seasonNumber` integer NOT NULL,
	`still` text,
	`tvdbId` integer,
	`voteAverage` integer,
	`voteCount` integer,
	`blurHash` text,
	`colorPalette` text,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`tv_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `file_library` (
	`file_id` text NOT NULL,
	`library_id` text NOT NULL,
	PRIMARY KEY(`file_id`, `library_id`),
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `file_movie` (
	`file_id` text NOT NULL,
	`movie_id` text NOT NULL,
	PRIMARY KEY(`file_id`, `movie_id`),
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY,
	`folder` text NOT NULL,
	`episodeNumber` integer,
	`seasonNumber` integer,
	`episodeFolder` text,
	`name` text NOT NULL,
	`extension` text NOT NULL,
	`year` integer,
	`size` real NOT NULL,
	`atimeMs` real NOT NULL,
	`birthtimeMs` real NOT NULL,
	`ctimeMs` real NOT NULL,
	`edition` text,
	`resolution` text,
	`videoCodec` text,
	`audioCodec` text,
	`audioChannels` text,
	`ffprobe` text,
	`chapters` text,
	`fullSeason` boolean,
	`gid` integer,
	`group` text,
	`airDate` datetime,
	`multi` boolean,
	`complete` boolean,
	`isMultiSeason` boolean,
	`isPartialSeason` boolean,
	`isSeasonExtra` boolean,
	`isSpecial` boolean,
	`isTv` boolean,
	`languages` text,
	`mode` real,
	`mtimeMs` real,
	`nlink` real,
	`path` text NOT NULL,
	`revision` text,
	`seasonPart` real,
	`sources` text,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`uid` real,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`library_id` text,
	`movie_id` integer,
	`album_id` integer,
	`episode_id` integer,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `folder_library` (
	`folder_id` text NOT NULL,
	`library_id` text NOT NULL,
	PRIMARY KEY(`folder_id`, `library_id`),
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` text PRIMARY KEY,
	`path` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `genre_movie` (
	`genre_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	PRIMARY KEY(`genre_id`, `movie_id`),
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `genre_tv` (
	`genre_id` integer NOT NULL,
	`tv_id` integer NOT NULL,
	PRIMARY KEY(`genre_id`, `tv_id`),
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `guestStars` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` integer NOT NULL,
	`episode_id` integer NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`aspectRatio` real,
	`height` integer,
	`iso6391` text,
	`name` text,
	`site` text,
	`size` integer,
	`filePath` text NOT NULL,
	`type` text,
	`width` integer,
	`voteAverage` real,
	`voteCount` integer,
	`colorPalette` text,
	`blurHash` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`cast_id` text,
	`crew_id` text,
	`person_id` integer,
	`artist_id` text,
	`album_id` text,
	`track_id` text,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	`movie_id` integer,
	`collection_id` integer,
	FOREIGN KEY (`cast_id`) REFERENCES `casts`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`crew_id`) REFERENCES `crews`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credit_id` text NOT NULL,
	`job` text NOT NULL,
	`episodeCount` integer,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`crew_id` text,
	FOREIGN KEY (`crew_id`) REFERENCES `crews`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keyword_movie` (
	`keyword_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	PRIMARY KEY(`keyword_id`, `movie_id`),
	FOREIGN KEY (`keyword_id`) REFERENCES `keywords`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keyword_tv` (
	`keyword_id` integer NOT NULL,
	`tv_id` integer NOT NULL,
	PRIMARY KEY(`keyword_id`, `tv_id`),
	FOREIGN KEY (`keyword_id`) REFERENCES `keywords`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `language_library` (
	`language_id` integer NOT NULL,
	`library_id` text NOT NULL,
	`type` text NOT NULL,
	PRIMARY KEY(`language_id`, `library_id`, `type`),
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`iso_639_1` text NOT NULL,
	`english_name` text NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `libraries` (
	`id` text PRIMARY KEY,
	`autoRefreshInterval` integer NOT NULL,
	`chapterImages` boolean NOT NULL,
	`extractChapters` boolean NOT NULL,
	`extractChaptersDuring` boolean NOT NULL,
	`image` text,
	`perfectSubtitleMatch` boolean NOT NULL,
	`realtime` boolean NOT NULL,
	`specialSeasonName` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`country` text NOT NULL,
	`language` text NOT NULL,
	`blurHash` text,
	`colorPalette` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `library_movie` (
	`library_id` text NOT NULL,
	`movie_id` integer NOT NULL,
	PRIMARY KEY(`library_id`, `movie_id`),
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `library_track` (
	`library_id` text NOT NULL,
	`track_id` text NOT NULL,
	PRIMARY KEY(`library_id`, `track_id`),
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `library_tv` (
	`library_id` text NOT NULL,
	`tv_id` integer NOT NULL,
	PRIMARY KEY(`library_id`, `tv_id`),
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `library_user` (
	`library_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`library_id`, `user_id`),
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mediaAttachments` (
	`id` text PRIMARY KEY,
	`type` integer NOT NULL,
	`value` text NOT NULL,
	`cleanValue` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`file_id` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medias` (
	`id` text PRIMARY KEY,
	`aspectRatio` real,
	`height` integer,
	`iso6391` text,
	`name` text,
	`site` text,
	`size` integer,
	`src` text NOT NULL,
	`type` text,
	`voteAverage` real,
	`voteCount` integer,
	`width` integer,
	`colorPalette` text,
	`blurHash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	`movie_id` integer,
	`person_id` integer,
	`videoFile_id` integer,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`videoFile_id`) REFERENCES `videoFiles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mediaStreams` (
	`id` text PRIMARY KEY,
	`streamIndex` integer,
	`streamType` text,
	`codec` text,
	`language` text,
	`channelLayout` text,
	`profile` text,
	`aspectRatio` text,
	`path` text,
	`isIntrlaced` integer,
	`bitRate` integer,
	`channels` integer,
	`sampleRate` integer,
	`isDefault` integer,
	`isForced` integer,
	`isExternal` integer,
	`height` integer,
	`width` integer,
	`averageFrameRate` integer,
	`realFrameRate` integer,
	`level` integer,
	`pixelFormat` text,
	`bitDepth` integer,
	`isAnamorphic` integer,
	`refFrames` integer,
	`codecTag` text,
	`comment` text,
	`nalLengthSize` text,
	`isAvc` integer,
	`title` text,
	`timeBase` text,
	`codecTimeBase` text,
	`colorPrimaries` text,
	`colorSpace` text,
	`colorTransfer` text,
	`dvVersionMajor` integer,
	`dvVersionMinor` integer,
	`dvProfile` integer,
	`dvLevel` integer,
	`rpuPresentFlag` integer,
	`elPresentFlag` integer,
	`blPresentFlag` integer,
	`dvBlSignalCompatibility_id` integer,
	`keyFrames` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`file_id` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY,
	`body` text,
	`from` text,
	`image` text,
	`notify` boolean DEFAULT false,
	`read` boolean DEFAULT false,
	`title` text,
	`to` text,
	`type` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metadata` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`titleSort` text NOT NULL,
	`duration` text,
	`show` boolean DEFAULT false,
	`folder` text,
	`adult` boolean DEFAULT false,
	`backdrop` text,
	`budget` integer,
	`homepage` text,
	`imdbId` text,
	`originalTitle` text,
	`originalLanguage` text,
	`overview` text,
	`popularity` real,
	`poster` text,
	`releaseDate` datetime NOT NULL,
	`revenue` integer,
	`runtime` integer,
	`status` text,
	`tagline` text,
	`trailer` text,
	`tvdbId` integer,
	`video` text,
	`voteAverage` real,
	`voteCount` integer,
	`blurHash` text,
	`colorPalette` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicGenre_track` (
	`musicGenre_id` text NOT NULL,
	`track_id` text NOT NULL,
	PRIMARY KEY(`musicGenre_id`, `track_id`),
	FOREIGN KEY (`musicGenre_id`) REFERENCES `musicGenres`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `musicGenres` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_user` (
	`notification_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`notification_id`, `user_id`),
	FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`manage` boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`adult` boolean DEFAULT false,
	`alsoKnownAs` text,
	`biography` text,
	`birthday` text,
	`deathDay` text,
	`gender` integer DEFAULT 0,
	`homepage` text,
	`imdbId` text,
	`knownForDepartment` text,
	`name` text,
	`placeOfBirth` text,
	`popularity` real,
	`profile` text,
	`blurHash` text,
	`colorPalette` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlist_track` (
	`playlist_id` text NOT NULL,
	`track_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`playlist_id`, `track_id`),
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover` text,
	`colorPalette` text,
	`blurHash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `priority_provider` (
	`priority` integer NOT NULL,
	`country` text NOT NULL,
	`provider_id` integer NOT NULL,
	PRIMARY KEY(`country`, `provider_id`),
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_name` text NOT NULL,
	`logo_path` text,
	`display_priority` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY,
	`backdrop` text,
	`overview` text,
	`poster` text,
	`title` text NOT NULL,
	`titleSort` text NOT NULL,
	`blurHash` text,
	`colorPalette` text,
	`media_id` integer,
	`tvFrom_id` integer,
	`tvTo_id` integer,
	`movieFrom_id` integer,
	`movieTo_id` integer,
	FOREIGN KEY (`tvFrom_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tvTo_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movieFrom_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movieTo_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credit_id` text NOT NULL,
	`character` text NOT NULL,
	`episodeCount` integer,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`cast_id` text,
	`guest_id` text,
	FOREIGN KEY (`cast_id`) REFERENCES `casts`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guestStars`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `runningTasks` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`value` integer NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`airDate` text,
	`episodeCount` integer,
	`overview` text,
	`poster` text,
	`seasonNumber` integer NOT NULL,
	`blurHash` text,
	`colorPalette` text,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`tv_id` integer NOT NULL,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `similars` (
	`id` text PRIMARY KEY,
	`backdrop` text,
	`overview` text,
	`poster` text,
	`title` text NOT NULL,
	`titleSort` text NOT NULL,
	`blurHash` text,
	`colorPalette` text,
	`media_id` integer,
	`tvFrom_id` integer,
	`tvTo_id` integer,
	`movieFrom_id` integer,
	`movieTo_id` integer,
	FOREIGN KEY (`tvFrom_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tvTo_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movieFrom_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movieTo_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `specialItems` (
	`order` integer,
	`special_id` text NOT NULL,
	`episode_id` integer,
	`movie_id` integer,
	FOREIGN KEY (`special_id`) REFERENCES `specials`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `specials` (
	`id` text PRIMARY KEY,
	`backdrop` text,
	`description` text,
	`poster` text,
	`logo` text,
	`title` text NOT NULL,
	`blurHash` text,
	`colorPalette` text,
	`creator` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `track_user` (
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`track_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`track_id`, `user_id`),
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`track` integer,
	`disc` integer,
	`cover` text,
	`date` text,
	`folder` text,
	`filename` text,
	`duration` text,
	`quality` integer,
	`path` text,
	`lyrics` text,
	`colorPalette` text,
	`blurHash` text,
	`folder_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` text PRIMARY KEY,
	`iso31661` text NOT NULL,
	`iso6391` text NOT NULL,
	`name` text,
	`englishName` text,
	`title` text,
	`overview` text,
	`homepage` text,
	`biography` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`tv_id` integer,
	`season_id` integer,
	`episode_id` integer,
	`movie_id` integer,
	`collection_id` integer,
	`person_id` integer,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tvs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`titleSort` text NOT NULL,
	`haveEpisodes` integer,
	`folder` text,
	`backdrop` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`duration` integer,
	`firstAirDate` text,
	`homepage` text,
	`imdbId` text,
	`inProduction` boolean DEFAULT false,
	`lastEpisodeToAir` integer,
	`lastAirDate` text,
	`mediaType` text,
	`nextEpisodeToAir` integer,
	`numberOfEpisodes` integer DEFAULT 0,
	`numberOfSeasons` integer DEFAULT 0,
	`originCountry` text,
	`originalLanguage` text,
	`overview` text,
	`popularity` real,
	`poster` text,
	`spokenLanguages` text,
	`status` text,
	`tagline` text,
	`trailer` text,
	`tvdbId` integer,
	`type` text,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`voteAverage` real,
	`voteCount` integer,
	`blurHash` text,
	`colorPalette` text,
	`library_id` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userData` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rating` integer,
	`played` integer,
	`playCount` integer,
	`isFavorite` integer,
	`playbackPositionTicks` integer,
	`lastPlayedDate` text,
	`audio` text,
	`subtitle` text,
	`subtitleType` text,
	`time` integer,
	`type` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`movie_id` integer,
	`tv_id` integer,
	`special_id` integer,
	`videoFile_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tv_id`) REFERENCES `tvs`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`special_id`) REFERENCES `specials`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`videoFile_id`) REFERENCES `videoFiles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`manage` boolean DEFAULT false,
	`owner` boolean DEFAULT false,
	`name` text NOT NULL,
	`allowed` boolean DEFAULT true,
	`audioTranscoding` boolean DEFAULT true,
	`videoTranscoding` boolean DEFAULT true,
	`noTranscoding` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videoFiles` (
	`id` text PRIMARY KEY,
	`duration` text,
	`filename` text NOT NULL,
	`folder` text NOT NULL,
	`hostFolder` text NOT NULL,
	`languages` text,
	`quality` text,
	`share` text DEFAULT 'Media' NOT NULL,
	`subtitles` text,
	`chapters` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`episode_id` integer,
	`movie_id` integer,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `album_id_index` ON `albums` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `alternative_titles_movie_unique` ON `alternativeTitles` (`movie_id`,`iso31661`);--> statement-breakpoint
CREATE INDEX `alternative_titles_movie_index` ON `alternativeTitles` (`movie_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `alternative_titles_tv_unique` ON `alternativeTitles` (`tv_id`,`iso31661`);--> statement-breakpoint
CREATE INDEX `alternative_titles_tv_index` ON `alternativeTitles` (`tv_id`);--> statement-breakpoint
CREATE INDEX `artist_id_index` ON `artists` (`id`);--> statement-breakpoint
CREATE INDEX `casts_index` ON `casts` (`person_id`,`movie_id`,`tv_id`,`season_id`,`episode_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cast_movie_unique` ON `casts` (`id`,`movie_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cast_tv_unique` ON `casts` (`id`,`tv_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cast_seasons_unique` ON `casts` (`id`,`season_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cast_episodes_unique` ON `casts` (`id`,`episode_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cast_persons_unique` ON `casts` (`id`,`person_id`);--> statement-breakpoint
CREATE INDEX `certifications_index` ON `certifications` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `certifications_unique` ON `certifications` (`iso31661`,`rating`);--> statement-breakpoint
CREATE INDEX `collections_index` ON `collections` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collections_unique` ON `collections` (`backdrop`,`poster`);--> statement-breakpoint
CREATE INDEX `configuration_index` ON `configuration` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `configuration_unique` ON `configuration` (`key`);--> statement-breakpoint
CREATE INDEX `countries_index` ON `countries` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `countries_unique` ON `countries` (`iso31661`);--> statement-breakpoint
CREATE UNIQUE INDEX `creators_unique` ON `creators` (`person_id`,`tv_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `crews_movie_unique` ON `crews` (`id`,`person_id`,`movie_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `crews_tv_unique` ON `crews` (`id`,`person_id`,`tv_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `crews_seasons_unique` ON `crews` (`id`,`person_id`,`season_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `crews_episodes_unique` ON `crews` (`id`,`person_id`,`episode_id`);--> statement-breakpoint
CREATE INDEX `devices_index` ON `devices` (`device_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `devices_unique` ON `devices` (`device_id`,`type`,`name`,`version`);--> statement-breakpoint
CREATE INDEX `encoderProfiles_index` ON `encoderProfiles` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `encoderProfiles_unique` ON `encoderProfiles` (`name`);--> statement-breakpoint
CREATE INDEX `episode_index` ON `episodes` (`id`);--> statement-breakpoint
CREATE INDEX `episode_season_index` ON `episodes` (`season_id`);--> statement-breakpoint
CREATE INDEX `files_index` ON `files` (`path`,`library_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `files_unique` ON `files` (`path`);--> statement-breakpoint
CREATE INDEX `folders_index` ON `folders` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `folders_unique` ON `folders` (`path`);--> statement-breakpoint
CREATE INDEX `genres_index` ON `genres` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `genres_unique` ON `genres` (`id`);--> statement-breakpoint
CREATE INDEX `guestStars_index` ON `guestStars` (`episode_id`);--> statement-breakpoint
CREATE INDEX `images_index` ON `images` (`episode_id`,`movie_id`,`person_id`,`season_id`,`tv_id`,`album_id`,`artist_id`,`cast_id`,`crew_id`,`collection_id`,`track_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_inique` ON `images` (`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_tv_unique` ON `images` (`tv_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_season_unique` ON `images` (`season_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_episode_unique` ON `images` (`episode_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_movie_unique` ON `images` (`movie_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_collection_unique` ON `images` (`collection_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_person_unique` ON `images` (`person_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_cast_unique` ON `images` (`cast_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_crew_unique` ON `images` (`crew_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_artist_unique` ON `images` (`artist_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_album_unique` ON `images` (`album_id`,`filePath`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_track_unique` ON `images` (`track_id`,`filePath`);--> statement-breakpoint
CREATE INDEX `jobs_index` ON `jobs` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_unique` ON `jobs` (`credit_id`);--> statement-breakpoint
CREATE INDEX `keywords_index` ON `keywords` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `keywords_unique` ON `keywords` (`id`);--> statement-breakpoint
CREATE INDEX `language_index` ON `languages` (`iso_639_1`);--> statement-breakpoint
CREATE UNIQUE INDEX `language_unique` ON `languages` (`iso_639_1`);--> statement-breakpoint
CREATE UNIQUE INDEX `library_index` ON `libraries` (`id`,`title`);--> statement-breakpoint
CREATE INDEX `media_attachments_index` ON `mediaAttachments` (`id`,`type`,`cleanValue`);--> statement-breakpoint
CREATE INDEX `media_attachments_index2` ON `mediaAttachments` (`id`,`type`,`value`);--> statement-breakpoint
CREATE UNIQUE INDEX `media_attachments_unique` ON `mediaAttachments` (`type`);--> statement-breakpoint
CREATE INDEX `medias_index` ON `medias` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `medias_unique` ON `medias` (`src`);--> statement-breakpoint
CREATE INDEX `mediastreams_index` ON `mediaStreams` (`id`,`streamIndex`);--> statement-breakpoint
CREATE INDEX `mediastreams_unique` ON `mediaStreams` (`file_id`,`streamIndex`);--> statement-breakpoint
CREATE INDEX `metadata_index` ON `metadata` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `metadata_unique` ON `metadata` (`title`);--> statement-breakpoint
CREATE INDEX `movie_index` ON `movies` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `movie_unique` ON `movies` (`id`);--> statement-breakpoint
CREATE INDEX `musicGenres_index` ON `musicGenres` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `musicGenres_unique` ON `musicGenres` (`name`);--> statement-breakpoint
CREATE INDEX `notifications_index` ON `notifications` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_unique` ON `notifications` (`name`);--> statement-breakpoint
CREATE INDEX `peopleIndex` ON `people` (`id`);--> statement-breakpoint
CREATE INDEX `playlists_index` ON `playlists` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `playlists_unique` ON `playlists` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `providers_index` ON `providers` (`id`);--> statement-breakpoint
CREATE INDEX `recommendations_index` ON `recommendations` (`id`,`media_id`,`tvFrom_id`,`tvTo_id`,`movieFrom_id`,`movieTo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `recommendations_tv_unique` ON `recommendations` (`media_id`,`tvFrom_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `recommendations_movie_unique` ON `recommendations` (`media_id`,`movieFrom_id`);--> statement-breakpoint
CREATE INDEX `roles_index` ON `roles` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_role_unique` ON `roles` (`credit_id`,`cast_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_guest_unique` ON `roles` (`credit_id`,`guest_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `runningTasks_unique` ON `runningTasks` (`title`,`type`);--> statement-breakpoint
CREATE INDEX `seasonIndex` ON `seasons` (`id`);--> statement-breakpoint
CREATE INDEX `tvId_idx` ON `seasons` (`tv_id`);--> statement-breakpoint
CREATE INDEX `similars_index` ON `similars` (`id`,`media_id`,`tvFrom_id`,`tvTo_id`,`movieFrom_id`,`movieTo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `similars_tv_unique` ON `similars` (`media_id`,`tvFrom_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `similars_movie_unique` ON `similars` (`media_id`,`movieFrom_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `specialItem_episode_unique` ON `specialItems` (`special_id`,`episode_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `specialItem_movie_unique` ON `specialItems` (`special_id`,`movie_id`);--> statement-breakpoint
CREATE INDEX `specials_index` ON `specials` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `specials_unique` ON `specials` (`title`);--> statement-breakpoint
CREATE INDEX `tracks_index` ON `tracks` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tracks_unique` ON `tracks` (`filename`,`path`);--> statement-breakpoint
CREATE INDEX `translations_index` ON `translations` (`episode_id`,`movie_id`,`person_id`,`season_id`,`tv_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `translations_tv_unique` ON `translations` (`tv_id`,`iso31661`,`iso6391`);--> statement-breakpoint
CREATE UNIQUE INDEX `translations_season_unique` ON `translations` (`season_id`,`iso31661`,`iso6391`);--> statement-breakpoint
CREATE UNIQUE INDEX `translations_episode_unique` ON `translations` (`episode_id`,`iso31661`,`iso6391`);--> statement-breakpoint
CREATE UNIQUE INDEX `translations_movie_unique` ON `translations` (`movie_id`,`iso31661`,`iso6391`);--> statement-breakpoint
CREATE UNIQUE INDEX `translations_collection_unique` ON `translations` (`collection_id`,`iso31661`,`iso6391`);--> statement-breakpoint
CREATE UNIQUE INDEX `translations_person_unique` ON `translations` (`person_id`,`iso31661`,`iso6391`);--> statement-breakpoint
CREATE INDEX `tvIndex` ON `tvs` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tvUnique` ON `tvs` (`id`);--> statement-breakpoint
CREATE INDEX `userData_index` ON `userData` (`tv_id`,`movie_id`,`videoFile_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userData_tv_unique` ON `userData` (`tv_id`,`videoFile_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userData_movie_unique` ON `userData` (`movie_id`,`videoFile_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userData_special_unique` ON `userData` (`special_id`,`tv_id`,`videoFile_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `videoFiles_index` ON `videoFiles` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `videoFiles_unique` ON `videoFiles` (`filename`);
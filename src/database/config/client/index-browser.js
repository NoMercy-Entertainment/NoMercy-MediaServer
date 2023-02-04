
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum
} = require('@prisma/client/runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.7.1
 * Query Engine version: 272861e07ab64f234d3ffc4094e32bd61775599c
 */
Prisma.prismaVersion = {
  client: "4.7.1",
  engine: "272861e07ab64f234d3ffc4094e32bd61775599c"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = () => (val) => val


/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

exports.Prisma.ActivityLogScalarFieldEnum = makeEnum({
  id: 'id',
  type: 'type',
  time: 'time',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deviceId: 'deviceId',
  sub_id: 'sub_id'
});

exports.Prisma.AlbumScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  description: 'description',
  folder: 'folder',
  cover: 'cover',
  country: 'country',
  year: 'year',
  tracks: 'tracks',
  colorPalette: 'colorPalette',
  blurHash: 'blurHash',
  libraryId: 'libraryId'
});

exports.Prisma.AlternativeTitlesScalarFieldEnum = makeEnum({
  id: 'id',
  iso31661: 'iso31661',
  title: 'title',
  movieId: 'movieId',
  tvId: 'tvId'
});

exports.Prisma.ArtistScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  description: 'description',
  cover: 'cover',
  folder: 'folder',
  colorPalette: 'colorPalette',
  blurHash: 'blurHash',
  libraryId: 'libraryId',
  trackId: 'trackId'
});

exports.Prisma.CastEpisodeScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  episodeId: 'episodeId'
});

exports.Prisma.CastMovieScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  movieId: 'movieId'
});

exports.Prisma.CastScalarFieldEnum = makeEnum({
  adult: 'adult',
  character: 'character',
  creditId: 'creditId',
  gender: 'gender',
  id: 'id',
  knownForDepartment: 'knownForDepartment',
  name: 'name',
  order: 'order',
  originalName: 'originalName',
  popularity: 'popularity',
  profilePath: 'profilePath',
  blurHash: 'blurHash',
  personId: 'personId'
});

exports.Prisma.CastSeasonScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  seasonId: 'seasonId'
});

exports.Prisma.CastTvScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  tvId: 'tvId'
});

exports.Prisma.CertificationMovieScalarFieldEnum = makeEnum({
  iso31661: 'iso31661',
  certificationId: 'certificationId',
  movieId: 'movieId'
});

exports.Prisma.CertificationScalarFieldEnum = makeEnum({
  id: 'id',
  iso31661: 'iso31661',
  meaning: 'meaning',
  order: 'order',
  rating: 'rating'
});

exports.Prisma.CertificationTvScalarFieldEnum = makeEnum({
  iso31661: 'iso31661',
  certificationId: 'certificationId',
  tvId: 'tvId'
});

exports.Prisma.CollectionMovieScalarFieldEnum = makeEnum({
  collectionId: 'collectionId',
  movieId: 'movieId'
});

exports.Prisma.CollectionScalarFieldEnum = makeEnum({
  backdrop: 'backdrop',
  id: 'id',
  overview: 'overview',
  parts: 'parts',
  poster: 'poster',
  title: 'title',
  titleSort: 'titleSort',
  blurHash: 'blurHash',
  libraryId: 'libraryId'
});

exports.Prisma.ConfigurationScalarFieldEnum = makeEnum({
  id: 'id',
  key: 'key',
  value: 'value',
  modified_by: 'modified_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.CountryScalarFieldEnum = makeEnum({
  id: 'id',
  iso31661: 'iso31661',
  english_name: 'english_name',
  native_name: 'native_name'
});

exports.Prisma.CreatorScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  gender: 'gender',
  id: 'id',
  name: 'name',
  profilePath: 'profilePath',
  blurHash: 'blurHash',
  personId: 'personId'
});

exports.Prisma.CreatorTvScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  tvId: 'tvId'
});

exports.Prisma.CrewEpisodeScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  episodeId: 'episodeId'
});

exports.Prisma.CrewMovieScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  movieId: 'movieId'
});

exports.Prisma.CrewScalarFieldEnum = makeEnum({
  adult: 'adult',
  creditId: 'creditId',
  department: 'department',
  gender: 'gender',
  id: 'id',
  job: 'job',
  knownForDepartment: 'knownForDepartment',
  name: 'name',
  originalName: 'originalName',
  popularity: 'popularity',
  profilePath: 'profilePath',
  profileId: 'profileId',
  blurHash: 'blurHash',
  personId: 'personId'
});

exports.Prisma.CrewSeasonScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  seasonId: 'seasonId'
});

exports.Prisma.CrewTvScalarFieldEnum = makeEnum({
  creditId: 'creditId',
  tvId: 'tvId'
});

exports.Prisma.DeviceScalarFieldEnum = makeEnum({
  id: 'id',
  deviceId: 'deviceId',
  title: 'title',
  type: 'type',
  version: 'version',
  ip: 'ip',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.EncoderProfileLibraryScalarFieldEnum = makeEnum({
  libraryId: 'libraryId',
  encoderProfileId: 'encoderProfileId'
});

exports.Prisma.EncoderProfileScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  container: 'container',
  param: 'param',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.EpisodeGuestStarScalarFieldEnum = makeEnum({
  episodeId: 'episodeId',
  creditId: 'creditId'
});

exports.Prisma.EpisodeScalarFieldEnum = makeEnum({
  airDate: 'airDate',
  createdAt: 'createdAt',
  episodeNumber: 'episodeNumber',
  id: 'id',
  imdbId: 'imdbId',
  overview: 'overview',
  productionCode: 'productionCode',
  seasonNumber: 'seasonNumber',
  still: 'still',
  title: 'title',
  tvdbId: 'tvdbId',
  updatedAt: 'updatedAt',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  blurHash: 'blurHash',
  tvId: 'tvId',
  seasonId: 'seasonId'
});

exports.Prisma.FailedJobsScalarFieldEnum = makeEnum({
  connnection: 'connnection',
  exception: 'exception',
  failedAt: 'failedAt',
  payload: 'payload',
  queue: 'queue',
  uuid: 'uuid'
});

exports.Prisma.FavoriteTrackScalarFieldEnum = makeEnum({
  trackId: 'trackId',
  userId: 'userId',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.FileScalarFieldEnum = makeEnum({
  folder: 'folder',
  episodeNumber: 'episodeNumber',
  seasonNumber: 'seasonNumber',
  episodeFolder: 'episodeFolder',
  name: 'name',
  extension: 'extension',
  year: 'year',
  size: 'size',
  id: 'id',
  atimeMs: 'atimeMs',
  birthtimeMs: 'birthtimeMs',
  ctimeMs: 'ctimeMs',
  edition: 'edition',
  resolution: 'resolution',
  videoCodec: 'videoCodec',
  audioCodec: 'audioCodec',
  audioChannels: 'audioChannels',
  ffprobe: 'ffprobe',
  chapters: 'chapters',
  fullSeason: 'fullSeason',
  gid: 'gid',
  group: 'group',
  airDate: 'airDate',
  multi: 'multi',
  complete: 'complete',
  isMultiSeason: 'isMultiSeason',
  isPartialSeason: 'isPartialSeason',
  isSeasonExtra: 'isSeasonExtra',
  isSpecial: 'isSpecial',
  isTv: 'isTv',
  languages: 'languages',
  mode: 'mode',
  mtimeMs: 'mtimeMs',
  nlink: 'nlink',
  path: 'path',
  revision: 'revision',
  seasonPart: 'seasonPart',
  sources: 'sources',
  title: 'title',
  type: 'type',
  uid: 'uid',
  libraryId: 'libraryId',
  albumId: 'albumId',
  episodeId: 'episodeId',
  movieId: 'movieId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.FolderScalarFieldEnum = makeEnum({
  id: 'id',
  path: 'path',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.GenreMovieScalarFieldEnum = makeEnum({
  genreId: 'genreId',
  movieId: 'movieId'
});

exports.Prisma.GenreScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name'
});

exports.Prisma.GenreTvScalarFieldEnum = makeEnum({
  genreId: 'genreId',
  tvId: 'tvId'
});

exports.Prisma.GuestStarScalarFieldEnum = makeEnum({
  adult: 'adult',
  castId: 'castId',
  character: 'character',
  creditId: 'creditId',
  episodeId: 'episodeId',
  gender: 'gender',
  id: 'id',
  knownForDepartment: 'knownForDepartment',
  name: 'name',
  order: 'order',
  originalName: 'originalName',
  popularity: 'popularity',
  profilePath: 'profilePath',
  profileId: 'profileId',
  personId: 'personId'
});

exports.Prisma.ImageScalarFieldEnum = makeEnum({
  id: 'id',
  aspectRatio: 'aspectRatio',
  createdAt: 'createdAt',
  height: 'height',
  iso6391: 'iso6391',
  name: 'name',
  site: 'site',
  size: 'size',
  filePath: 'filePath',
  type: 'type',
  updatedAt: 'updatedAt',
  width: 'width',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  colorPalette: 'colorPalette',
  blurHash: 'blurHash',
  tvId: 'tvId',
  movieId: 'movieId'
});

exports.Prisma.JobsScalarFieldEnum = makeEnum({
  attempts: 'attempts',
  availableAt: 'availableAt',
  createdAt: 'createdAt',
  id: 'id',
  payload: 'payload',
  queue: 'queue',
  reservedAt: 'reservedAt'
});

exports.Prisma.KeywordMovieScalarFieldEnum = makeEnum({
  keywordId: 'keywordId',
  movieId: 'movieId'
});

exports.Prisma.KeywordScalarFieldEnum = makeEnum({
  id: 'id',
  keywordId: 'keywordId',
  name: 'name'
});

exports.Prisma.KeywordTvScalarFieldEnum = makeEnum({
  keywordId: 'keywordId',
  tvId: 'tvId'
});

exports.Prisma.LanguageScalarFieldEnum = makeEnum({
  id: 'id',
  iso_639_1: 'iso_639_1',
  english_name: 'english_name',
  name: 'name'
});

exports.Prisma.LibraryFolderScalarFieldEnum = makeEnum({
  libraryId: 'libraryId',
  folderId: 'folderId'
});

exports.Prisma.LibraryScalarFieldEnum = makeEnum({
  id: 'id',
  autoRefreshInterval: 'autoRefreshInterval',
  chapterImages: 'chapterImages',
  extractChapters: 'extractChapters',
  extractChaptersDuring: 'extractChaptersDuring',
  image: 'image',
  perfectSubtitleMatch: 'perfectSubtitleMatch',
  realtime: 'realtime',
  specialSeasonName: 'specialSeasonName',
  title: 'title',
  type: 'type',
  country: 'country',
  language: 'language',
  blurHash: 'blurHash',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.LibraryUserScalarFieldEnum = makeEnum({
  libraryId: 'libraryId',
  userId: 'userId'
});

exports.Prisma.MediaAttachmentsScalarFieldEnum = makeEnum({
  ItemId: 'ItemId',
  Type: 'Type',
  Value: 'Value',
  CleanValue: 'CleanValue',
  fileId: 'fileId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.MediaScalarFieldEnum = makeEnum({
  aspectRatio: 'aspectRatio',
  createdAt: 'createdAt',
  height: 'height',
  id: 'id',
  iso6391: 'iso6391',
  name: 'name',
  site: 'site',
  size: 'size',
  src: 'src',
  type: 'type',
  updatedAt: 'updatedAt',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  width: 'width',
  colorPalette: 'colorPalette',
  blurHash: 'blurHash',
  tvId: 'tvId',
  seasonId: 'seasonId',
  episodeId: 'episodeId',
  movieId: 'movieId',
  personId: 'personId',
  videoFileId: 'videoFileId'
});

exports.Prisma.MediastreamsScalarFieldEnum = makeEnum({
  ItemId: 'ItemId',
  StreamIndex: 'StreamIndex',
  StreamType: 'StreamType',
  Codec: 'Codec',
  Language: 'Language',
  ChannelLayout: 'ChannelLayout',
  Profile: 'Profile',
  AspectRatio: 'AspectRatio',
  Path: 'Path',
  IsIntrlaced: 'IsIntrlaced',
  BitRate: 'BitRate',
  Channels: 'Channels',
  SampleRate: 'SampleRate',
  IsDefault: 'IsDefault',
  IsForced: 'IsForced',
  IsExternal: 'IsExternal',
  Height: 'Height',
  Width: 'Width',
  AverageFrameRate: 'AverageFrameRate',
  RealFrameRate: 'RealFrameRate',
  Level: 'Level',
  PixelFormat: 'PixelFormat',
  BitDepth: 'BitDepth',
  IsAnamorphic: 'IsAnamorphic',
  RefFrames: 'RefFrames',
  CodecTag: 'CodecTag',
  Comment: 'Comment',
  NalLengthSize: 'NalLengthSize',
  IsAvc: 'IsAvc',
  Title: 'Title',
  TimeBase: 'TimeBase',
  CodecTimeBase: 'CodecTimeBase',
  ColorPrimaries: 'ColorPrimaries',
  ColorSpace: 'ColorSpace',
  ColorTransfer: 'ColorTransfer',
  DvVersionMajor: 'DvVersionMajor',
  DvVersionMinor: 'DvVersionMinor',
  DvProfile: 'DvProfile',
  DvLevel: 'DvLevel',
  RpuPresentFlag: 'RpuPresentFlag',
  ElPresentFlag: 'ElPresentFlag',
  BlPresentFlag: 'BlPresentFlag',
  DvBlSignalCompatibilityId: 'DvBlSignalCompatibilityId',
  KeyFrames: 'KeyFrames',
  fileId: 'fileId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.MessagesScalarFieldEnum = makeEnum({
  body: 'body',
  from: 'from',
  id: 'id',
  image: 'image',
  notify: 'notify',
  read: 'read',
  title: 'title',
  to: 'to',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.MetadataScalarFieldEnum = makeEnum({
  id: 'id',
  title: 'title',
  libraryId: 'libraryId'
});

exports.Prisma.MovieScalarFieldEnum = makeEnum({
  id: 'id',
  title: 'title',
  titleSort: 'titleSort',
  duration: 'duration',
  show: 'show',
  folder: 'folder',
  adult: 'adult',
  backdrop: 'backdrop',
  budget: 'budget',
  createdAt: 'createdAt',
  homepage: 'homepage',
  imdbId: 'imdbId',
  originalTitle: 'originalTitle',
  originalLanguage: 'originalLanguage',
  overview: 'overview',
  popularity: 'popularity',
  poster: 'poster',
  releaseDate: 'releaseDate',
  revenue: 'revenue',
  runtime: 'runtime',
  status: 'status',
  tagline: 'tagline',
  trailer: 'trailer',
  tvdbId: 'tvdbId',
  updatedAt: 'updatedAt',
  video: 'video',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  blurHash: 'blurHash',
  libraryId: 'libraryId'
});

exports.Prisma.MusicGenreScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name'
});

exports.Prisma.NotificationTypesScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  manage: 'manage'
});

exports.Prisma.PersonScalarFieldEnum = makeEnum({
  adult: 'adult',
  alsoKnownAs: 'alsoKnownAs',
  biography: 'biography',
  birthday: 'birthday',
  createdAt: 'createdAt',
  deathday: 'deathday',
  gender: 'gender',
  homepage: 'homepage',
  id: 'id',
  imdbId: 'imdbId',
  knownForDepartment: 'knownForDepartment',
  name: 'name',
  placeOfBirth: 'placeOfBirth',
  popularity: 'popularity',
  profilePath: 'profilePath',
  updatedAt: 'updatedAt',
  blurHash: 'blurHash'
});

exports.Prisma.PlaylistScalarFieldEnum = makeEnum({
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  cover: 'cover',
  colorPalette: 'colorPalette',
  blurHash: 'blurHash',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.PlaylistTrackScalarFieldEnum = makeEnum({
  playlistId: 'playlistId',
  trackId: 'trackId',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.ProviderScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  value: 'value',
  metadataId: 'metadataId',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.RecommendationScalarFieldEnum = makeEnum({
  backdrop: 'backdrop',
  id: 'id',
  overview: 'overview',
  poster: 'poster',
  title: 'title',
  titleSort: 'titleSort',
  blurHash: 'blurHash',
  recommendationableId: 'recommendationableId',
  recommendationableType: 'recommendationableType',
  mediaId: 'mediaId',
  mediaType: 'mediaType'
});

exports.Prisma.RunningTaskScalarFieldEnum = makeEnum({
  id: 'id',
  title: 'title',
  value: 'value',
  type: 'type',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.SeasonScalarFieldEnum = makeEnum({
  airDate: 'airDate',
  createdAt: 'createdAt',
  episodeCount: 'episodeCount',
  id: 'id',
  overview: 'overview',
  poster: 'poster',
  seasonNumber: 'seasonNumber',
  title: 'title',
  updatedAt: 'updatedAt',
  blurHash: 'blurHash',
  tvId: 'tvId'
});

exports.Prisma.SimilarScalarFieldEnum = makeEnum({
  backdrop: 'backdrop',
  id: 'id',
  overview: 'overview',
  poster: 'poster',
  title: 'title',
  titleSort: 'titleSort',
  blurHash: 'blurHash',
  mediaId: 'mediaId',
  mediaType: 'mediaType',
  similarableId: 'similarableId',
  similarableType: 'similarableType'
});

exports.Prisma.SortOrder = makeEnum({
  asc: 'asc',
  desc: 'desc'
});

exports.Prisma.SpecialItemScalarFieldEnum = makeEnum({
  id: 'id',
  order: 'order',
  type: 'type',
  specialId: 'specialId',
  episodeId: 'episodeId',
  movieId: 'movieId'
});

exports.Prisma.SpecialScalarFieldEnum = makeEnum({
  backdrop: 'backdrop',
  description: 'description',
  id: 'id',
  poster: 'poster',
  title: 'title',
  blurHash: 'blurHash',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  libraryId: 'libraryId'
});

exports.Prisma.SubtitleLanguageScalarFieldEnum = makeEnum({
  libraryId: 'libraryId',
  languageId: 'languageId'
});

exports.Prisma.TrackScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  track: 'track',
  disc: 'disc',
  cover: 'cover',
  date: 'date',
  folder: 'folder',
  filename: 'filename',
  duration: 'duration',
  quality: 'quality',
  path: 'path',
  lyrics: 'lyrics',
  colorPalette: 'colorPalette',
  blurHash: 'blurHash'
});

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.TranslationScalarFieldEnum = makeEnum({
  biography: 'biography',
  englishName: 'englishName',
  homepage: 'homepage',
  id: 'id',
  iso31661: 'iso31661',
  iso6391: 'iso6391',
  name: 'name',
  overview: 'overview',
  title: 'title',
  translationableId: 'translationableId',
  translationableType: 'translationableType'
});

exports.Prisma.TvScalarFieldEnum = makeEnum({
  id: 'id',
  title: 'title',
  titleSort: 'titleSort',
  haveEpisodes: 'haveEpisodes',
  folder: 'folder',
  backdrop: 'backdrop',
  createdAt: 'createdAt',
  duration: 'duration',
  firstAirDate: 'firstAirDate',
  homepage: 'homepage',
  imdbId: 'imdbId',
  inProduction: 'inProduction',
  lastEpisodeToAir: 'lastEpisodeToAir',
  lastAirDate: 'lastAirDate',
  mediaType: 'mediaType',
  nextEpisodeToAir: 'nextEpisodeToAir',
  numberOfEpisodes: 'numberOfEpisodes',
  numberOfSeasons: 'numberOfSeasons',
  originCountry: 'originCountry',
  originalLanguage: 'originalLanguage',
  overview: 'overview',
  popularity: 'popularity',
  poster: 'poster',
  spokenLanguages: 'spokenLanguages',
  status: 'status',
  tagline: 'tagline',
  trailer: 'trailer',
  tvdbId: 'tvdbId',
  type: 'type',
  updatedAt: 'updatedAt',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  blurHash: 'blurHash',
  libraryId: 'libraryId'
});

exports.Prisma.UserDataScalarFieldEnum = makeEnum({
  id: 'id',
  rating: 'rating',
  played: 'played',
  playCount: 'playCount',
  isFavorite: 'isFavorite',
  playbackPositionTicks: 'playbackPositionTicks',
  lastPlayedDate: 'lastPlayedDate',
  audio: 'audio',
  subtitle: 'subtitle',
  subtitleType: 'subtitleType',
  time: 'time',
  sub_id: 'sub_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  movieId: 'movieId',
  tvId: 'tvId',
  videoFileId: 'videoFileId'
});

exports.Prisma.UserNotificationScalarFieldEnum = makeEnum({
  notificationId: 'notificationId',
  userId: 'userId'
});

exports.Prisma.UserScalarFieldEnum = makeEnum({
  sub_id: 'sub_id',
  email: 'email',
  manage: 'manage',
  owner: 'owner',
  name: 'name',
  allowed: 'allowed',
  audioTranscoding: 'audioTranscoding',
  videoTranscoding: 'videoTranscoding',
  noTranscoding: 'noTranscoding',
  created_at: 'created_at',
  updated_at: 'updated_at'
});

exports.Prisma.VideoFileScalarFieldEnum = makeEnum({
  duration: 'duration',
  filename: 'filename',
  folder: 'folder',
  hostFolder: 'hostFolder',
  id: 'id',
  languages: 'languages',
  quality: 'quality',
  share: 'share',
  subtitles: 'subtitles',
  Chapters: 'Chapters',
  episodeId: 'episodeId',
  movieId: 'movieId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});


exports.Prisma.ModelName = makeEnum({
  Configuration: 'Configuration',
  Library: 'Library',
  EncoderProfileLibrary: 'EncoderProfileLibrary',
  EncoderProfile: 'EncoderProfile',
  SubtitleLanguage: 'SubtitleLanguage',
  Language: 'Language',
  Metadata: 'Metadata',
  LibraryFolder: 'LibraryFolder',
  Folder: 'Folder',
  Provider: 'Provider',
  Country: 'Country',
  ActivityLog: 'ActivityLog',
  Device: 'Device',
  RunningTask: 'RunningTask',
  LibraryUser: 'LibraryUser',
  User: 'User',
  NotificationTypes: 'NotificationTypes',
  UserNotification: 'UserNotification',
  File: 'File',
  MediaAttachments: 'MediaAttachments',
  Mediastreams: 'Mediastreams',
  UserData: 'UserData',
  AlternativeTitles: 'AlternativeTitles',
  Cast: 'Cast',
  CastEpisode: 'CastEpisode',
  CastMovie: 'CastMovie',
  CastSeason: 'CastSeason',
  CastTv: 'CastTv',
  Certification: 'Certification',
  CertificationMovie: 'CertificationMovie',
  CertificationTv: 'CertificationTv',
  Collection: 'Collection',
  CollectionMovie: 'CollectionMovie',
  Creator: 'Creator',
  CreatorTv: 'CreatorTv',
  Crew: 'Crew',
  CrewEpisode: 'CrewEpisode',
  CrewMovie: 'CrewMovie',
  CrewSeason: 'CrewSeason',
  CrewTv: 'CrewTv',
  Episode: 'Episode',
  EpisodeGuestStar: 'EpisodeGuestStar',
  FailedJobs: 'FailedJobs',
  GenreMovie: 'GenreMovie',
  GenreTv: 'GenreTv',
  GuestStar: 'GuestStar',
  Jobs: 'Jobs',
  Keyword: 'Keyword',
  KeywordMovie: 'KeywordMovie',
  KeywordTv: 'KeywordTv',
  Messages: 'Messages',
  Movie: 'Movie',
  Genre: 'Genre',
  Person: 'Person',
  Recommendation: 'Recommendation',
  Season: 'Season',
  Similar: 'Similar',
  Special: 'Special',
  SpecialItem: 'SpecialItem',
  Translation: 'Translation',
  Tv: 'Tv',
  VideoFile: 'VideoFile',
  Image: 'Image',
  Media: 'Media',
  Artist: 'Artist',
  Album: 'Album',
  MusicGenre: 'MusicGenre',
  Track: 'Track',
  Playlist: 'Playlist',
  PlaylistTrack: 'PlaylistTrack',
  FavoriteTrack: 'FavoriteTrack'
});

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

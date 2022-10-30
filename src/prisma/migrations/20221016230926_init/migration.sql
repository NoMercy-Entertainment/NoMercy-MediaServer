-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artistId" TEXT,
    "cover" TEXT,
    "folder" TEXT,
    "share" TEXT NOT NULL DEFAULT 'Media'
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "albumId" TEXT,
    "cover" TEXT,
    "year" INTEGER,
    "share" TEXT NOT NULL DEFAULT 'Media'
);

-- CreateTable
CREATE TABLE "MusicGenre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "track" TEXT,
    "disc" TEXT,
    "cover" TEXT,
    "date" DATETIME NOT NULL,
    "share" TEXT NOT NULL DEFAULT 'Media',
    "folder" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" TEXT,
    "quality" INTEGER,
    "host_folder" TEXT NOT NULL,
    "lyrics" TEXT
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("playlistId", "trackId"),
    CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteTrack" (
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "FavoriteTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ArtistToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ArtistToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArtistToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AlbumToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AlbumToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AlbumToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AlbumToArtist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AlbumToArtist_A_fkey" FOREIGN KEY ("A") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AlbumToArtist_B_fkey" FOREIGN KEY ("B") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MusicGenreToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MusicGenreToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "MusicGenre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MusicGenreToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "artist_id_index" ON "Artist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_artistId_key" ON "Artist"("artistId");

-- CreateIndex
CREATE INDEX "album_track_id_index" ON "Album"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_key" ON "Album"("name");

-- CreateIndex
CREATE INDEX "genre_track_id_index" ON "MusicGenre"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MusicGenre_name_key" ON "MusicGenre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Track_filename_host_folder_key" ON "Track"("filename", "host_folder");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_id_userId_key" ON "Playlist"("id", "userId");

-- CreateIndex
CREATE INDEX "playlist_track_index" ON "PlaylistTrack"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrack_playlistId_trackId_key" ON "PlaylistTrack"("playlistId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteTrack_trackId_userId_key" ON "FavoriteTrack"("trackId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToTrack_AB_unique" ON "_ArtistToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToTrack_B_index" ON "_ArtistToTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToTrack_AB_unique" ON "_AlbumToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToTrack_B_index" ON "_AlbumToTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToArtist_AB_unique" ON "_AlbumToArtist"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToArtist_B_index" ON "_AlbumToArtist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MusicGenreToTrack_AB_unique" ON "_MusicGenreToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_MusicGenreToTrack_B_index" ON "_MusicGenreToTrack"("B");

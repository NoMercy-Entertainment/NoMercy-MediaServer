/*
 SQLite does not support "Drop not null from column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/
PRAGMA foreign_keys = 0;

--> statement-breakpoint

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM images;

--> statement-breakpoint
DROP TABLE images;

--> statement-breakpoint
CREATE TABLE images (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT
                           NOT NULL,
    aspectRatio   REAL,
    height        INTEGER,
    iso6391       TEXT,
    name          TEXT,
    site          TEXT,
    size          INTEGER,
    filePath      TEXT     NOT NULL,
    type          TEXT,
    width         INTEGER,
    voteAverage   REAL,
    voteCount     INTEGER,
    colorPalette  TEXT,
    blurHash      TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                           NOT NULL,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                           NOT NULL,
    cast_id       TEXT,
    crew_id       TEXT,
    person_id     INTEGER,
    artist_id     TEXT,
    album_id      TEXT,
    track_id      TEXT,
    tv_id         INTEGER,
    season_id     INTEGER,
    episode_id    INTEGER,
    movie_id      INTEGER,
    collection_id INTEGER,
    FOREIGN KEY (
        cast_id
    )
    REFERENCES casts (id) ON UPDATE CASCADE
                          ON DELETE CASCADE,
    FOREIGN KEY (
        crew_id
    )
    REFERENCES crews (id) ON UPDATE CASCADE
                          ON DELETE CASCADE,
    FOREIGN KEY (
        person_id
    )
    REFERENCES people (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        artist_id
    )
    REFERENCES artists (id) ON UPDATE CASCADE
                            ON DELETE CASCADE,
    FOREIGN KEY (
        album_id
    )
    REFERENCES albums (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        track_id
    )
    REFERENCES tracks (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        tv_id
    )
    REFERENCES tvs (id) ON UPDATE CASCADE
                        ON DELETE CASCADE,
    FOREIGN KEY (
        season_id
    )
    REFERENCES seasons (id) ON UPDATE CASCADE
                            ON DELETE CASCADE,
    FOREIGN KEY (
        episode_id
    )
    REFERENCES episodes (id) ON UPDATE CASCADE
                             ON DELETE CASCADE,
    FOREIGN KEY (
        movie_id
    )
    REFERENCES movies (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        collection_id
    )
    REFERENCES collections (id) ON UPDATE CASCADE
                                ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO images (
                       id,
                       aspectRatio,
                       height,
                       iso6391,
                       name,
                       site,
                       size,
                       filePath,
                       type,
                       width,
                       voteAverage,
                       voteCount,
                       colorPalette,
                       blurHash,
                       created_at,
                       updated_at,
                       cast_id,
                       crew_id,
                       person_id,
                       artist_id,
                       album_id,
                       track_id,
                       tv_id,
                       season_id,
                       episode_id,
                       movie_id,
                       collection_id
                   )
                   SELECT id,
                          aspectRatio,
                          height,
                          iso6391,
                          name,
                          site,
                          size,
                          filePath,
                          type,
                          width,
                          voteAverage,
                          voteCount,
                          colorPalette,
                          blurHash,
                          created_at,
                          updated_at,
                          cast_id,
                          crew_id,
                          person_id,
                          artist_id,
                          album_id,
                          track_id,
                          tv_id,
                          season_id,
                          episode_id,
                          movie_id,
                          collection_id
                     FROM sqlitestudio_temp_table;

--> statement-breakpoint
DROP TABLE sqlitestudio_temp_table;

--> statement-breakpoint
PRAGMA foreign_keys = 1;

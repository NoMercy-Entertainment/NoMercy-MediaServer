PRAGMA foreign_keys = 0;
--> statement-breakpoint

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM medias;

--> statement-breakpoint
DROP TABLE medias;

--> statement-breakpoint
CREATE TABLE medias (
    id           TEXT    PRIMARY KEY,
    aspectRatio  REAL,
    height       INTEGER,
    iso6391      TEXT,
    name         TEXT,
    site         TEXT,
    size         INTEGER,
    src          TEXT    NOT NULL,
    type         TEXT,
    voteAverage  REAL,
    voteCount    INTEGER,
    width        INTEGER,
    colorPalette TEXT,
    blurHash     TEXT,
    created_at   TEXT    DEFAULT CURRENT_TIMESTAMP
                         NOT NULL,
    updated_at   TEXT    DEFAULT CURRENT_TIMESTAMP
                         NOT NULL,
    tv_id        INTEGER,
    season_id    INTEGER,
    episode_id   INTEGER,
    movie_id     INTEGER,
    person_id    INTEGER,
    videoFile_id INTEGER,
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
        person_id
    )
    REFERENCES people (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        videoFile_id
    )
    REFERENCES videoFiles (id) ON UPDATE CASCADE
                               ON DELETE CASCADE
);
--> statement-breakpoint

INSERT INTO medias (
                       id,
                       aspectRatio,
                       height,
                       iso6391,
                       name,
                       site,
                       size,
                       src,
                       type,
                       voteAverage,
                       voteCount,
                       width,
                       colorPalette,
                       blurHash,
                       created_at,
                       updated_at,
                       tv_id,
                       season_id,
                       episode_id,
                       movie_id,
                       person_id,
                       videoFile_id
                   )
                   SELECT id,
                          aspectRatio,
                          height,
                          iso6391,
                          name,
                          site,
                          size,
                          src,
                          type,
                          voteAverage,
                          voteCount,
                          width,
                          colorPalette,
                          blurHash,
                          created_at,
                          updated_at,
                          tv_id,
                          season_id,
                          episode_id,
                          movie_id,
                          person_id,
                          videoFile_id
                     FROM sqlitestudio_temp_table;

--> statement-breakpoint
DROP TABLE sqlitestudio_temp_table;

--> statement-breakpoint
PRAGMA foreign_keys = 1;

PRAGMA foreign_keys = 0;

--> statement-breakpoint
CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM crews;

--> statement-breakpoint
DROP TABLE crews;

--> statement-breakpoint
CREATE TABLE crews (
    id         TEXT    PRIMARY KEY
                       NOT NULL,
    person_id  INTEGER NOT NULL,
    movie_id   INTEGER,
    tv_id      INTEGER,
    season_id  INTEGER,
    episode_id INTEGER,
    FOREIGN KEY (
        person_id
    )
    REFERENCES people (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        movie_id
    )
    REFERENCES movies (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    FOREIGN KEY (
        tv_id
    )
    REFERENCES tvs (id) ON DELETE CASCADE
                        ON UPDATE CASCADE,
    FOREIGN KEY (
        season_id
    )
    REFERENCES seasons (id) ON UPDATE CASCADE
                            ON DELETE CASCADE,
    FOREIGN KEY (
        episode_id
    )
    REFERENCES episodes (id) ON UPDATE CASCADE
                             ON DELETE CASCADE
);

--> statement-breakpoint
INSERT INTO crews (
                      id,
                      person_id,
                      movie_id,
                      tv_id,
                      season_id,
                      episode_id
                  )
                  SELECT id,
                         person_id,
                         movie_id,
                         tv_id,
                         season_id,
                         episode_id
                    FROM sqlitestudio_temp_table;

--> statement-breakpoint
DROP TABLE sqlitestudio_temp_table;

--> statement-breakpoint
CREATE UNIQUE INDEX crews_episodes_unique ON crews (
    id,
    person_id,
    episode_id
);

--> statement-breakpoint
CREATE UNIQUE INDEX crews_movie_unique ON crews (
    id,
    person_id,
    movie_id
);

--> statement-breakpoint
CREATE UNIQUE INDEX crews_seasons_unique ON crews (
    id,
    person_id,
    season_id
);

--> statement-breakpoint
CREATE UNIQUE INDEX crews_tv_unique ON crews (
    id,
    person_id,
    tv_id
);

--> statement-breakpoint
PRAGMA foreign_keys = 1;

PRAGMA foreign_keys = 0;
--> statement-breakpoint

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM folder_library;
--> statement-breakpoint

DROP TABLE folder_library;
--> statement-breakpoint

CREATE TABLE folder_library (
    folder_id  TEXT NOT NULL,
    library_id TEXT NOT NULL,
    PRIMARY KEY (
        folder_id,
        library_id
    ),
    FOREIGN KEY (
        folder_id
    )
    REFERENCES folders (id) ON DELETE CASCADE
                            ON UPDATE CASCADE,
    FOREIGN KEY (
        library_id
    )
    REFERENCES libraries (id) ON DELETE CASCADE
                              ON UPDATE CASCADE
);
--> statement-breakpoint

INSERT INTO folder_library (
                               folder_id,
                               library_id
                           )
                           SELECT folder_id,
                                  library_id
                             FROM sqlitestudio_temp_table;
--> statement-breakpoint

DROP TABLE sqlitestudio_temp_table;
--> statement-breakpoint

PRAGMA foreign_keys = 1;

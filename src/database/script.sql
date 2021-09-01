CREATE TABLE person (
    id varchar(36) NOT NULL PRIMARY KEY,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    date_created timestamp,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    birthdate date,
    living_in varchar(255),
    education varchar(255),
    working_at varchar(255),
    hobby varchar(255)
);

CREATE TABLE friendship (
    id varchar(36) NOT NULL PRIMARY KEY,
    date_created timestamp,
    friend_1_id varchar(36) NOT NULL,
    friend_2_id varchar(36) NOT NULL,
    FOREIGN KEY (friend_1_id) REFERENCES person (id),
    FOREIGN KEY (friend_2_id) REFERENCES person (id)
);

CREATE TABLE post (
    id varchar(36) NOT NULL PRIMARY KEY,
    date_created timestamp,
    posted_by varchar(36) NOT NULL,
    content varchar(255),
    FOREIGN KEY (posted_by) REFERENCES person (id)
);

CREATE TABLE hashtag (
    id varchar(36) NOT NULL PRIMARY KEY,
    date_created timestamp,
    hashtag varchar(255)
);

CREATE TABLE post_like (
    id varchar(36) NOT NULL PRIMARY KEY,
    date_created timestamp,
    liked_by varchar(36) NOT NULL,
    post_id varchar(36) NOT NULL,
    FOREIGN KEY (liked_by) REFERENCES person (id),
    FOREIGN KEY (post_id) REFERENCES post (id)
);

CREATE TABLE activity (
    id varchar(36) NOT NULL PRIMARY KEY,
    date_created timestamp,
    commited_by varchar(36) NOT NULL,
    ac_type varchar(255),
    target_user varchar(36),
    FOREIGN KEY (commited_by) REFERENCES person (id),
    FOREIGN KEY (target_user) REFERENCES person (id)
);

## Database Query

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    hashed_password BINARY(16) NOT NULL,
    salt BINARY(16) NOT NULL,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    location INT NULL,
    birthday DATE NULL,
    avatar INT DEFAULT 5
);

CREATE TABLE subscriptions (
    user_id INT,
    subscribed_id INT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (subscribed_id) REFERENCES users (id),
    PRIMARY KEY (user_id, subscribed_id)
);

CREATE TABLE posts (
    id INT NOT NULL AUTO_INCREMENT,
    author INT NOT NULL,
    header TEXT,
    content MEDIUMTEXT,
    likes INT DEFAULT 0,
    deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (author) REFERENCES users (id),
    CONSTRAINT PK_id PRIMARY KEY (id)
);

CREATE TABLE comments (
    id INT NOT NULL AUTO_INCREMENT,
    post_id INT NOT NULL,
    author INT,
    content MEDIUMTEXT,
    deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (author) REFERENCES users (id),
    CONSTRAINT PK_id PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30)
);

CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (role_id) REFERENCES roles (id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE meeting_types(
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(15)
);

CREATE TABLE meetings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    date DATE NOT NULL ,
    type_id INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'upcoming',
    creator INT NOT NULL,
    chief INT NOT NULL,
    FOREIGN KEY (type_id) REFERENCES meeting_types (id),
    FOREIGN KEY (creator) REFERENCES users (id),
    FOREIGN KEY (chief) REFERENCES users (id)
);

CREATE TABLE user_meetings (
    user_id INT NOT NULL,
    meeting_id INT NOT NULL,
    date_joined DATE NOT NULL DEFAULT NOW(),
    important BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (user_id, meeting_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
);

CREATE TABLE meeting_msg (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author INT NOT NULL,
    meeting_id INT NOT NULL,
    reference_msg INT NOT NULL,
    content MEDIUMTEXT,
    status VARCHAR(30),
    FOREIGN KEY (author) REFERENCES users (id),
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
);

CREATE TABLE user_likes (
user_id INT,
post_id INT,
PRIMARY KEY (user_id, post_id),
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (post_id) REFERENCES posts (id)
);

CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL (12, 8),
    longitude DECIMAL (12,8),
    country VARCHAR (30),
    city VARCHAR (40),
    postal_code VARCHAR (30),
    details VARCHAR (120)
);

CREATE TABLE places (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    paradigm VARCHAR(30) NOT NULL,
    location_id INT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    path VARCHAR (60)
);

CREATE TABLE meeting_img (
    meeting_id INT,
    img_id INT,
    FOREIGN KEY (img_id) REFERENCES images (id)
);

CREATE TABLE place_meetings (
    meeting_id INT NOT NULL,
    place_id INT NOT NULL,
    PRIMARY KEY (meeting_id, place_id),
    FOREIGN KEY (meeting_id) REFERENCES meetings (id),
    FOREIGN KEY (place_id) REFERENCES places (id)
);

CREATE TABLE user_imgs (
    user_id INT NOT NULL,
    img_id INT NOT NULL,
    PRIMARY KEY (user_id, img_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (img_id) REFERENCES images (id)
);

CREATE TABLE ratings (
    place_id INT NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL,
    PRIMARY KEY (place_id, user_id) ,
    FOREIGN KEY (place_id) REFERENCES places (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TRIGGER insert_place_rating
    AFTER INSERT
        ON ratings FOR EACH ROW
        	UPDATE places SET rating = (SELECT AVG(ratings.rating) FROM ratings WHERE place_id = new.place_id);
            
CREATE TRIGGER update_place_rating
    AFTER UPDATE
        ON ratings FOR EACH ROW
        	UPDATE places SET rating = (SELECT AVG(ratings.rating) FROM ratings WHERE place_id = new.place_id);


ALTER TABLE users
    ADD CONSTRAINT FK_UserPlace
    	FOREIGN KEY (location) REFERENCES locations(id);


INSERT INTO meeting_types (name) VALUES
    ('Hang Out'),
    ('Business'),
    ('Date');

INSERT INTO roles (name) VALUES
    ('USER'),
    ('MANAGER'),
    ('ADMIN');

CREATE TRIGGER give_user_role   
    AFTER INSERT
        ON users FOR EACH ROW
            INSERT INTO user_roles (user_id, role_id)
            VALUES (new.id, 1);
\echo 'Delete and recreate messagely db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely;
CREATE DATABASE messagely;
\connect messagely


CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
  VALUES
    ('johny-chongy', 'password', 'john', 'chong', '5465', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('stevezevie', 'password', 'steven', 'zhang', '1234', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('zestytesty', 'password', 'testy', 'zest', '9878', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO messages (from_username, to_username, body, sent_at)
  VALUES
    ('johny-chongy', 'stevezevie', 'yoyo test1', CURRENT_TIMESTAMP),
    ('stevezevie', 'johny-chongy', 'reply1', CURRENT_TIMESTAMP),
    ('johny-chongy', 'stevezevie', 'fill more', CURRENT_TIMESTAMP),
    ('johny-chongy', 'zestytesty', 'hi testy', CURRENT_TIMESTAMP),
    ('zestytesty', 'stevezevie', 'hi stevie', CURRENT_TIMESTAMP);

\echo 'Delete and recreate messagely_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely_test;
CREATE DATABASE messagely_test;
\connect messagely_test

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

-- INSERT INTO users (username, password, first_name, last_name, phone, join_at)
--   VALUES
--     ('johny-chongy', 'password', 'john', 'chong', '5465', CURRENT_TIMESTAMP),
--     ('stevezevie', 'password', 'steven', 'zhang', '1234', CURRENT_TIMESTAMP),
--     ('zestytesty', 'password', 'testy', 'zest', '9878', CURRENT_TIMESTAMP);

-- INSERT INTO messages (from_username, to_username, body, sent_at)
--   VALUES
--     ('johny-chongy', 'stevezevie', 'yoyo test1', CURRENT_TIMESTAMP),
--     ('stevezevie', 'johny-chongy', 'reply1', CURRENT_TIMESTAMP),
--     ('johny-chongy', 'stevezevie', 'fill more', CURRENT_TIMESTAMP),
--     ('johny-chongy', 'zestytesty', 'hi testy', CURRENT_TIMESTAMP),
--     ('zestytesty', 'stevezevie', 'hi stevie', CURRENT_TIMESTAMP);


Database Structure
==================

(PostgreSQL)

Login-Role
----------

CREATE ROLE calendar LOGIN
  ENCRYPTED PASSWORD 'md5d59e94521cf2928c17e7355929775433'
  NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;


Database
--------

CREATE DATABASE calendar
  WITH OWNER = calendar
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'German_Germany.1252'
       LC_CTYPE = 'German_Germany.1252'
       CONNECTION LIMIT = -1;
       
       
Tables
------

CREATE TABLE calendar
(
  id serial NOT NULL,
  title character varying(25),
  description character varying(200),
  start_date character varying(10),
  end_date character varying(10),
  start_time character varying(5),
  end_time character varying(5),
  allday boolean DEFAULT false,
  userid integer,
  CONSTRAINT calendar_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE calendar
  OWNER TO calendar;
  
  
  
CREATE TABLE users
(
  id serial NOT NULL,
  username character varying(25),
  email character varying,
  pass character varying(16),
  validated boolean,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO calendar;

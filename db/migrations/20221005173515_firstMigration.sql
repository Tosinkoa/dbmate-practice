-- migrate:down
drop table if exists users;
drop table if exists session;

-- migrate:up
create table session (
    sid text primary key not null,
    sess json not null,
    expire timestamptz not null
);

-- migrate:up
create schema if not exists hidden;

-- migrate:up
create unlogged table if not exists hidden.sessions (
    sid text primary key not null,
    sess json not null,
    expire timestamptz not null
);

-- migrate:up
create table if not exists users (
    id serial primary key,
    email varchar (100) not null,
    password varchar (200) not null,
    created_at timestamp with time zone default now()
);

-- migrate:up
create table if not exists post (
    id serial primary key,
    title varchar not null,
    body varchar (200) not null,
    food text [],
    created_at timestamptz not null default now(),
    updateed_at timestamptz not null
);
drop table if exists users;

drop table if exists session;

create table session (
    sid text primary key not null,
    sess json not null,
    expire timestamptz not null
);

create index idx_session_expire on session(expire);

create table users (
    id serial primary key,
    email varchar (100) not null,
    password varchar (200) not null,
    created_at timestamp with time zone default now()
);

create table post (
    id serial primary key,
    title varchar not null,
    body varchar (200) not null,
    food text [],
    created_at timestamptz not null default now(),
    updateed_at timestamptz not null
);
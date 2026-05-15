--
-- PostgreSQL database dump
--

\restrict AeXuBOQAaZ9wKDwKCz7k6zbNGJWZ9KXUSugAe88Xf8uwGitxE3ICylM5m0muJ2a

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: events_displaycategory_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_displaycategory_enum AS ENUM (
    'HERO',
    'FEATURED',
    'HIGHLIGHT',
    'NORMAL'
);


ALTER TYPE public.events_displaycategory_enum OWNER TO postgres;

--
-- Name: events_eventcategory_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_eventcategory_enum AS ENUM (
    'ACADEMIC',
    'CULTURE',
    'SPORT',
    'COMMUNITY',
    'NATIONAL',
    'SCHOOL',
    'SEMINAR'
);


ALTER TYPE public.events_eventcategory_enum OWNER TO postgres;

--
-- Name: events_scale_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_scale_enum AS ENUM (
    'UNIT',
    'SCHOOL',
    'CITY',
    'NATIONAL'
);


ALTER TYPE public.events_scale_enum OWNER TO postgres;

--
-- Name: events_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.events_status_enum AS ENUM (
    'DRAFT',
    'UPCOMING',
    'OPEN',
    'ONGOING',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public.events_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location character varying(500) NOT NULL,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    "registrationDeadline" timestamp with time zone,
    status public.events_status_enum DEFAULT 'UPCOMING'::public.events_status_enum NOT NULL,
    "isCancelled" boolean DEFAULT false NOT NULL,
    "displayCategory" public.events_displaycategory_enum DEFAULT 'NORMAL'::public.events_displaycategory_enum NOT NULL,
    "eventCategory" public.events_eventcategory_enum DEFAULT 'ACADEMIC'::public.events_eventcategory_enum NOT NULL,
    scale public.events_scale_enum DEFAULT 'SCHOOL'::public.events_scale_enum NOT NULL,
    faculty character varying(255),
    organizer character varying(255),
    "contactEmail" character varying(100),
    "contactPhone" character varying(20),
    "maxParticipants" integer,
    "registeredCount" integer DEFAULT 0 NOT NULL,
    "imageUrl" text,
    "bannerUrl" text,
    tags text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" integer
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: import_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.import_history (
    id integer NOT NULL,
    "eventId" integer NOT NULL,
    "importedBy" integer NOT NULL,
    "fileName" character varying NOT NULL,
    "totalRows" integer DEFAULT 0 NOT NULL,
    "successCount" integer DEFAULT 0 NOT NULL,
    "failedCount" integer DEFAULT 0 NOT NULL,
    errors text,
    "importedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.import_history OWNER TO postgres;

--
-- Name: import_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.import_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.import_history_id_seq OWNER TO postgres;

--
-- Name: import_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.import_history_id_seq OWNED BY public.import_history.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: registration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registration (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "eventId" integer NOT NULL,
    status character varying DEFAULT 'REGISTERED'::character varying NOT NULL,
    "qrCode" character varying,
    "checkedInAt" timestamp without time zone,
    "checkedBy" integer,
    "registeredAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.registration OWNER TO postgres;

--
-- Name: registration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registration_id_seq OWNER TO postgres;

--
-- Name: registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registration_id_seq OWNED BY public.registration.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role character varying DEFAULT 'STUDENT'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: import_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_history ALTER COLUMN id SET DEFAULT nextval('public.import_history_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: registration id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration ALTER COLUMN id SET DEFAULT nextval('public.registration_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, description, location, "startDate", "endDate", "registrationDeadline", status, "isCancelled", "displayCategory", "eventCategory", scale, faculty, organizer, "contactEmail", "contactPhone", "maxParticipants", "registeredCount", "imageUrl", "bannerUrl", tags, "createdAt", "updatedAt", "createdBy") FROM stdin;
2	Bán kết cuộc thi khởi nghiệp	Công bố top 20 của cuộc thi và tiêu chí cho chung kết	Hội trường B	2026-07-10 15:00:00+07	2026-07-10 18:00:00+07	2026-07-10 06:59:59+07	UPCOMING	f	NORMAL	ACADEMIC	SCHOOL	IT	\N	\N	\N	100	0	https://images.trvl-media.com/localexpert/1790496/71d84da1-ebdb-49a6-a1e2-75936c03475f.jpg?impolicy=resizecrop&rw=1005&rh=565	\N	\N	2026-05-04 10:25:30.773432+07	2026-05-04 10:25:30.773432+07	1
1	Lễ chào đón tân sinh K31	Lễ chào đón và kết nạp hội viên khóa K31	Hội trường A	2026-05-10 15:00:00+07	2026-05-10 18:00:00+07	2026-05-10 06:59:59+07	OPEN	f	NORMAL	ACADEMIC	SCHOOL	IT	Khoa CNTT	\N	\N	100	0	https://images.trvl-media.com/localexpert/1790496/71d84da1-ebdb-49a6-a1e2-75936c03475f.jpg?impolicy=resizecrop&rw=1005&rh=565	\N	\N	2026-05-04 10:07:07.679702+07	2026-05-04 13:05:46.363154+07	1
\.


--
-- Data for Name: import_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.import_history (id, "eventId", "importedBy", "fileName", "totalRows", "successCount", "failedCount", errors, "importedAt") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1775751544288	CreateUser1775751544288
3	1775795013098	CreateEvent1775795013098
4	1775788473889	SeedSuperAdmin1775788473889
5	1775752000000	SeedUsers1775752000000
\.


--
-- Data for Name: registration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registration (id, "userId", "eventId", status, "qrCode", "checkedInAt", "checkedBy", "registeredAt") FROM stdin;
1	3	1	REGISTERED	data:image/png;base64,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	\N	\N	2026-05-04 06:06:15.02218
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, email, password, role, "isActive", "createdAt", "updatedAt") FROM stdin;
1	superadmin1	superadmin1@school.edu	$2b$10$OkjqtEOrA.WniGB2GZxBvObsdEpXAwG8UGAIZNSJcTtbL2c03Fxpe	SUPER_ADMIN	t	2026-05-03 16:02:35.406863	2026-05-03 16:02:35.406863
2	admin	admin@school.edu	$2b$10$ufRYqJplBNECXnalKC3LZeUdL0PIhykUeSOBMb0wrX/9la9Ollgny	ADMIN	t	2026-05-03 16:04:40.010279	2026-05-03 16:04:40.010279
3	sv01	sv01@school.edu	$2b$10$hEyJvRrTUNwEmjhvSKIfLeCmEMHZrmo7sR1VE0nQYre65K9K6g7dO	STUDENT	t	2026-05-03 16:04:40.010279	2026-05-03 16:04:40.010279
4	sv02	sv02@school.edu	$2b$10$hEyJvRrTUNwEmjhvSKIfLeCmEMHZrmo7sR1VE0nQYre65K9K6g7dO	STUDENT	t	2026-05-03 16:04:40.010279	2026-05-03 16:04:40.010279
\.


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 3, true);


--
-- Name: import_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.import_history_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 5, true);


--
-- Name: registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registration_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 4, true);


--
-- Name: import_history PK_18a2e880c124ce5283b6ca6fc98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_history
    ADD CONSTRAINT "PK_18a2e880c124ce5283b6ca6fc98" PRIMARY KEY (id);


--
-- Name: events PK_40731c7151fe4be3116e45ddf73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: registration PK_cb23dc9d28df8801b15e9e2b8d6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT "PK_cb23dc9d28df8801b15e9e2b8d6" PRIMARY KEY (id);


--
-- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: IDX_03dcebc1ab44daa177ae9479c4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_03dcebc1ab44daa177ae9479c4" ON public.events USING btree (status);


--
-- Name: IDX_36305be594fe2364c89b1f00aa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_36305be594fe2364c89b1f00aa" ON public.events USING btree ("eventCategory");


--
-- Name: IDX_c4fc28b63512e6a8b87cef71a7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c4fc28b63512e6a8b87cef71a7" ON public.events USING btree ("startDate", "endDate");


--
-- Name: registration FK_af6d07a8391d587c4dd40e7a5a9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT "FK_af6d07a8391d587c4dd40e7a5a9" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: import_history FK_c48984503abe981a54178b80062; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_history
    ADD CONSTRAINT "FK_c48984503abe981a54178b80062" FOREIGN KEY ("importedBy") REFERENCES public."user"(id);


--
-- Name: registration FK_c9cbfae000488578b2bb322c8bd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT "FK_c9cbfae000488578b2bb322c8bd" FOREIGN KEY ("eventId") REFERENCES public.events(id);


--
-- Name: import_history FK_ebdf06c2a7ddc54a6b5421dbd6d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_history
    ADD CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d" FOREIGN KEY ("eventId") REFERENCES public.events(id);


--
-- PostgreSQL database dump complete
--

\unrestrict AeXuBOQAaZ9wKDwKCz7k6zbNGJWZ9KXUSugAe88Xf8uwGitxE3ICylM5m0muJ2a


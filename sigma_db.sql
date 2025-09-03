--
-- PostgreSQL database dump
--

\restrict 2XU2OFf7QEte0IlsscySYQIE1FghlvLc4jwhHWXI9uQ3uoYlEvHxKeQduFwqbOS

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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
-- Name: estado_proyecto; Type: TYPE; Schema: public; Owner: dcolom
--

CREATE TYPE public.estado_proyecto AS ENUM (
    'Activo',
    'Inactivo',
    'En Desarrollo',
    'Mantenimiento'
);


ALTER TYPE public.estado_proyecto OWNER TO dcolom;

--
-- Name: rol_staff; Type: TYPE; Schema: public; Owner: dcolom
--

CREATE TYPE public.rol_staff AS ENUM (
    'Developer',
    'QA',
    'PM',
    'Designer',
    'DevOps'
);


ALTER TYPE public.rol_staff OWNER TO dcolom;

--
-- Name: tier_proyecto; Type: TYPE; Schema: public; Owner: dcolom
--

CREATE TYPE public.tier_proyecto AS ENUM (
    'Tier 1',
    'Tier 2',
    'Tier 3'
);


ALTER TYPE public.tier_proyecto OWNER TO dcolom;

--
-- Name: modalidad_staff; Type: TYPE; Schema: public; Owner: dcolom
--

CREATE TYPE public.modalidad_staff AS ENUM (
    'Full-time',
    'Part-time',
    'Contractor'
);


ALTER TYPE public.modalidad_staff OWNER TO dcolom;

--
-- Name: experiencia_staff; Type: TYPE; Schema: public; Owner: dcolom
--

CREATE TYPE public.experiencia_staff AS ENUM (
    'Junior',
    'Mid',
    'Senior'
);


ALTER TYPE public.experiencia_staff OWNER TO dcolom;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: backend_details; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.backend_details (
    id integer NOT NULL,
    proyecto_id integer,
    lenguaje_principal_bckend character varying(100),
    version_utilizada character varying(50),
    lenguaje_secundario character varying(100),
    framework_bckend character varying(100),
    otras_librerias text
);


ALTER TABLE public.backend_details OWNER TO dcolom;

--
-- Name: backend_details_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.backend_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.backend_details_id_seq OWNER TO dcolom;

--
-- Name: backend_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.backend_details_id_seq OWNED BY public.backend_details.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    proyecto_id integer,
    cliente character varying(255),
    mail_cliente character varying(255),
    cel_cliente character varying(50),
    observacion_general text,
    nombre_publico character varying(255),
    nombre_interno character varying(255),
    tipo character varying(100),
    fecha_inicio_desarrollo date,
    estado public.estado_proyecto,
    dependencia_uso character varying(255),
    uso_interno_ministerio boolean,
    uso_interno_equipo_desarrollo boolean
);


ALTER TABLE public.clientes OWNER TO dcolom;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clientes_id_seq OWNER TO dcolom;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: frontend_details; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.frontend_details (
    id integer NOT NULL,
    proyecto_id integer,
    lenguaje_principal_frontend character varying(100),
    framework_frontend character varying(100),
    otras_librerias_requeridas text,
    herramientas_desarrollo character varying(255),
    ide_compiladores character varying(255),
    version_ide_comp character varying(50),
    modo_licenciamiento character varying(100)
);


ALTER TABLE public.frontend_details OWNER TO dcolom;

--
-- Name: frontend_details_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.frontend_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.frontend_details_id_seq OWNER TO dcolom;

--
-- Name: frontend_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.frontend_details_id_seq OWNED BY public.frontend_details.id;


--
-- Name: infraestructura; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.infraestructura (
    id integer NOT NULL,
    proyecto_id integer,
    arq_hardware character varying(255),
    hosting_en_data_center boolean,
    virtualizado boolean,
    ubicacion_servidor character varying(255),
    servidor_web character varying(100),
    nombre_comercial_srv character varying(100),
    version_srv character varying(50),
    hosting_srv boolean,
    virtualizado_srv boolean,
    ubicacion_srv character varying(255),
    escalado_srv character varying(100),
    entorno_cliente_so_soportadas text,
    navegadores_versiones text,
    req_instalar_paq_adicionales boolean,
    paquetes_adicionales_necesarios text,
    modelo_seguridad text,
    posee_entorno_test boolean,
    test_automatico boolean,
    ubicacion_doc_deploy character varying(255)
);


ALTER TABLE public.infraestructura OWNER TO dcolom;

--
-- Name: infraestructura_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.infraestructura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.infraestructura_id_seq OWNER TO dcolom;

--
-- Name: infraestructura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.infraestructura_id_seq OWNED BY public.infraestructura.id;


--
-- Name: licencias; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.licencias (
    id integer NOT NULL,
    proyecto_id integer,
    herramientas_desarrollo character varying(255),
    ide_compiladores character varying(255),
    version_ide_comp character varying(50),
    modo_licenciamiento_ide character varying(100),
    base_datos_nombre_comercial character varying(100),
    version_bd character varying(50),
    modo_licencia_bd character varying(100),
    tipo_licencia_bd character varying(100),
    herramienta_desarrollo_bd character varying(255),
    tamano_actual character varying(50),
    tamano_max_permitido character varying(50),
    servidor_que_aloja character varying(255),
    mantenimiento text,
    backup_periodico boolean,
    depuracion_automatica boolean,
    responsable_mantenimiento character varying(255),
    contiene_store_procedure boolean,
    servidor_ejecucion_so character varying(100),
    version_so character varying(50)
);


ALTER TABLE public.licencias OWNER TO dcolom;

--
-- Name: licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.licencias_id_seq OWNER TO dcolom;

--
-- Name: licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.licencias_id_seq OWNED BY public.licencias.id;


--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.proyectos (
    id integer NOT NULL,
    titulo_proyecto character varying(255) NOT NULL,
    proyecto_activo boolean,
    storyline text,
    origen_dependencia character varying(255),
    subsecretaria_direccion character varying(255),
    categoria character varying(255),
    subcategoria character varying(255),
    tier public.tier_proyecto,
    cantidad_recursos_asignados integer,
    recursos text,
    urls text,
    captura character varying(255),
    caratula character varying(255),
    ticketera_interna text,
    ticketera_externa text
);


ALTER TABLE public.proyectos OWNER TO dcolom;

--
-- Name: proyectos_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.proyectos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proyectos_id_seq OWNER TO dcolom;

--
-- Name: proyectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.proyectos_id_seq OWNED BY public.proyectos.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    contrato character varying(100),
    rol public.rol_staff,
    nombres character varying(255),
    apellidos character varying(255),
    activo boolean,
    comentario text,
    modalidad public.modalidad_staff,
    experiencia public.experiencia_staff,
    origen character varying(100),
    email character varying(255),
    skills text,
    desempeno_ley_dto character varying(255),
    hhee character varying(50),
    ur character varying(50),
    coordinacion character varying(255),
    presencialidad character varying(100),
    cumpleanos character varying(50),
    edad integer
);


ALTER TABLE public.staff OWNER TO dcolom;

--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.staff_id_seq OWNER TO dcolom;

--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: staff_proyectos; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.staff_proyectos (
    staff_id integer NOT NULL,
    proyecto_id integer NOT NULL
);


ALTER TABLE public.staff_proyectos OWNER TO dcolom;

--
-- Name: tecnologias; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.tecnologias (
    id integer NOT NULL,
    proyecto_id integer,
    lenguaje_desarrollo character varying(255),
    base_datos character varying(255),
    control_versiones character varying(100),
    tamano_bd character varying(50),
    alojamiento_infra character varying(255),
    label character varying(255),
    mantenimiento_soporte text,
    status_pmo character varying(100),
    status_salud character varying(100),
    changelog character varying(255),
    ano_inicio_sistema integer,
    usuarios_internos integer,
    usuarios_externos integer
);


ALTER TABLE public.tecnologias OWNER TO dcolom;

--
-- Name: tecnologias_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.tecnologias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tecnologias_id_seq OWNER TO dcolom;

--
-- Name: tecnologias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.tecnologias_id_seq OWNED BY public.tecnologias.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL
);


ALTER TABLE public.usuarios OWNER TO dcolom;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO dcolom;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: integraciones; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.integraciones (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL
);


ALTER TABLE public.integraciones OWNER TO dcolom;

--
-- Name: integraciones_id_seq; Type: SEQUENCE; Schema: public; Owner: dcolom
--

CREATE SEQUENCE public.integraciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integraciones_id_seq OWNER TO dcolom;

--
-- Name: integraciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dcolom
--

ALTER SEQUENCE public.integraciones_id_seq OWNED BY public.integraciones.id;


--
-- Name: proyecto_integraciones; Type: TABLE; Schema: public; Owner: dcolom
--

CREATE TABLE public.proyecto_integraciones (
    proyecto_id integer NOT NULL,
    integracion_id integer NOT NULL
);


ALTER TABLE public.proyecto_integraciones OWNER TO dcolom;


--
-- Name: backend_details id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.backend_details ALTER COLUMN id SET DEFAULT nextval('public.backend_details_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: frontend_details id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.frontend_details ALTER COLUMN id SET DEFAULT nextval('public.frontend_details_id_seq'::regclass);


--
-- Name: infraestructura id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.infraestructura ALTER COLUMN id SET DEFAULT nextval('public.infraestructura_id_seq'::regclass);


--
-- Name: licencias id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.licencias ALTER COLUMN id SET DEFAULT nextval('public.licencias_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: tecnologias id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.tecnologias ALTER COLUMN id SET DEFAULT nextval('public.tecnologias_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: proyectos id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id SET DEFAULT nextval('public.proyectos_id_seq'::regclass);


--
-- Name: integraciones id; Type: DEFAULT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.integraciones ALTER COLUMN id SET DEFAULT nextval('public.integraciones_id_seq'::regclass);


--
-- Data for Name: backend_details; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.backend_details (id, proyecto_id, lenguaje_principal_bckend, version_utilizada, lenguaje_secundario, framework_bckend, otras_librerias) FROM stdin;
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.clientes (id, proyecto_id, cliente, mail_cliente, cel_cliente, observacion_general, nombre_publico, nombre_interno, tipo, fecha_inicio_desarrollo, estado, dependencia_uso, uso_interno_ministerio, uso_interno_equipo_desarrollo) FROM stdin;
\.


--
-- Data for Name: frontend_details; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.frontend_details (id, proyecto_id, lenguaje_principal_frontend, framework_frontend, otras_librerias_requeridas, herramientas_desarrollo, ide_compiladores, version_ide_comp, modo_licenciamiento) FROM stdin;
\.


--
-- Data for Name: infraestructura; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.infraestructura (id, proyecto_id, arq_hardware, hosting_en_data_center, virtualizado, ubicacion_servidor, servidor_web, nombre_comercial_srv, version_srv, hosting_srv, virtualizado_srv, ubicacion_srv, escalado_srv, entorno_cliente_so_soportadas, navegadores_versiones, req_instalar_paq_adicionales, paquetes_adicionales_necesarios, modelo_seguridad, posee_entorno_test, test_automatico, ubicacion_doc_deploy) FROM stdin;
\.


--
-- Data for Name: licencias; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.licencias (id, proyecto_id, herramientas_desarrollo, ide_compiladores, version_ide_comp, modo_licenciamiento_ide, base_datos_nombre_comercial, version_bd, modo_licencia_bd, tipo_licencia_bd, herramienta_desarrollo_bd, tamano_actual, tamano_max_permitido, servidor_que_aloja, mantenimiento, backup_periodico, depuracion_automatica, responsable_mantenimiento, contiene_store_procedure, servidor_ejecucion_so, version_so) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.staff (id, nombre_completo, contrato, rol, nombres, apellidos, activo, comentario, modalidad, experiencia, origen, email, skills, desempeno_ley_dto, hhee, ur, coordinacion, presencialidad, cumpleanos, edad) FROM stdin;
\.


--
-- Data for Name: staff_proyectos; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.staff_proyectos (staff_id, proyecto_id) FROM stdin;
\.


--
-- Data for Name: tecnologias; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.tecnologias (id, proyecto_id, lenguaje_desarrollo, base_datos, control_versiones, tamano_bd, alojamiento_infra, label, mantenimiento_soporte, status_pmo, status_salud, changelog, ano_inicio_sistema, usuarios_internos, usuarios_externos) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.usuarios (id, nombre, email, password_hash) FROM stdin;
\.


--
-- Data for Name: integraciones; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.integraciones (id, nombre) FROM stdin;
\.


--
-- Data for Name: proyecto_integraciones; Type: TABLE DATA; Schema: public; Owner: dcolom
--

COPY public.proyecto_integraciones (proyecto_id, integracion_id) FROM stdin;
\.


--
-- Name: backend_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.backend_details_id_seq', 1, false);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.clientes_id_seq', 1, false);


--
-- Name: frontend_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.frontend_details_id_seq', 1, false);


--
-- Name: infraestructura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.infraestructura_id_seq', 1, false);


--
-- Name: licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.licencias_id_seq', 1, false);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.staff_id_seq', 1, false);


--
-- Name: tecnologias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.tecnologias_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- Name: integraciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dcolom
--

SELECT pg_catalog.setval('public.integraciones_id_seq', 1, false);


--
-- Name: backend_details backend_details_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.backend_details
    ADD CONSTRAINT backend_details_pkey PRIMARY KEY (id);


--
-- Name: backend_details backend_details_proyecto_id_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.backend_details
    ADD CONSTRAINT backend_details_proyecto_id_key UNIQUE (proyecto_id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_proyecto_id_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_proyecto_id_key UNIQUE (proyecto_id);


--
-- Name: frontend_details frontend_details_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.frontend_details
    ADD CONSTRAINT frontend_details_pkey PRIMARY KEY (id);


--
-- Name: frontend_details frontend_details_proyecto_id_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.frontend_details
    ADD CONSTRAINT frontend_details_proyecto_id_key UNIQUE (proyecto_id);


--
-- Name: infraestructura infraestructura_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.infraestructura
    ADD CONSTRAINT infraestructura_pkey PRIMARY KEY (id);


--
-- Name: infraestructura infraestructura_proyecto_id_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.infraestructura
    ADD CONSTRAINT infraestructura_proyecto_id_key UNIQUE (proyecto_id);


--
-- Name: licencias licencias_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT licencias_pkey PRIMARY KEY (id);


--
-- Name: licencias licencias_proyecto_id_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT licencias_proyecto_id_key UNIQUE (proyecto_id);


--
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_proyectos staff_proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.staff_proyectos
    ADD CONSTRAINT staff_proyectos_pkey PRIMARY KEY (staff_id, proyecto_id);


--
-- Name: tecnologias tecnologias_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.tecnologias
    ADD CONSTRAINT tecnologias_pkey PRIMARY KEY (id);


--
-- Name: tecnologias tecnologias_proyecto_id_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.tecnologias
    ADD CONSTRAINT tecnologias_proyecto_id_key UNIQUE (proyecto_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- Name: integraciones integraciones_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.integraciones
    ADD CONSTRAINT integraciones_pkey PRIMARY KEY (id);


--
-- Name: proyecto_integraciones proyecto_integraciones_pkey; Type: CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.proyecto_integraciones
    ADD CONSTRAINT proyecto_integraciones_pkey PRIMARY KEY (proyecto_id, integracion_id);


--
-- Name: backend_details backend_details_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.backend_details
    ADD CONSTRAINT backend_details_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: clientes clientes_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: frontend_details frontend_details_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.frontend_details
    ADD CONSTRAINT frontend_details_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: infraestructura infraestructura_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.infraestructura
    ADD CONSTRAINT infraestructura_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: licencias licencias_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT licencias_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: staff_proyectos staff_proyectos_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.staff_proyectos
    ADD CONSTRAINT staff_proyectos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: staff_proyectos staff_proyectos_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.staff_proyectos
    ADD CONSTRAINT staff_proyectos_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: tecnologias tecnologias_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.tecnologias
    ADD CONSTRAINT tecnologias_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: proyecto_integraciones proyecto_integraciones_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.proyecto_integraciones
    ADD CONSTRAINT proyecto_integraciones_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: proyecto_integraciones proyecto_integraciones_integracion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dcolom
--

ALTER TABLE ONLY public.proyecto_integraciones
    ADD CONSTRAINT proyecto_integraciones_integracion_id_fkey FOREIGN KEY (integracion_id) REFERENCES public.integraciones(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2XU2OFf7QEte0IlsscySYQIE1FghlvLc4jwhHWXI9uQ3uoYlEvHxKeQduFwqbOS
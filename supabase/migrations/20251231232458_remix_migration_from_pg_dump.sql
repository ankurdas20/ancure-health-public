CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: cycle_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.cycle_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    age integer NOT NULL,
    cycle_length integer NOT NULL,
    last_period_date date NOT NULL,
    period_duration integer NOT NULL,
    is_regular boolean DEFAULT true NOT NULL,
    symptoms text[] DEFAULT '{}'::text[],
    stress_level text,
    activity_level text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    goal text DEFAULT 'track_period'::text,
    CONSTRAINT cycle_data_activity_level_check CHECK ((activity_level = ANY (ARRAY['low'::text, 'moderate'::text, 'high'::text]))),
    CONSTRAINT cycle_data_stress_level_check CHECK ((stress_level = ANY (ARRAY['low'::text, 'moderate'::text, 'high'::text])))
);


--
-- Name: period_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.period_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date,
    predicted_start_date date,
    cycle_length integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: symptom_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    log_date date NOT NULL,
    symptoms text[] DEFAULT '{}'::text[] NOT NULL,
    mood text,
    energy_level text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cycle_data cycle_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.cycle_data DROP CONSTRAINT IF EXISTS cycle_data_pkey;
ALTER TABLE ONLY public.cycle_data
    ADD CONSTRAINT cycle_data_pkey PRIMARY KEY (id);


--
-- Name: cycle_data cycle_data_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.cycle_data DROP CONSTRAINT IF EXISTS cycle_data_user_id_key;
ALTER TABLE ONLY public.cycle_data
    ADD CONSTRAINT cycle_data_user_id_key UNIQUE (user_id);


--
-- Name: period_logs period_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.period_logs DROP CONSTRAINT IF EXISTS period_logs_pkey;
ALTER TABLE ONLY public.period_logs
    ADD CONSTRAINT period_logs_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: symptom_logs symptom_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_pkey;
ALTER TABLE ONLY public.symptom_logs
    ADD CONSTRAINT symptom_logs_pkey PRIMARY KEY (id);


--
-- Name: symptom_logs symptom_logs_user_id_log_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_user_id_log_date_key;
ALTER TABLE ONLY public.symptom_logs
    ADD CONSTRAINT symptom_logs_user_id_log_date_key UNIQUE (user_id, log_date);


--
-- Name: cycle_data update_cycle_data_updated_at; Type: TRIGGER; Schema: public; Owner: -
--
DROP TRIGGER IF EXISTS update_cycle_data_updated_at ON public.cycle_data;
CREATE TRIGGER update_cycle_data_updated_at BEFORE UPDATE ON public.cycle_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: period_logs update_period_logs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--
DROP TRIGGER IF EXISTS update_period_logs_updated_at ON public.period_logs;
CREATE TRIGGER update_period_logs_updated_at BEFORE UPDATE ON public.period_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: symptom_logs update_symptom_logs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--
DROP TRIGGER IF EXISTS update_symptom_logs_updated_at ON public.symptom_logs;
CREATE TRIGGER update_symptom_logs_updated_at BEFORE UPDATE ON public.symptom_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cycle_data cycle_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.cycle_data DROP CONSTRAINT IF EXISTS cycle_data_user_id_fkey;
ALTER TABLE ONLY public.cycle_data
    ADD CONSTRAINT cycle_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: cycle_data Users can delete their own cycle data; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can delete their own cycle data" ON public.cycle_data;
CREATE POLICY "Users can delete their own cycle data" ON public.cycle_data FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: period_logs Users can delete their own period logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can delete their own period logs" ON public.period_logs;
CREATE POLICY "Users can delete their own period logs" ON public.period_logs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: symptom_logs Users can delete their own symptom logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can delete their own symptom logs" ON public.symptom_logs;
CREATE POLICY "Users can delete their own symptom logs" ON public.symptom_logs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: cycle_data Users can insert their own cycle data; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can insert their own cycle data" ON public.cycle_data;
CREATE POLICY "Users can insert their own cycle data" ON public.cycle_data FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: period_logs Users can insert their own period logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can insert their own period logs" ON public.period_logs;
CREATE POLICY "Users can insert their own period logs" ON public.period_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: symptom_logs Users can insert their own symptom logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can insert their own symptom logs" ON public.symptom_logs;
CREATE POLICY "Users can insert their own symptom logs" ON public.symptom_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: cycle_data Users can update their own cycle data; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can update their own cycle data" ON public.cycle_data;
CREATE POLICY "Users can update their own cycle data" ON public.cycle_data FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: period_logs Users can update their own period logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can update their own period logs" ON public.period_logs;
CREATE POLICY "Users can update their own period logs" ON public.period_logs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: symptom_logs Users can update their own symptom logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can update their own symptom logs" ON public.symptom_logs;
CREATE POLICY "Users can update their own symptom logs" ON public.symptom_logs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: cycle_data Users can view their own cycle data; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can view their own cycle data" ON public.cycle_data;
CREATE POLICY "Users can view their own cycle data" ON public.cycle_data FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: period_logs Users can view their own period logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can view their own period logs" ON public.period_logs;
CREATE POLICY "Users can view their own period logs" ON public.period_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: symptom_logs Users can view their own symptom logs; Type: POLICY; Schema: public; Owner: -
--
DROP POLICY IF EXISTS "Users can view their own symptom logs" ON public.symptom_logs;
CREATE POLICY "Users can view their own symptom logs" ON public.symptom_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: cycle_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cycle_data ENABLE ROW LEVEL SECURITY;

--
-- Name: period_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: symptom_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;
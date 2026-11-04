
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name) values (new.id, coalesce(new.raw_user_meta_data->>'first_name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Contacts (prospects, clients, partenaires)
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  kind text not null default 'prospect',
  name text not null,
  phone text, email text, notes text,
  stage text not null default 'Premier contact',
  decision text,
  goals text, products text,
  order_date date, cure_days int default 30,
  rgpd_consent boolean not null default false,
  rank text default 'Affilié(e) – en démarrage',
  rank_goal text,
  road_to_gold jsonb not null default '[]'::jsonb,
  weekly_review jsonb not null default '{}'::jsonb,
  scan_pdf_path text,
  next_followup date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.contacts to authenticated;
grant all on public.contacts to service_role;
alter table public.contacts enable row level security;
create policy "own contacts" on public.contacts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.daily_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  day date not null default current_date,
  label text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.daily_actions to authenticated;
grant all on public.daily_actions to service_role;
alter table public.daily_actions enable row level security;
create policy "own actions" on public.daily_actions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  content text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notes to authenticated;
grant all on public.notes to service_role;
alter table public.notes enable row level security;
create policy "own notes" on public.notes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  label text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.todos to authenticated;
grant all on public.todos to service_role;
alter table public.todos enable row level security;
create policy "own todos" on public.todos for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  month text not null,
  label text not null,
  planned int not null default 0,
  done int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.monthly_goals to authenticated;
grant all on public.monthly_goals to service_role;
alter table public.monthly_goals enable row level security;
create policy "own goals" on public.monthly_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.training_progress (
  user_id uuid not null default auth.uid(),
  step_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, step_key)
);
grant select, insert, delete on public.training_progress to authenticated;
grant all on public.training_progress to service_role;
alter table public.training_progress enable row level security;
create policy "own progress" on public.training_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Agenda : user_id null = événement d'équipe (admin)
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  title text not null,
  kind text not null default 'RDV',
  starts_at timestamptz not null,
  link text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "read events" on public.events for select to authenticated using (user_id is null or user_id = auth.uid());
create policy "write own events" on public.events for all to authenticated
  using (user_id = auth.uid() or (user_id is null and public.has_role(auth.uid(),'admin')))
  with check (user_id = auth.uid() or (user_id is null and public.has_role(auth.uid(),'admin')));

-- Contenu commun
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  range text not null,
  color text not null default '#2f7d4f',
  image_url text,
  tagline text,
  benefits text,
  ingredients text,
  usage text,
  videos text[] not null default '{}',
  public_price numeric not null default 0,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "read products" on public.products for select to authenticated using (true);
create policy "admin products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Prospection',
  content text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.scripts to authenticated;
grant all on public.scripts to service_role;
alter table public.scripts enable row level security;
create policy "read scripts" on public.scripts for select to authenticated using (true);
create policy "admin scripts" on public.scripts for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'presentation',
  title text not null,
  url text not null,
  description text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.resources to authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
create policy "read resources" on public.resources for select to authenticated using (true);
create policy "admin resources" on public.resources for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Données d'exemple
insert into public.products (name, range, color, tagline, benefits, ingredients, usage, public_price, sort) values
('V-Organex','Désintoxication','#3f7d3a','Détox douce de l''organisme','Soutient l''élimination naturelle\nFavorise le confort digestif\nAide à retrouver de la légèreté','Extraits de plantes, chlorophylle, fibres végétales','1 sachet par jour dans un grand verre d''eau, de préférence le matin.',59,1),
('V-Daily','Nourrir','#e0a526','Vos nutriments essentiels au quotidien','Apport complet en vitamines et minéraux\nSoutient l''énergie et la vitalité\nContribue au bon fonctionnement du système immunitaire','Vitamines A, C, D, E, B, minéraux, extraits de fruits','1 dose par jour pendant le repas.',49,2),
('Nourish+','Nourrir','#c2523c','Nutrition cellulaire avancée','Nourrit les cellules en profondeur\nSoutient la récupération\nFavorise le bien-être général','Superaliments, acides aminés, antioxydants','1 portion par jour, à mélanger avec de l''eau ou un smoothie.',69,3);

insert into public.scripts (title, category, content) values
('Premier message','Prospection','Bonjour [prénom] ! J''espère que tu vas bien. Je pense à toi car je découvre des solutions bien-être naturelles qui me font beaucoup de bien. Est-ce que tu serais curieux(se) d''en savoir un peu plus ?'),
('Proposer un scan','Prospection','Je propose en ce moment un scan bien-être gratuit (facial ou quantique) qui donne un aperçu de ton équilibre. Ça te dirait d''essayer cette semaine ?'),
('Relance fin de cure','Clients','Coucou [prénom] ! Ta cure arrive bientôt à sa fin. Comment te sens-tu ? Veux-tu qu''on fasse le point ensemble pour la suite ?');

insert into public.events (user_id, title, kind, starts_at, link) values
(null,'Zoom d''équipe hebdomadaire','Zoom', (date_trunc('week', now()) + interval '9 days 19 hours'), null);

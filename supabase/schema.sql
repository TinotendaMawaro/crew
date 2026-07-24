-- =====================================================================
-- HIM Media Crew Portal - Supabase schema
-- Run in the Supabase SQL editor (or via: supabase db push).
-- =====================================================================

create table if not exists public.crew_registrations (
    id uuid primary key default gen_random_uuid(),
    serving_no text not null,
    fullname text not null,
    phone text not null,
    history text not null,
    area text not null,
    section text not null,
    gadget text not null,
    serial text not null,
    transport text not null check (transport in ('need', 'provide')),
    has_regalia boolean not null default false,
    regalia_size text not null default 'N/A',
    payment_ref text not null default 'N/A',
    status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Declined')),
    registration_date date not null default current_date,
    created_at timestamptz not null default now()
);

-- Allow the anon/public role (used by the browser key) to read + write.
-- NOTE: tighten these policies (e.g. require auth) before production.
alter table public.crew_registrations enable row level security;

drop policy if exists "crew_read" on public.crew_registrations;
create policy "crew_read" on public.crew_registrations
    for select using (true);

drop policy if exists "crew_insert" on public.crew_registrations;
create policy "crew_insert" on public.crew_registrations
    for insert with check (true);

drop policy if exists "crew_update" on public.crew_registrations;
create policy "crew_update" on public.crew_registrations
    for update using (true);

drop policy if exists "crew_delete" on public.crew_registrations;
create policy "crew_delete" on public.crew_registrations
    for delete using (true);

-- Optional: seed the four original demo records (safe to re-run).
insert into public.crew_registrations
    (serving_no, fullname, phone, history, area, section, gadget, serial,
     transport, has_regalia, regalia_size, payment_ref, status, registration_date)
values
    ('HIM-CTF26-0012', 'Tapiwa Charles', '+263 774 129 048', 'veteran',
     'Visual Production', 'Main Camera Operator', 'Sony FX6 Camera', 'S/N 903-82711-X',
     'need', true, 'N/A', 'N/A', 'Approved', '2026-06-12'),
    ('HIM-CTF26-0045', 'Grace Chipo', '+263 783 948 201', '1-year',
     'Social Media & PR', 'Content Creator / Copywriter', 'iPhone 15 Pro Max', 'S/N 772-IPHONE15',
     'provide', false, 'M', 'MP2607.0911.K89', 'Approved', '2026-07-02'),
    ('HIM-CTF26-0089', 'Munashe Robin', '+263 719 827 334', '2-3-years',
     'Audio Engineering', 'FOH Audio Engineer', 'Behringer Wing Console', 'S/N BE-920-X1',
     'provide', true, 'N/A', 'N/A', 'Pending', '2026-07-06'),
    ('HIM-CTF26-0104', 'Tafadzwa Mawaro', '+263 773 892 019', 'first-time',
     'Lighting & Stage FX', 'Rigging Technician', 'Chauvet DMX Controller', 'S/N CH-4421-92',
     'need', false, 'XL', 'MP2607.1234.H01', 'Pending', '2026-07-07')
on conflict do nothing;

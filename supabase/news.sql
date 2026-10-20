-- Pinned announcements for the home page and news list.
-- 1. Class on Supabase
-- 2. Semester Kickoff
-- These two stay at the top even when newer items are added.

create table if not exists public.news (
  id text primary key,
  date date not null default current_date,
  url text not null default '',
  image text not null default '',
  sort_order integer not null default 10,
  status text not null default 'published'
    check (status in ('published', 'draft')),
  title_zh text not null default '',
  title_en text not null default '',
  content_zh text not null default '',
  content_en text not null default '',
  created_at timestamptz not null default now()
);

alter table public.news enable row level security;

drop policy if exists news_select on public.news;
drop policy if exists news_write on public.news;
create policy news_select on public.news
  for select to anon, authenticated using (true);
create policy news_write on public.news
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;

insert into public.news
  (id, date, url, image, sort_order, status, title_zh, title_en, content_zh, content_en)
values
  (
    'class-supabase',
    '2026-10-20',
    '',
    '',
    1,
    'published',
    'Supabase 課程',
    'Class on Supabase',
    '本週課程聚焦 Supabase：資料表、身分驗證，以及如何把後台公告與師資同步到雲端。請先完成註冊與信箱驗證。',
    'This class focuses on Supabase: tables, authentication, and syncing back-office announcements and faculty to the cloud. Please register and verify your email first.'
  ),
  (
    'semester-kickoff',
    '2026-10-16',
    '',
    '',
    2,
    'published',
    '學期開學',
    'Semester Kickoff',
    '歡迎回到 imMBA 新學期。請留意加退選時程、課程公告與學程活動，開學週如有問題請洽辦公室。',
    'Welcome back to the new imMBA term. Please note add/drop dates, course notices, and programme events. Contact the office in week one if you need help.'
  )
on conflict (id) do update
set
  date = excluded.date,
  sort_order = excluded.sort_order,
  status = excluded.status,
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  content_zh = excluded.content_zh,
  content_en = excluded.content_en;

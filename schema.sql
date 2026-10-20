-- schema.sql
-- Step 4: Build the Faculty Table
-- Copied from the official imMBA faculty page:
-- https://www.management.fju.edu.tw/subweb/immba/teacher.php
--
-- Field            | Purpose
-- -----------------+------------------------
-- id               | Unique faculty ID
-- name             | Faculty name
-- title            | Academic title
-- education        | Education
-- research_fields  | Research interests
-- email            | Contact email
-- phone            | Phone
-- website          | Personal website
-- image_url        | Faculty photo
-- category         | Full-time / Adjunct
-- sort_order       | Display order
--
-- Data is arranged in two columns/sections: Full-time and Adjunct.

create table if not exists public.faculty (
  id text primary key,                          -- Unique faculty ID
  name text not null default '',                -- Faculty name
  title text not null default '',               -- Academic title
  education text not null default '',           -- Education
  research_fields text not null default '',     -- Research interests
  email text not null default '',               -- Contact email
  phone text not null default '',               -- Phone
  website text not null default '',             -- Personal website
  image_url text not null default '',           -- Faculty photo
  category text not null default 'Full-time'    -- Full-time / Adjunct
    check (category in ('Full-time', 'Adjunct')),
  sort_order integer not null default 1         -- Display order
);

create index if not exists faculty_sort_order_idx on public.faculty (sort_order, name);
create index if not exists faculty_category_idx on public.faculty (category, sort_order);

alter table public.faculty enable row level security;

drop policy if exists faculty_select on public.faculty;
drop policy if exists faculty_write on public.faculty;
create policy faculty_select on public.faculty
  for select to anon, authenticated using (true);
create policy faculty_write on public.faculty
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

grant select on public.faculty to anon, authenticated;
grant insert, update, delete on public.faculty to authenticated;


-- Section 1: Full-time faculty
insert into public.faculty
  (id, name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values
(
  'f-082435',
  '杜逸寧 / Yi-Ning Tu',
  '副教授兼國際經營管理碩士(imMBA)主任 / Associate Professor, Chair of imMBA',
  '政治大學資訊管理學博士 / Ph.D. in Information Management, National Chengchi University',
  '資料探勘、文字探勘、人工智慧、機器學習、資訊檢索 / Data mining, text mining, artificial intelligence, machine learning, information retrieval',
  '082435@mail.fju.edu.tw',
  '#3988, LM208-2',
  'https://sites.google.com/view/yiningtu',
  'assets/images/faculty/menu01753938439.jpg',
  'Full-time',
  1
),

(
  'f-036665',
  '李天行 / Michael T. S. Lee',
  '講座教授 (前國際與資源發展副校長) / Chair Professor (former Vice President for International and Resource Development)',
  '美國奧斯汀德州大學作業研究與工業工程博士 / Ph.D. in Operations Research and Industrial Engineering, University of Texas at Austin',
  '顧客關係管理、人工智慧、應用統計、作業研究 / Customer relationship management, artificial intelligence, applied statistics, operations research',
  '036665@mail.fju.edu.tw',
  '#2905, SL228',
  '',
  'assets/images/faculty/menu01596098393.jpg',
  'Full-time',
  2
),

(
  'f-065999',
  '林耀南 / Yaonan Lin',
  '教授(前國際教育長) / Professor (former Dean of International Education)',
  '美國舊金山金門大學企業管理博士 / Ph.D. in Business Administration, Golden Gate University, San Francisco',
  '消費者心理學、產品與行銷創新、創造力、人力資源管理 / Consumer psychology, product and marketing innovation, creativity, human resource management',
  '065999@mail.fju.edu.tw',
  '#2735, SL260',
  '',
  'assets/images/faculty/menu01603245456.jpg',
  'Full-time',
  3
),

(
  'f-155456',
  '許育銘 / Yu-Ming Hsu',
  '副教授兼科技管理碩士學程主任 / Associate Professor, Director of the M.S. Program in Technology Management',
  '台灣大學國際企業研究所博士 / Ph.D. in International Business, National Taiwan University',
  '行銷管理、數位行銷、資訊科技行銷、社群商務、國際企業管理 / Marketing management, digital marketing, IT marketing, social commerce, international business',
  '155456@mail.fju.edu.tw',
  '#3977, SL225',
  '',
  'assets/images/faculty/menu01662622350.jpg',
  'Full-time',
  4
),

(
  'f-144629',
  '林芷安 / Chih-An Lin',
  '副教授兼學術交流中心主任 / Associate Professor, Director of the Academic Exchange Center',
  '台灣大學國際企業博士 / Ph.D. in International Business, National Taiwan University',
  '供應鏈管理、媒體傳播、整合行銷、品牌管理 / Supply chain management, media communication, integrated marketing, brand management',
  '144629@mail.fju.edu.tw',
  '#2924, SL221',
  '',
  'assets/images/faculty/menu01596096150.jpg',
  'Full-time',
  5
),

(
  'f-129741',
  '黃愷平 / Kai-Ping Huang',
  '副教授 / Associate Professor',
  '澳洲雪梨科技大學企業管理博士 / Ph.D. in Business Administration, University of Technology Sydney',
  '中小企業、創業精神、行銷管理、人力資源管理 / Small and medium-sized enterprises, entrepreneurship, marketing management, human resource management',
  '129741@mail.fju.edu.tw',
  '#2906',
  '',
  'assets/images/faculty/menu01735200452.jpg',
  'Full-time',
  6
),

(
  'f-142652',
  '曾祥景 / Hsiang-Ching Tseng',
  '副教授 / Associate Professor',
  '政治大學企業管理博士 / Ph.D. in Business Administration, National Chengchi University',
  '行銷相關領域 / Marketing',
  '142652@mail.fju.edu.tw',
  '#2737',
  '',
  'assets/images/faculty/menu01662622813.png',
  'Full-time',
  7
),

(
  'f-151308',
  '林玫君 / Mei-Chun Lin',
  '副教授 / Associate Professor',
  '成功大學工業與資訊管理博士 / Ph.D. in Industrial and Information Management, National Cheng Kung University',
  '產業分析與競爭策略、科技創新、服務行銷、供應鏈管理 / Industry analysis and competitive strategy, technological innovation, service marketing, supply chain management',
  '151308@mail.fju.edu.tw',
  '#2968, SL408',
  '',
  'assets/images/faculty/menu01612145438.jpg',
  'Full-time',
  8
),

(
  'f-151667',
  '鄭淑玲 / Shu-Ling Cheng',
  '副教授 / Associate Professor',
  '成功大學企業管理系博士 / Ph.D. in Business Administration, National Cheng Kung University',
  '行銷研究、資料分析、國際金融 / Marketing research, data analysis, international finance',
  '151667@mail.fju.edu.tw',
  '#2725, SL211',
  '',
  'assets/images/faculty/menu01646101394.jpg',
  'Full-time',
  9
),

(
  'f-128144',
  '胡碧嬋 / Pi-Chan Hu',
  '副教授(前學術交流中心主任) / Associate Professor (former Director of the Academic Exchange Center)',
  '政治大學應用英語語言學博士 / Ph.D. in Applied English Linguistics, National Chengchi University',
  '國際商務談判、法律語言學、財經法律翻譯、法律口筆譯、醫療口筆譯、一般口筆譯 / International business negotiation, legal linguistics, financial and legal translation, legal interpreting, medical interpreting, general interpreting',
  '128144@mail.fju.edu.tw',
  '#2145',
  '',
  'assets/images/faculty/menu01603259236.jpg',
  'Full-time',
  10
),

(
  'f-156503',
  '林淑雯 / Shu-wen Lin',
  '助理教授 / Assistant Professor',
  '英國杜倫大學教育博士 / Ed.D., School of Education, Durham University, UK',
  '通識及專業英文、世界性英語 / English for general and specific purposes, Global Englishes',
  '156503@mail.fju.edu.tw',
  '#3362, SF829',
  '',
  'assets/images/faculty/menu01706580642.png',
  'Full-time',
  11
),

(
  'f-051266',
  '江翠玲 / Tsui-Lin Chiang',
  '助理教授 / Assistant Professor',
  '輔仁大學商學研究所博士 / Ph.D. in Business, Fu Jen Catholic University',
  '經濟學、財務管理與公司治理、投資學與財務個案分析、國際財務管理、金融市場、信用風險管理 / Economics, financial management and corporate governance, investment and financial case analysis, international financial management, financial markets, credit risk management',
  '051266@mail.fju.edu.tw',
  '#3998, SL424',
  '',
  'assets/images/faculty/menu01646198858.jpg',
  'Full-time',
  12
),

(
  'f-145785',
  '顏孟賢 / Meng-Hsien Yen',
  '助理教授 / Assistant Professor',
  '政治大學企業管理學系博士 / Ph.D. in Business Administration, National Chengchi University',
  '一般管理、策略管理、國際企業 / General management, strategic management, international business',
  '145785@mail.fju.edu.tw',
  '#2648',
  '',
  'assets/images/faculty/menu01633500689.jpg',
  'Full-time',
  13
),

(
  'f-144779',
  '徐皓馨 / Hao-Hsin Hsu',
  '助理教授 / Assistant Professor',
  '交通大學管理科學系博士 / Ph.D. in Management Science, National Chiao Tung University',
  '組織行為、職場健康心理學、人力資源管理、效率及生產力分析領域 / Organizational behavior, workplace health psychology, human resource management, efficiency and productivity analysis',
  '144779@mail.fju.edu.tw',
  '#2771',
  '',
  'assets/images/faculty/menu01652159617.png',
  'Full-time',
  14
),

(
  'f-152400',
  '黃凱斌 / Kai-Pin Huang',
  '助理教授 / Assistant Professor',
  '交通大學工業工程與管理學系博士 / Ph.D. in Industrial Engineering and Management, National Chiao Tung University',
  '統計推論與實務應用、品質工程及可靠度分析、資料探勘及機器學習、人工智慧於再生能源管理之應用、實驗室品質管理 / Statistical inference, quality engineering and reliability, data mining and machine learning, AI for renewable energy management, laboratory quality management',
  '152400@mail.fju.edu.tw',
  '#6265',
  '',
  'assets/images/faculty/menu01700462662.jpg',
  'Full-time',
  15
),

(
  'f-158325',
  '黃慶偉 / Ching-Wei Huang',
  '助理教授 / Assistant Professor',
  '中正大學財務金融博士 / Ph.D. in Finance, National Chung Cheng University',
  '投資學、行為財務學、環境財經、綠色金融、氣候金融、永續金融 / Investment, behavioral finance, environmental finance, green finance, climate finance, sustainable finance',
  '158325@mail.fju.edu.tw',
  '#2678',
  '',
  'assets/images/faculty/menu01700462894.png',
  'Full-time',
  16
),

(
  'f-167167',
  '王滄賢 / Tsang-Hsien Wang',
  '助理教授 / Assistant Professor',
  '臺灣科技大學管理研究所博士 / Ph.D. in Management, National Taiwan University of Science and Technology',
  '消費者行為、行銷管理、創新與產品管理、國際企業管理、品牌管理 / Consumer behavior, marketing management, innovation and product management, international business, brand management',
  '167167@mail.fju.edu.tw',
  '#3931',
  '',
  'assets/images/faculty/menu01788763762.png',
  'Full-time',
  17
),

(
  'f-167208',
  '林佳樺 / Chia-Hua Lin',
  '助理教授 / Assistant Professor',
  '中正大學心理學系博士 / Ph.D. in Psychology, National Chung Cheng University',
  '組織行為、工商心理學 / Organizational behavior, industrial and organizational psychology',
  '167208@mail.fju.edu.tw',
  '#2966',
  '',
  'assets/images/faculty/menu01788763995.jpg',
  'Full-time',
  18
)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  education = excluded.education,
  research_fields = excluded.research_fields,
  email = excluded.email,
  phone = excluded.phone,
  website = excluded.website,
  image_url = excluded.image_url,
  category = excluded.category,
  sort_order = excluded.sort_order;

-- Section 2: Adjunct faculty
insert into public.faculty
  (id, name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values

(
  'f-wanghm-tw',
  '王慧美 / Hui-Mei Wang',
  '兼任副教授 (前國際經營管理碩士(imMBA)主任) / Part-time Associate Professor (former Chair of imMBA)',
  '台灣大學國際企業博士 / Ph.D. in International Business, National Taiwan University',
  '國際企業、國際行銷 / International business, international marketing',
  'wanghm.tw@gmail.com',
  '',
  '',
  'assets/images/faculty/menu01596097609.jpg',
  'Adjunct',
  19
)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  education = excluded.education,
  research_fields = excluded.research_fields,
  email = excluded.email,
  phone = excluded.phone,
  website = excluded.website,
  image_url = excluded.image_url,
  category = excluded.category,
  sort_order = excluded.sort_order;

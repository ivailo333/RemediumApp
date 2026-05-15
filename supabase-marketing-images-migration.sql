alter table marketing_activities
add column if not exists image_urls jsonb not null default '[]'::jsonb;

update marketing_activities
set image_urls = jsonb_build_array(image_url)
where image_url is not null
  and image_url <> ''
  and image_urls = '[]'::jsonb;

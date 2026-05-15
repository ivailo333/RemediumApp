alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table marketing_activities enable row level security;

drop policy if exists "allow anon read products" on products;
drop policy if exists "allow anon write products" on products;
drop policy if exists "allow anon read orders" on orders;
drop policy if exists "allow anon write orders" on orders;
drop policy if exists "allow anon read order items" on order_items;
drop policy if exists "allow anon write order items" on order_items;
drop policy if exists "allow anon read marketing" on marketing_activities;
drop policy if exists "allow anon write marketing" on marketing_activities;

create policy "allow anon read products"
on products for select
to anon
using (true);

create policy "allow anon write products"
on products for all
to anon
using (true)
with check (true);

create policy "allow anon read orders"
on orders for select
to anon
using (true);

create policy "allow anon write orders"
on orders for all
to anon
using (true)
with check (true);

create policy "allow anon read order items"
on order_items for select
to anon
using (true);

create policy "allow anon write order items"
on order_items for all
to anon
using (true)
with check (true);

create policy "allow anon read marketing"
on marketing_activities for select
to anon
using (true);

create policy "allow anon write marketing"
on marketing_activities for all
to anon
using (true)
with check (true);

drop policy if exists "allow anon upload marketing images" on storage.objects;
drop policy if exists "allow anon update marketing images" on storage.objects;
drop policy if exists "allow anon read marketing images" on storage.objects;

create policy "allow anon upload marketing images"
on storage.objects for insert
to anon
with check (bucket_id = 'marketing-images');

create policy "allow anon update marketing images"
on storage.objects for update
to anon
using (bucket_id = 'marketing-images')
with check (bucket_id = 'marketing-images');

create policy "allow anon read marketing images"
on storage.objects for select
to anon
using (bucket_id = 'marketing-images');

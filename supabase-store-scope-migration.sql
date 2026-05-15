alter table products
add column if not exists store_id text not null default '1';

alter table orders
add column if not exists store_id text not null default '1';

alter table marketing_activities
add column if not exists store_id text not null default '1';

create index if not exists products_store_id_idx
on products (store_id);

create index if not exists orders_store_id_idx
on orders (store_id);

create index if not exists marketing_activities_store_id_idx
on marketing_activities (store_id);

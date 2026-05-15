alter table products
add column if not exists stock_date date;

create index if not exists products_stock_date_idx
on products (stock_date);

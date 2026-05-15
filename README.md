# Remedium App

Expo / React Native приложение за проследяване на наличности, поръчки и маркетингови активности по обекти „Ремедиум“.

## Основна функционалност

- Начален екран с 15 обекта: „Ремедиум 1“ до „Ремедиум 15“.
- Вход в системата с два типа потребители:
  - администратор: `admin` / `nimda`
  - обикновен потребител: `user` / `user123`
- Обикновеният потребител избира обект и вижда:
  - „Наличности“
  - „Поръчки“
  - „Маркетингови активности“
- Администраторът избира обект и управлява данните само за избрания обект:
  - добавяне, редактиране и изтриване на наличности
  - създаване на поръчки с дата и няколко продукта
  - добавяне, редактиране, изтриване и подмяна на снимки към маркетингови активности
- Данните се зареждат и записват в Supabase/PostgreSQL.

Страницата „Срочни продукти“ е премахната по текущо изискване.

## Стартиране

Инсталиране на зависимостите:

```bash
npm install
```

Стартиране на проекта:

```bash
npm run start
```

За Windows PowerShell, ако `npm` е блокиран от Execution Policy:

```bash
npm.cmd run start
```

Ако Expo CLI няма достъп до Expo API и върне `fetch failed`, стартирайте локално без мрежови проверки:

```bash
npm.cmd run start:offline
```

## Supabase

Приложението използва Supabase за:

- таблица `products` - наличности по обект
- таблица `orders` - поръчки по обект
- таблица `order_items` - продукти към всяка поръчка
- таблица `marketing_activities` - маркетингови активности по обект
- storage bucket `marketing-images` - снимки към маркетинговите активности

Необходимите SQL файлове в проекта са:

- `supabase-rls-policies.sql`
- `supabase-store-scope-migration.sql`
- `supabase-product-stock-date-migration.sql`

## Структура

- `App.js` - основна навигация, вход/изход и зареждане на данни.
- `src/lib/supabase.js` - Supabase клиент.
- `src/services/remediumData.js` - операции за четене, създаване, редакция и изтриване на данни.
- `src/screens/LoginScreen.js` - вход в системата.
- `src/screens/HomeScreen.js` - избор на обект.
- `src/screens/StoreDashboardScreen.js` - потребителски секции за избран обект.
- `src/screens/InventoryScreen.js` - наличности.
- `src/screens/OrdersScreen.js` - списък с поръчки.
- `src/screens/OrderDetailScreen.js` - детайли на поръчка.
- `src/screens/MarketingScreen.js` - маркетингови активности.
- `src/screens/AdminPanelScreen.js` - администраторски панел.

## Проверки

```bash
npm.cmd run lint
npx.cmd expo export --platform web --output-dir dist
```

След web export може да изтриете папката `dist`, ако е била създадена само за проверка.

# Деплой на GitHub Pages

## Как это работает

Один workflow `.github/workflows/deploy.yml`: при пуше в `main` (или вручную через workflow_dispatch) — установка, тесты, сборка, публикация артефакта в GitHub Pages через официальные actions (`upload-pages-artifact` → `deploy-pages`).

Base path определяется автоматически (см. `src/pwa/basePath.ts` и его тесты):

| Куда деплоите | Base | Как получается |
|---|---|---|
| Project pages: `owner.github.io/<repo>/` | `/<repo>/` | из `GITHUB_REPOSITORY` в Actions автоматически |
| User site: `owner/owner.github.io` | `/` | автоматически |
| Кастомный домен или локально | `/` | по умолчанию; можно переопределить `VITE_BASE=/путь/` |

## Пошагово (первый деплой)

1. **Создайте репозиторий на GitHub** (public — для Pages на бесплатном плане).
2. Запушьте код:
   ```bash
   git init
   git add .
   git commit -m "feat: calf triage PWA MVP"
   git branch -M main
   git remote add origin https://github.com/<owner>/<repo>.git
   git push -u origin main
   ```
3. **Включите Pages из Actions**: Settings → Pages → Source → **GitHub Actions**. (Без этого шага деплой упадет с ошибкой прав — workflow пишет в окружение `github-pages`.)
4. Дождитесь завершения workflow (вкладка Actions). Приложение будет на `https://<owner>.github.io/<repo>/`.

## Что делает сборка для Pages

- `base` подставляется во все ассеты, манифест и service worker.
- Генерируется `404.html` с redirect на корень приложения (для устаревших глубоких ссылок до активации SW).
- Service worker (`sw.js`) с precache всего приложения и `navigateFallback` на `index.html` — deep links работают офлайн.
- Манифест, иконки 192/512 + maskable, apple-touch-icon — установка как PWA.

## Обновление приложения

Пуш в `main` → workflow пересобирает и публикует. Service worker обновится автоматически (`autoUpdate`): у пользователей новая версия подхватится при следующем визите. База знаний входит в precache — клинический контент обновляется вместе с приложением.

## Локальная проверка production-сборки

```bash
npm run build
npm run preview      # http://localhost:4173/
```

Проверка с базой, как на Pages (project pages):

```bash
VITE_BASE=/calf-triage-pwa/ npm run build
npm run preview
```

## Известные ограничения GitHub Pages

- Pages статический: любые «серверные» функции невозможны (и не нужны — приложение офлайн).
- Кастомный домен настраивается в Settings → Pages + файл `CNAME` в `public/` (при необходимости).
- При переименовании репозитория меняется base — это учитывается автоматически на следующем деплое; у пользователей SW переустановится.

# Calf Triage PWA — Триаж телят КРС

Офлайн-first PWA для первичной оценки состояния теленка КРС **до 6 месяцев**: уровень срочности обращения к ветеринарному специалисту, вероятные направления (не диагноз) и структурированная сводка для ветеринара.

> **Не является диагнозом и не заменяет ветеринарную помощь.** Клиническая база знаний в бета-статусе и проходит ветеринарную валидацию — см. [docs/DISCLAIMER.md](docs/DISCLAIMER.md) и [docs/VETERINARY_REVIEW_CHECKLIST.md](docs/VETERINARY_REVIEW_CHECKLIST.md).

## Ключевые свойства

- **Детерминированный движок**: weighted rule-based экспертная система + независимый слой red-flag триажа. Никаких ML/LLM в runtime, никаких процентов — только категории правдоподобия и объяснение «за/против».
- **Офлайн целиком**: app shell + база знаний в precache service worker; установка как PWA (Android/iOS/desktop).
- **Приватность**: ноль телеметрии, ноль сетевых запросов данных; история оценок — только opt-in и только в localStorage.
- **Объяснимость**: по каждому направлению видно, какие находки поддерживают, какие против, какой информации не хватает.
- **Безопасность**: 13 red flags поднимают уровень до «экстренно» независимо от диагностических баллов; 12 severity-гейтов задают «пол» срочности; возраст вне 0–180 дней → безопасный fallback.
- **Обслуживаемость**: клинический контент — типизированные данные, редактируются без правки движка (гайд: [docs/KNOWLEDGE_BASE_GUIDE.md](docs/KNOWLEDGE_BASE_GUIDE.md)); инварианты проверяются тестами на CI.

## Стек

Vite 5 · React 18 · TypeScript (strict) · Tailwind CSS · vite-plugin-pwa (Workbox) · Vitest · GitHub Actions → GitHub Pages.

## Быстрый старт

```bash
npm ci          # установка
npm run dev     # http://localhost:5173
npm test        # 44 теста (домен + PWA-конфиг + UI smoke)
npm run build   # tsc --noEmit && vite build → dist/
npm run preview # локальный просмотр production-сборки
npm run icons   # регенерация PWA-иконок (чистый Node, без зависимостей)
```

Требования: Node ≥ 18.

## Деплой на GitHub Pages

Пуш в `main` → workflow собирает, тестирует и публикует. Перед первым деплоем включите Settings → Pages → Source → **GitHub Actions**. Base path для project pages определяется автоматически из `GITHUB_REPOSITORY`. Подробности: [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md).

## Структура

```
src/
├── domain/           # чистая доменная логика (без React/DOM)
│   ├── kb/           # БАЗА ЗНАНИЙ: симптомы, состояния, правила, триаж
│   ├── engine.ts     # триаж-движок (pure, детерминированный)
│   ├── findings.ts   # маппинг ответов → находки
│   ├── summary.ts    # шаблонная генерация сводки для ветеринара
│   └── types.ts      # типы домена
├── state/            # wizard-форма, localStorage (opt-in история)
├── ui/               # экраны и компоненты (React + Tailwind)
├── i18n/             # RU-словарь (типизированный, готов к EN)
├── pwa/              # манифест, base path (протестированы)
└── styles/           # Tailwind + print CSS
docs/                 # PRD, архитектура, дисклеймер, гайды, деплой, тесты
scripts/              # генератор иконок
.github/workflows/    # deploy.yml (GitHub Pages)
```

## Документация

| Документ | О чем |
|---|---|
| [docs/PRD.md](docs/PRD.md) | цели, non-goals, требования, safety, acceptance criteria |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | слои, конвейер движка, PWA, i18n |
| [docs/DISCLAIMER.md](docs/DISCLAIMER.md) | полный дисклеймер и ограничения |
| [docs/VETERINARY_REVIEW_CHECKLIST.md](docs/VETERINARY_REVIEW_CHECKLIST.md) | процесс валидации клинического контента |
| [docs/KNOWLEDGE_BASE_GUIDE.md](docs/KNOWLEDGE_BASE_GUIDE.md) | как редактировать базу знаний |
| [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md) | деплой, base path, обновления |
| [docs/TESTING.md](docs/TESTING.md) | слои тестов и как добавлять golden-кейсы |
| [CHANGELOG.md](CHANGELOG.md) | история версий |

## Статус и планы

**v0.1.0-beta.1** — MVP: 39 симптомов, 18 состояний, 13 red flags, RU-интерфейс.

Дальше: ветеринарная валидация контента (блокирует снятие «беты»), EN-локализация, PDF-сводка, экспорт/импорт истории, калибровка весов по LR-методу.

## Лицензия и использование

Код и клинический контент предоставляются «как есть» для образовательных и организационных целей. Решения о здоровье животных принимает ветеринарный специалист.

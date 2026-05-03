# highlightjs-1c-bsl

[🇬🇧 English version](README.md)

Постпроцессор для [highlight.js](https://highlightjs.org/), который возвращает класс `hljs-keyword` ключевым словам BSL, пропущенным официальной грамматикой `1c` — для **русской** и **английской** локализаций 1С:Предприятие.

## Проблема

Официальная грамматика `1c` для highlight.js объявляет `Функция / КонецФункции / Процедура / КонецПроцедуры` маркерами области видимости контейнера, а не ключевыми словами. Эти слова отображаются без подсветки, тогда как `Если / Тогда / Возврат` подсвечиваются штатно.

`Знач` (модификатор параметра) также отсутствует в списке ключевых слов грамматики.

**Английская локализация:** грамматика `1c` для hljs поддерживает только русский синтаксис. Английский BSL-код (`Function`, `EndFunction`, `If`, `Then` и т.д.) не получает никакой подсветки без этого патча.

## Установка

```bash
npm install highlightjs-1c-bsl
```

## Использование

Вызовите `patchAll()` сразу после `hljs.highlightAll()`:

```js
import hljs from 'highlight.js/lib/core';
import lang1c from 'highlight.js/lib/languages/1c';
import { patchAll } from 'highlightjs-1c-bsl';

hljs.registerLanguage('1c', lang1c);

document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
  patchAll();
});
```

Патч одного элемента:

```js
import { patch } from 'highlightjs-1c-bsl';

const el = document.querySelector('code.language-1c.hljs');
patch(el);
```

### Опции

```js
patchAll(document, {
  russian:         true,   // патчить русские ключевые слова (по умолчанию: true)
  english:         true,   // патчить английские ключевые слова (по умолчанию: true)
  extendedRussian: true,   // включить Экспорт/Перем/ВызватьИсключение (по умолчанию: true)
});
```

Только русский синтаксис:

```js
patchAll(document, { english: false });
```

## Что патчится

### Русский (RU) — критичные пропуски

| Ключевое слово | Причина отсутствия штатной подсветки |
|---|---|
| `Функция` | Маркер начала контейнера области видимости |
| `КонецФункции` | Маркер конца контейнера области видимости |
| `Процедура` | Маркер начала контейнера области видимости |
| `КонецПроцедуры` | Маркер конца контейнера области видимости |
| `Знач` | Модификатор параметра — отсутствует в списке ключевых слов |

### Английский (EN) — грамматика не поддерживается

Грамматика `1c` для hljs поддерживает только русский синтаксис. Без этого патча английские ключевые слова BSL не получают **никакой** подсветки.

`Function` `EndFunction` `Procedure` `EndProcedure` `Val` `Export` `Var` `Raise` — объявления и модификаторы

`If` `Then` `ElsIf` `Else` `EndIf` `While` `Do` `EndDo` `For` `Each` `In` `To` — управление потоком

`Try` `Except` `EndTry` `Break` `Continue` `Return` `Goto` `New` — управление выполнением

`True` `False` `Undefined` `Null` `And` `Or` `Not` — литералы и операторы

> **Важно:** строковые литералы, комментарии и числа в английском BSL-коде по-прежнему не будут подсвечены — грамматика hljs не разбирает английский синтаксис 1С. Этот патч добавляет только подсветку ключевых слов.

## Как это работает

Обходит текстовые узлы (text nodes) внутри элементов `<code.language-1c.hljs>` и оборачивает совпавшие ключевые слова в `<span class="hljs-keyword">`. Существующие `<span>`-элементы от hljs обходятся рекурсивно, но не заменяются — обрабатываются только голые текстовые узлы.

Вместо `\b` используются явные символьные классы для границ слов — `\b` в JavaScript работает только с ASCII и ломается на кириллице.

## Совместимость

- highlight.js ≥ 10.0.0 (проверено с 11.10.0)
- Современные браузеры (без IE)

## Ссылки

- [Live demo](https://andromanpro.github.io/highlightjs-1c-bsl/) — примеры RU + EN с патчем
- [GitHub](https://github.com/andromanpro/highlightjs-1c-bsl)
- [npm](https://www.npmjs.com/package/highlightjs-1c-bsl)
- [Live demo на androman.pro](https://androman.pro/test-1c-highlight/)

## Лицензия

MIT — [androman.pro](https://androman.pro)

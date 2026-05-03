# highlightjs-1c-bsl

[🇷🇺 Русская версия](README.ru.md)

Post-processor for [highlight.js](https://highlightjs.org/) that restores `hljs-keyword` coloring on BSL keywords the official `1c` grammar misses — for both **Russian** and **English** localizations of 1C:Enterprise.

## The problem

The official `1c` grammar for highlight.js declares `Функция / КонецФункции / Процедура / КонецПроцедуры` as scope container markers, not keywords — so these words render without any color class, while `Если / Тогда / Возврат` are highlighted correctly.

`Знач` (parameter modifier) is also absent from the keyword list.

**English localization:** the `1c` grammar is Russian-only. English BSL code (`Function`, `EndFunction`, `If`, `Then`, etc.) gets zero syntax coloring without this patch.

## Install

```bash
npm install highlightjs-1c-bsl
```

## Usage

Call `patchAll()` right after `hljs.highlightAll()`:

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

Patch a single element:

```js
import { patch } from 'highlightjs-1c-bsl';

const el = document.querySelector('code.language-1c.hljs');
patch(el);
```

### Options

```js
patchAll(document, {
  russian:         true,   // patch Russian keywords (default: true)
  english:         true,   // patch English keywords (default: true)
  extendedRussian: true,   // include Экспорт/Перем/ВызватьИсключение (default: true)
});
```

Disable English patching (Russian-only codebase):

```js
patchAll(document, { english: false });
```

## What gets patched

### Russian (RU) — critical

| Keyword | Reason not colored natively |
|---|---|
| `Функция` | Scope container begin marker |
| `КонецФункции` | Scope container end marker |
| `Процедура` | Scope container begin marker |
| `КонецПроцедуры` | Scope container end marker |
| `Знач` | Parameter modifier — absent from keyword list |

### English (EN) — grammar not supported

The `1c` grammar is Russian-only. English BSL keywords get **no coloring** without this patch. The following are patched:

`Function` `EndFunction` `Procedure` `EndProcedure` `Val` `Export` `Var` `Raise` — declarations and modifiers

`If` `Then` `ElsIf` `Else` `EndIf` `While` `Do` `EndDo` `For` `Each` `In` `To` — control flow

`Try` `Except` `EndTry` `Break` `Continue` `Return` `Goto` `New` — execution control

`True` `False` `Undefined` `Null` `And` `Or` `Not` — literals and operators

> **Note:** string literals, comments and numbers in English BSL code still won't be colored — the hljs grammar itself doesn't parse English 1C syntax. This patch adds keyword coloring only.

## How it works

Walks DOM text nodes inside `<code.language-1c.hljs>` elements and wraps matched keywords in `<span class="hljs-keyword">`. Existing hljs spans are descended but not replaced — only bare text nodes are processed.

Uses explicit character-class word boundaries instead of `\b` (which is ASCII-only in JavaScript and breaks on Cyrillic).

## Compatibility

- highlight.js ≥ 10.0.0 (tested with 11.10.0)
- Modern browsers (no IE)

## Links

- [Live demo](https://andromanpro.github.io/highlightjs-1c-bsl/) — RU + EN examples, both patched
- [GitHub](https://github.com/andromanpro/highlightjs-1c-bsl)
- [npm](https://www.npmjs.com/package/highlightjs-1c-bsl)
- [Live demo on androman.pro](https://androman.pro/test-1c-highlight/)

## License

MIT — [androman.pro](https://androman.pro)

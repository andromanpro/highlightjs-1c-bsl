# highlightjs-1c-bsl

Post-processor for [highlight.js](https://highlightjs.org/) that restores `hljs-keyword` class on BSL keywords the official 1c grammar skips.

## The problem

The official `1c` grammar for highlight.js (by Stanislav Belov, bundled in hljs v10+) declares `Функция`, `КонецФункции`, `Процедура`, `КонецПроцедуры` as scope container begin/end markers — not as keywords. This means these words render without any color class, while `Если`, `Тогда`, `Пока`, `Возврат` and other BSL keywords are highlighted correctly.

`Знач` (parameter modifier) is also absent from the keyword list.

## Install

```bash
npm install highlightjs-1c-bsl
```

Or directly from GitHub:

```bash
npm install andromanpro/highlightjs-1c-bsl
```

## Usage

Call `patchAll()` after `hljs.highlightAll()`:

```js
import hljs from 'highlight.js/lib/core';
import lang1c from 'highlight.js/lib/languages/1c';
import { patchAll } from 'highlightjs-1c-bsl';

hljs.registerLanguage('1c', lang1c);
document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
  patchAll();          // patch Функция/КонецФункции/Процедура/КонецПроцедуры/Знач
});
```

Or patch a single element:

```js
import { patch } from 'highlightjs-1c-bsl';

const el = document.querySelector('code.language-1c.hljs');
patch(el);
```

### Options

```js
patchAll(document, {
  extendedKeywords: false  // skip Экспорт/Перем/ВызватьИсключение (they're in hljs natively)
});
```

`extendedKeywords` defaults to `true`. The extended set (`Экспорт`, `Перем`, `ВызватьИсключение`) is already handled by the hljs grammar, so including them is harmless but redundant. Set to `false` for a minimal patch.

## What gets patched

| Keyword | Why patch needed |
|---|---|
| `Функция` | Scope container begin — no `hljs-keyword` class |
| `КонецФункции` | Scope container end — no `hljs-keyword` class |
| `Процедура` | Scope container begin — no `hljs-keyword` class |
| `КонецПроцедуры` | Scope container end — no `hljs-keyword` class |
| `Знач` | Parameter modifier — absent from keyword list |

## How it works

Walks DOM text nodes inside `<code.language-1c.hljs>` elements and wraps matched keywords in `<span class="hljs-keyword">`. Existing `<span>` elements from hljs are descended into but never replaced — only bare text nodes are processed, so already-highlighted tokens are not double-wrapped.

Uses explicit character-class word boundaries instead of `\b` (which doesn't work with Cyrillic in JS).

## Compatibility

- highlight.js >= 10.0.0 (tested with 11.10.0)
- Modern browsers (no IE)
- Works with self-hosted hljs files (no CDN required)

## License

MIT — [andromanpro](https://androman.pro)

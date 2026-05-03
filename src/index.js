/**
 * highlightjs-1c-bsl v1.2.0
 *
 * Post-processor for highlight.js — adds missing color classes to BSL code blocks.
 *
 * Insights from atom-language-1c-bsl (1c-syntax/atom-language-1c-bsl):
 *   - Case-insensitive matching (BSL keywords are case-insensitive: если = ЕСЛИ = Если)
 *   - Literals: Истина/True, Ложь/False, Неопределено/Undefined, Null
 *   - Annotations: &НаСервере / &AtServer etc. → hljs-meta
 *
 * Patched classes:
 *   hljs-keyword  — RU scope markers + EN full keyword set
 *   hljs-literal  — boolean/null/undefined literals (RU + EN)
 *   hljs-meta     — annotations (&НаСервере, &AtClient, etc.)
 */

'use strict';

/** Chars allowed inside a BSL identifier */
var WORD = 'a-zA-Zа-яёА-ЯЁ0-9_';

// ── Russian keywords ─────────────────────────────────────────────────────────

/** RU scope markers: NOT in hljs keyword list (used as container begin/end) */
var RU_CRITICAL = [
  'Функция', 'КонецФункции',
  'Процедура', 'КонецПроцедуры',
  'Знач',
];

/** RU in hljs keyword list already; harmless safety net for older hljs versions */
var RU_EXTENDED = [
  'Экспорт', 'Перем', 'ВызватьИсключение',
];

// ── English keywords ──────────────────────────────────────────────────────────
// hljs 1c grammar is Russian-only — English BSL gets zero coloring without this.

var EN_KEYWORDS = [
  'Function', 'EndFunction', 'Procedure', 'EndProcedure',
  'Val', 'Export', 'Var', 'Raise',
  'If', 'Then', 'ElsIf', 'Else', 'EndIf',
  'While', 'Do', 'EndDo',
  'For', 'Each', 'In', 'To',
  'Try', 'Except', 'EndTry',
  'Break', 'Continue', 'Return', 'Goto',
  'New',
  'And', 'Or', 'Not',
];

// ── Literals (hljs-literal) ───────────────────────────────────────────────────
// hljs 1c grammar does not assign hljs-literal to these.

var RU_LITERALS = ['Истина', 'Ложь', 'Неопределено'];
var EN_LITERALS = ['True', 'False', 'Undefined', 'Null'];

// ── Annotations (hljs-meta) ───────────────────────────────────────────────────
// &НаСервере, &НаКлиенте, &AtServer, &AtClient, etc.
// Matched as a unit: & + identifier. Single regex, no word list needed.

var ANNOTATION_RE = new RegExp(
  '(^|[^a-zA-Zа-яёА-ЯЁ0-9_&])(&[a-zA-Zа-яёА-ЯЁ_][a-zA-Zа-яёА-ЯЁ0-9_]*)',
  'gi'
);

// ─────────────────────────────────────────────────────────────────────────────

function buildRegex(words, caseInsensitive) {
  return new RegExp(
    '(^|[^' + WORD + '])(' + words.join('|') + ')(?![' + WORD + '])',
    caseInsensitive ? 'gi' : 'g'
  );
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
  });
}

function patchTextNodes(root, regex, cls) {
  function walk(node) {
    if (node.nodeType === 3) {
      var text = node.textContent;
      regex.lastIndex = 0;
      if (!regex.test(text)) return;
      regex.lastIndex = 0;
      var html = escapeHtml(text).replace(regex, function (_, pre, kw) {
        return pre + '<span class="' + cls + '">' + kw + '</span>';
      });
      var holder = document.createElement('span');
      holder.innerHTML = html;
      node.replaceWith.apply(node, Array.prototype.slice.call(holder.childNodes));
    } else if (node.childNodes) {
      Array.prototype.slice.call(node.childNodes).forEach(walk);
    }
  }
  walk(root);
}

/**
 * Patch a single <code> element processed by hljs.
 *
 * @param {HTMLElement} el
 * @param {Object}  [options]
 * @param {boolean} [options.russian=true]          patch Russian keywords
 * @param {boolean} [options.english=true]          patch English keywords
 * @param {boolean} [options.literals=true]         patch Истина/True/Ложь/False/Неопределено/Null
 * @param {boolean} [options.annotations=true]      patch &НаСервере / &AtServer etc.
 * @param {boolean} [options.extendedRussian=true]  include RU_EXTENDED safety set
 */
function patch(el, options) {
  var o = options || {};
  var ru   = o.russian      !== false;
  var en   = o.english      !== false;
  var lit  = o.literals     !== false;
  var ann  = o.annotations  !== false;
  var ruEx = o.extendedRussian !== false;

  // Keywords → hljs-keyword (case-insensitive per BSL spec)
  var kw = [];
  if (ru) { kw = kw.concat(RU_CRITICAL); if (ruEx) kw = kw.concat(RU_EXTENDED); }
  if (en) kw = kw.concat(EN_KEYWORDS);
  if (kw.length) patchTextNodes(el, buildRegex(kw, true), 'hljs-keyword');

  // Literals → hljs-literal (case-insensitive)
  var lits = [];
  if (lit && ru) lits = lits.concat(RU_LITERALS);
  if (lit && en) lits = lits.concat(EN_LITERALS);
  if (lits.length) patchTextNodes(el, buildRegex(lits, true), 'hljs-literal');

  // Annotations → hljs-meta
  if (ann) {
    ANNOTATION_RE.lastIndex = 0;
    patchTextNodes(el, ANNOTATION_RE, 'hljs-meta');
  }
}

/**
 * Patch all <code.language-1c.hljs> elements.
 * @param {HTMLElement|Document} [root=document]
 * @param {Object} [options]
 */
function patchAll(root, options) {
  var ctx = root || document;
  Array.prototype.slice.call(
    ctx.querySelectorAll('code.language-1c.hljs')
  ).forEach(function (el) { patch(el, options); });
}

module.exports = { patch: patch, patchAll: patchAll };

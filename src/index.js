/**
 * highlightjs-1c-bsl v1.1.0
 *
 * Post-processor for highlight.js that adds hljs-keyword class to BSL keywords
 * missed by the official 1c grammar:
 *
 * Russian localization — scope markers not tagged as keywords:
 *   Функция / КонецФункции / Процедура / КонецПроцедуры / Знач
 *
 * English localization — hljs 1c grammar is Russian-only, so ALL English BSL
 * keywords need patching. This patch covers the core control-flow set.
 *
 * Usage:
 *   import { patchAll } from 'highlightjs-1c-bsl';
 *   hljs.highlightAll();
 *   patchAll();
 */

'use strict';

/** Chars allowed inside a BSL identifier (word boundary substitute for \b) */
var WORD = 'a-zA-Zа-яёА-ЯЁ0-9_';

/**
 * Russian: keywords that hljs 1c grammar does NOT color as hljs-keyword.
 * Scope markers (begin/end of function container) + parameter modifier.
 */
var RU_CRITICAL = [
  'Функция', 'КонецФункции',
  'Процедура', 'КонецПроцедуры',
  'Знач',
];

/**
 * Russian extended: ARE in hljs keyword list, patching is harmless redundancy.
 * Useful as safety net for older hljs versions.
 */
var RU_EXTENDED = [
  'Экспорт', 'Перем', 'ВызватьИсключение',
];

/**
 * English localization of 1C:Enterprise BSL.
 * The official hljs 1c grammar is Russian-only — English keywords get zero
 * coloring without this patch. Covers the full control-flow + declaration set.
 *
 * Note: string literals, comments and numbers in English BSL code still won't
 * be colored — the grammar itself doesn't parse English syntax. Use this patch
 * for keyword highlighting only.
 */
var EN_KEYWORDS = [
  // Function/Procedure declarations (scope markers — same issue as Russian)
  'Function', 'EndFunction',
  'Procedure', 'EndProcedure',
  // Parameter modifier
  'Val',
  // Control flow
  'If', 'Then', 'ElsIf', 'Else', 'EndIf',
  'While', 'Do', 'EndDo',
  'For', 'Each', 'In', 'To',
  'Break', 'Continue',
  'Return', 'Goto',
  // Exception handling
  'Try', 'Except', 'EndTry', 'Raise',
  // Declarations
  'Var', 'Export',
  // Object creation
  'New',
  // Literals
  'True', 'False', 'Undefined', 'Null',
  // Logical operators
  'And', 'Or', 'Not',
];

function buildRegex(words) {
  return new RegExp(
    '(^|[^' + WORD + '])(' + words.join('|') + ')(?![' + WORD + '])',
    'g'
  );
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
  });
}

/**
 * Walk text nodes inside `root`, wrapping keyword matches in hljs-keyword spans.
 * Only bare text nodes are touched — existing hljs spans are descended but not replaced.
 */
function patchTextNodes(root, regex) {
  function walk(node) {
    if (node.nodeType === 3 /* TEXT_NODE */) {
      var text = node.textContent;
      regex.lastIndex = 0;
      if (!regex.test(text)) return;
      regex.lastIndex = 0;
      var html = escapeHtml(text).replace(regex, function (_, pre, kw) {
        return pre + '<span class="hljs-keyword">' + kw + '</span>';
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
 * @param {HTMLElement} el
 * @param {Object}  [options]
 * @param {boolean} [options.russian=true]          - patch Russian keywords
 * @param {boolean} [options.english=true]          - patch English keywords
 * @param {boolean} [options.extendedRussian=true]  - include RU_EXTENDED safety set
 */
function patch(el, options) {
  var opts = options || {};
  var ru      = opts.russian         !== false;
  var en      = opts.english         !== false;
  var ruExt   = opts.extendedRussian !== false;

  var words = [];
  if (ru) {
    words = words.concat(RU_CRITICAL);
    if (ruExt) words = words.concat(RU_EXTENDED);
  }
  if (en) words = words.concat(EN_KEYWORDS);

  if (words.length === 0) return;
  patchTextNodes(el, buildRegex(words));
}

/**
 * Patch all <code.language-1c.hljs> elements in the document (or under root).
 * @param {HTMLElement|Document} [root=document]
 * @param {Object} [options] - same as patch()
 */
function patchAll(root, options) {
  var ctx = root || document;
  Array.prototype.slice.call(
    ctx.querySelectorAll('code.language-1c.hljs')
  ).forEach(function (el) { patch(el, options); });
}

module.exports = { patch: patch, patchAll: patchAll };

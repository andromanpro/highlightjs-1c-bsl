/**
 * highlightjs-1c-bsl
 *
 * Post-processor for highlight.js that adds hljs-keyword class to BSL keywords
 * that the official 1c grammar treats as scope markers (not keywords):
 *   Функция / КонецФункции / Процедура / КонецПроцедуры
 *
 * Also patches Знач (parameter modifier, not in hljs keyword list).
 *
 * Why needed: hljs 1c grammar declares these as container begin/end markers
 * (function scope), so the text itself gets no className. All other BSL
 * keywords (Если/Тогда, Пока/Цикл, Возврат, Новый, etc.) are handled natively.
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
 * Keywords that hljs 1c grammar does NOT color as hljs-keyword.
 * Minimal set — only those genuinely missing from the keyword list.
 */
var CRITICAL_KW = [
  'Функция', 'КонецФункции',
  'Процедура', 'КонецПроцедуры',
  'Знач',
];

/**
 * Additional keywords: these ARE in the hljs keyword list but patching them
 * is harmless (they're already inside <span.hljs-keyword>, so the text node
 * won't exist as a bare text node and regex won't match).
 * Included for safety when used against older hljs versions.
 */
var EXTENDED_KW = [
  'Экспорт', 'Перем', 'ВызватьИсключение',
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
 * Walk text nodes inside `root`, applying `regex`.
 * Matched group 2 gets wrapped in <span class="hljs-keyword">.
 * Existing spans (from hljs) are descended into but never replaced —
 * only bare text nodes are processed.
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
      // replaceWith spread (IE not supported, but hljs v11 targets modern browsers)
      node.replaceWith.apply(node, Array.prototype.slice.call(holder.childNodes));
    } else if (node.childNodes) {
      Array.prototype.slice.call(node.childNodes).forEach(walk);
    }
  }
  walk(root);
}

/**
 * Patch a single <code> element that was processed by hljs.
 * @param {HTMLElement} el - code element with language-1c and hljs classes
 * @param {Object} [options]
 * @param {boolean} [options.extendedKeywords=true] - include extended keyword set
 */
function patch(el, options) {
  var opts = options || {};
  var extended = opts.extendedKeywords !== false;

  var words = CRITICAL_KW.slice();
  if (extended) words = words.concat(EXTENDED_KW);

  var regex = buildRegex(words);
  patchTextNodes(el, regex);
}

/**
 * Patch all <code.language-1c.hljs> elements in the document (or under root).
 * @param {HTMLElement|Document} [root=document]
 * @param {Object} [options] - same as patch()
 */
function patchAll(root, options) {
  var ctx = root || document;
  var elements = ctx.querySelectorAll('code.language-1c.hljs');
  Array.prototype.slice.call(elements).forEach(function (el) {
    patch(el, options);
  });
}

module.exports = { patch: patch, patchAll: patchAll };

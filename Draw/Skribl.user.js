// ==UserScript==
// @name Skribl
// @namespace Glaciusor
// @include *
// ==/UserScript==


var skribl_script_insert = document.createElement('script');

skribl_script_insert.setAttribute("data-main", "http://glaciusor.github.com/sandbox/Draw/Skribl.js");
skribl_script_insert.src = 'http://glaciusor.github.com/sandbox/Draw/require.js';

document.head.appendChild(skribl_script_insert);

/* Line icons for the clinic tools, drawn with currentColor. */
(function () {
  'use strict';
  var P = {
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    tongue: '<path d="M5 8c2 1.5 12 1.5 14 0"/><path d="M7 8.6v4.4a5 5 0 0 0 10 0V8.6"/><path d="M12 9.5v5"/>',
    ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 9a2 2 0 0 1 4 0c0 1.4-2 2-2 3.4"/><path d="M19 5c1.4 1.4 2 3 2 5M20.5 14c-.3 1-.8 2-1.5 2.8"/>',
    chat: '<path d="M4 5h16v10H9l-5 4Z"/><path d="M8 9h8M8 12h5"/>',
    thermo: '<path d="M10 4a2 2 0 0 1 4 0v10.3a4 4 0 1 1-4 0Z"/><path d="M12 9v8"/><path d="M16 6h2M16 9h2"/>',
    pulse: '<path d="M2 13h4l2-5 3 10 3-7 2 2h6"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10.5V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-3 0-4.5-1.6-6-4l-1.8-3a1.5 1.5 0 0 1 2.4-1.8L8 13"/>',
    needle: '<path d="M4 20 15 9"/><rect x="14.5" y="3.5" width="5" height="7" rx="1.5" transform="rotate(45 17 7)"/>',
    moxa: '<rect x="9" y="3" width="6" height="12" rx="1.5"/><path d="M12 15v1"/><path d="M10 20c0-1.5 2-2 2-3.5 0 1.5 2 2 2 3.5a2 2 0 0 1-4 0Z"/>',
    scale: '<path d="M12 4v16M6 20h12M4 8h16"/><path d="M4 8l-2 6a3 3 0 0 0 4 0Z M20 8l-2 6a3 3 0 0 0 4 0Z"/>',
    pot: '<path d="M4 10h16l-1.5 8a2 2 0 0 1-2 1.6h-9a2 2 0 0 1-2-1.6Z"/><path d="M8 10V8h8v2M9 5c0-1 1-1 1-2M13 5c0-1 1-1 1-2"/>',
    check: '<path d="M5 12.5 10 17 19 7"/>',
    play: '<path d="M8 5v14l11-7Z"/>'
  };
  window.TCM.icon = function (name, size) {
    return '<svg class="ico" width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };
})();

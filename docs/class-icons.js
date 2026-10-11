const CLASS_ICONS = {
  guardian:
    '<svg class="class-icon" viewBox="0 0 32 32" aria-label="guardian"><path d="M16 2 L28 7 V15 C28 22 22.5 27.5 16 30 C9.5 27.5 4 22 4 15 V7 Z" fill="#2c6e9e" stroke="#173d5c" stroke-width="1.5"/><path d="M16 7 L23 10 V15 C23 19.5 20 23 16 24.7 C12 23 9 19.5 9 15 V10 Z" fill="#cfe3f2"/></svg>',
  seeker:
    '<svg class="class-icon" viewBox="0 0 32 32" aria-label="seeker"><circle cx="14" cy="13" r="7" fill="none" stroke="#c8842c" stroke-width="2.5"/><path d="M19.2 18.2 L26 25" stroke="#c8842c" stroke-width="3.5" stroke-linecap="round"/><path d="M11 13 H17 M14 10 V16" stroke="#c8842c" stroke-width="2"/></svg>',
  rogue:
    '<svg class="class-icon" viewBox="0 0 32 32" aria-label="rogue"><path d="M6 26 L16 4 L26 26 L21 26 L16 14 L11 26 Z" fill="#4f7a4f" stroke="#2f4a2f" stroke-width="1.5"/></svg>',
  mystic:
    '<svg class="class-icon" viewBox="0 0 32 32" aria-label="mystic"><circle cx="16" cy="16" r="6" fill="#6b4d9e"/><path d="M16 3 L18.5 12 L27 10 L20 16 L27 22 L18.5 20 L16 29 L13.5 20 L5 22 L12 16 L5 10 L13.5 12 Z" fill="none" stroke="#6b4d9e" stroke-width="1.6"/></svg>',
  survivor:
    '<svg class="class-icon" viewBox="0 0 32 32" aria-label="survivor"><path d="M16 4 L28 14 H23 V28 H9 V14 H4 Z" fill="#a4442c" stroke="#5f2416" stroke-width="1.5"/><path d="M9 14 H23 M9 20 H23" stroke="#5f2416" stroke-width="1.2"/></svg>',
  neutral:
    '<svg class="class-icon" viewBox="0 0 32 32" aria-label="neutral"><circle cx="16" cy="16" r="11" fill="none" stroke="#7a7266" stroke-width="2.5"/></svg>',
};

function renderClassIcon(factionName) {
  return CLASS_ICONS[factionName] ?? CLASS_ICONS.neutral;
}

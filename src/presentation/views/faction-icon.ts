const FACTION_ICONS: Record<string, string> = {
  guardian: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 2.5 L27.5 6.8 V15 C27.5 21.8 22.6 26.9 16 29.5 C9.4 26.9 4.5 21.8 4.5 15 V6.8 Z" fill="#2c5d8c" stroke="#12293f" stroke-width="1.4"/><path d="M16 6.5 L23.2 9.2 V14.8 C23.2 19.3 20.2 23.1 16 25.2 C11.8 23.1 8.8 19.3 8.8 14.8 V9.2 Z" fill="#7fa8c9"/><path d="M16 10 V21 M12 13.5 H20" stroke="#12293f" stroke-width="1.6" stroke-linecap="round"/></svg>',
  seeker: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="13.5" cy="13" r="6.5" fill="none" stroke="#c4792b" stroke-width="2.6"/><path d="M18.4 17.9 L25.5 25" stroke="#c4792b" stroke-width="3.4" stroke-linecap="round"/><circle cx="13.5" cy="13" r="2.2" fill="#c4792b"/></svg>',
  rogue: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M15.5 3.5 L18.5 13.5 L26 21 L22.5 24.5 L15 17 L5.5 27.5 L3.5 25.5 L14 16 L7 10.5 L10.5 7 Z" fill="#4d7d4a" stroke="#263f25" stroke-width="1.3"/></svg>',
  mystic: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 2.5 L19 11.5 L28.5 9.5 L21.5 16 L28.5 22.5 L19 20.5 L16 29.5 L13 20.5 L3.5 22.5 L10.5 16 L3.5 9.5 L13 11.5 Z" fill="none" stroke="#6f5ba1" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16" cy="16" r="4.5" fill="#6f5ba1"/></svg>',
  survivor: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 3.5 L28.5 13.5 H24 V28.5 H8 V13.5 H3.5 Z" fill="#a63d22" stroke="#4f1d0e" stroke-width="1.4"/><path d="M8 13.5 H24 M8 20 H24 M16 3.5 V28.5" stroke="#4f1d0e" stroke-width="1.1"/></svg>',
  neutral: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10.5" fill="none" stroke="#6e675c" stroke-width="2.6"/></svg>',
};

export function renderFactionIcon(factionName: string): string {
  const symbol = FACTION_ICONS[factionName] ?? FACTION_ICONS.neutral;
  return `<span class="faction-icon ${escapeHtml(factionName)}" title="${escapeHtml(factionName)}">${symbol}</span>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FACTION_SYMBOLS: Record<string, string> = {
  guardian: "🛡",
  seeker: "🔍",
  rogue: "🗡",
  mystic: "🔮",
  survivor: "🪓",
  neutral: "◯",
};

export function renderFactionIcon(factionName: string): string {
  const symbol = FACTION_SYMBOLS[factionName] ?? FACTION_SYMBOLS.neutral;
  return `<span class="faction-icon ${escapeHtml(factionName)}"><span class="faction-symbol">${symbol}</span>${escapeHtml(factionName)}</span>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

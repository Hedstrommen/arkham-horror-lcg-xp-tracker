const FACTION_ICON_URLS: Record<string, string> = {
  guardian: "/styles/factions/guardian.png",
  seeker: "/styles/factions/seeker.png",
  rogue: "/styles/factions/rogue.png",
  mystic: "/styles/factions/mystic.png",
  survivor: "/styles/factions/survivor.png",
};

export function renderFactionIcon(factionName: string): string {
  const iconUrl = FACTION_ICON_URLS[factionName];
  if (iconUrl === undefined) {
    return "";
  }
  return `<img class="class-icon" src="${iconUrl}" alt="${escapeHtml(factionName)}" title="${escapeHtml(factionName)}">`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

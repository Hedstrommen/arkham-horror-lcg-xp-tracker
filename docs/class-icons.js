const CLASS_ICON_URLS = {
  guardian: "styles/factions/guardian.png",
  seeker: "styles/factions/seeker.png",
  rogue: "styles/factions/rogue.png",
  mystic: "styles/factions/mystic.png",
  survivor: "styles/factions/survivor.png",
};

function renderClassIcon(factionName) {
  const iconUrl = CLASS_ICON_URLS[factionName];
  if (iconUrl === undefined) {
    return "";
  }
  return `<img class="class-icon" src="${iconUrl}" alt="${factionName}" title="${factionName}">`;
}

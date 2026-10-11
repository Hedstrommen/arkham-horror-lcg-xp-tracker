const CAMPAIGN_SIGIL_URLS = {
  "Night of the Zealot": "styles/campaign-sigils/night-of-the-zealot.svg",
  "The Dunwich Legacy": "styles/campaign-sigils/the-dunwich-legacy.svg",
  "The Path to Carcosa": "styles/campaign-sigils/the-path-to-carcosa.svg",
  "The Forgotten Age": "styles/campaign-sigils/the-forgotten-age.svg",
  "The Circle Undone": "styles/campaign-sigils/the-circle-undone.svg",
  "The Dream-Eaters": "styles/campaign-sigils/the-dream-eaters.svg",
  "The Innsmouth Conspiracy": "styles/campaign-sigils/the-innsmouth-conspiracy.svg",
  "Edge of the Earth": "styles/campaign-sigils/edge-of-the-earth.svg",
  "The Scarlet Keys": "styles/campaign-sigils/the-scarlet-keys.svg",
  "The Feast of Hemlock Vale": "styles/campaign-sigils/the-feast-of-hemlock-vale.svg",
  "The Drowned City": "styles/campaign-sigils/the-drowned-city.svg",
  "Brethren of Ash": "styles/campaign-sigils/brethren-of-ash.svg",
  "Children of Blood": "styles/campaign-sigils/children-of-blood.svg",
};

function renderCampaignSigil(campaignName) {
  const sigilUrl = CAMPAIGN_SIGIL_URLS[campaignName];
  if (sigilUrl === undefined) {
    return "";
  }
  return `<img class="campaign-sigil" src="${sigilUrl}" alt="${campaignName}" title="${campaignName}">`;
}

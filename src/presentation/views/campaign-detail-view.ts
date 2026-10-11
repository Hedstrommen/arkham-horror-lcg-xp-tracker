import { Campaign } from "../../domain/campaign/campaign";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";

const CAMPAIGN_SIGIL_URLS: Record<string, string> = {
  "Night of the Zealot": "/styles/campaign-sigils/night-of-the-zealot.svg",
  "The Dunwich Legacy": "/styles/campaign-sigils/the-dunwich-legacy.svg",
  "The Path to Carcosa": "/styles/campaign-sigils/the-path-to-carcosa.svg",
  "The Forgotten Age": "/styles/campaign-sigils/the-forgotten-age.svg",
  "The Circle Undone": "/styles/campaign-sigils/the-circle-undone.svg",
  "The Dream-Eaters": "/styles/campaign-sigils/the-dream-eaters.svg",
  "The Innsmouth Conspiracy": "/styles/campaign-sigils/the-innsmouth-conspiracy.svg",
  "Edge of the Earth": "/styles/campaign-sigils/edge-of-the-earth.svg",
  "The Scarlet Keys": "/styles/campaign-sigils/the-scarlet-keys.svg",
  "The Feast of Hemlock Vale": "/styles/campaign-sigils/the-feast-of-hemlock-vale.svg",
  "The Drowned City": "/styles/campaign-sigils/the-drowned-city.svg",
  "Brethren of Ash": "/styles/campaign-sigils/brethren-of-ash.svg",
  "Children of Blood": "/styles/campaign-sigils/children-of-blood.svg",
};

function renderCampaignSigil(campaignName: string): string {
  const sigilUrl = CAMPAIGN_SIGIL_URLS[campaignName];
  if (sigilUrl === undefined) {
    return "";
  }
  return `<img class="campaign-sigil" src="${sigilUrl}" alt="${escapeHtml(campaignName)}" title="${escapeHtml(campaignName)}">`;
}

export function renderCampaignDetailPage(
  campaign: Campaign,
  editMode = false
): string {
  const experienceLogItems = campaign
    .getExperienceLog()
    .map(
      (entry) => `
      <li class="experience-entry">
        <details>
          <summary>
            <span class="entry-kind">${escapeHtml(entry.experienceType.getDisplayName())} &mdash; ${escapeHtml(entry.experienceTitle)}: +${entry.experiencePoints.getAmount()} XP</span>
            ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
          </summary>
          <form class="edit-entry-form" method="post" action="/campaigns/${escapeHtml(campaign.id)}/experience/${escapeHtml(entry.id)}">
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-kind">Experience type</label>
              <select id="edit-${escapeHtml(entry.id)}-kind" name="experienceKind" required>
                <option value="scenario" ${entry.experienceType.getKind() === "scenario" ? "selected" : ""}>Scenario</option>
                <option value="interlude" ${entry.experienceType.getKind() === "interlude" ? "selected" : ""}>Interlude</option>
                <option value="weakness" ${entry.experienceType.getKind() === "weakness" ? "selected" : ""}>Weakness</option>
                <option value="permanent" ${entry.experienceType.getKind() === "permanent" ? "selected" : ""}>Permanent</option>
              </select>
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-title">Title</label>
              <input type="text" id="edit-${escapeHtml(entry.id)}-title" name="experienceTitle" maxlength="120" required value="${escapeHtml(entry.experienceTitle)}">
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-amount">Experience</label>
              <input type="number" id="edit-${escapeHtml(entry.id)}-amount" name="experienceAmount" min="0" step="1" required value="${entry.experiencePoints.getAmount()}">
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-notes">Notes</label>
              <textarea id="edit-${escapeHtml(entry.id)}-notes" name="notes">${entry.notes ? escapeHtml(entry.notes) : ""}</textarea>
            </div>
            <div class="actions">
              <button class="arkham-button" type="submit">Save changes</button>
            </div>
          </form>
        </details>
      </li>`
    )
    .join("");

  const breakdownParts = Object.entries(campaign.getExperienceBreakdownByKind())
    .map(([kind, amount]) => `${kind.charAt(0).toUpperCase() + kind.slice(1)} xp: ${amount}`)
    .join(" &middot; ");
  const breakdownLine = breakdownParts.length > 0
    ? `<span class="experience-breakdown">${breakdownParts}</span>`
    : "";

  const experienceLog = campaign.getExperienceLog().length > 0
    ? `<h2>Experience log</h2>
       <p class="experience-total experience-log-total">Total: ${campaign.getTotalExperience()} XP ${breakdownLine}</p>
       <ul class="experience-log">${experienceLogItems}</ul>`
    : "";

  const infoSection = editMode
    ? `
      <form method="post" action="/campaigns/${escapeHtml(campaign.id)}/edit">
        <div class="form-field">
          <label for="campaign-detail-title">Title</label>
          <input type="text" id="campaign-detail-title" name="title" maxlength="120" required value="${escapeHtml(campaign.getTitle().toString())}">
        </div>
        <div class="form-field">
          <label for="campaign-detail-friends">Friends</label>
          <input type="text" id="campaign-detail-friends" name="friends" value="${escapeHtml(campaign.friends.join(", "))}">
        </div>
        <div class="form-field">
          <label for="campaign-detail-notes">Notes</label>
          <textarea id="campaign-detail-notes" name="notes">${campaign.notes ? escapeHtml(campaign.notes) : ""}</textarea>
        </div>
        <div class="actions">
          <button class="arkham-button" type="submit">Save changes</button>
          <a class="arkham-button subtle" href="/campaigns/${escapeHtml(campaign.id)}">Cancel</a>
        </div>
      </form>`
    : `
      <div class="campaign-view-info">
        <h2>${escapeHtml(campaign.getTitle().toString())}</h2>
        <div class="detail-info-row">
          <span class="campaign-name-with-sigil">${escapeHtml(campaign.campaignName)} ${renderCampaignSigil(campaign.campaignName)}</span>
          <span class="investigator-with-icon">
            <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
            ${renderFactionIcon(campaign.investigatorFaction)}
            <span class="chapter-badge">Ch. ${campaign.chapter}</span>
          </span>
        </div>
        ${campaign.friends.length > 0 ? `<p class="detail-friends">Friends: ${escapeHtml(campaign.friends.join(", "))}</p>` : ""}
        ${campaign.notes ? `<p class="detail-notes">${escapeHtml(campaign.notes)}</p>` : ""}
        <p class="experience-total detail-total-xp">Total xp: ${campaign.getTotalExperience()}</p>
        ${breakdownLine}
      </div>
      <div class="actions detail-actions">
        <a class="arkham-button subtle" href="/campaigns/${escapeHtml(campaign.id)}?edit=1">Edit</a>
        ${campaign.getIsActive()
          ? `<a class="arkham-button" href="/campaigns/${escapeHtml(campaign.id)}/gain-experience">Add experience</a>`
          : ""}
        <form method="post" action="/campaigns/${escapeHtml(campaign.id)}/delete" class="inline-form">
          <button class="arkham-button danger" type="submit">Delete campaign</button>
        </form>
      </div>`;

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    <div class="form-card campaign-detail-card">
      ${infoSection}
    </div>
    ${experienceLog}`;

  return renderLayout("Campaign", content);
}

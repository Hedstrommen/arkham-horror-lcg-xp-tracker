import { Campaign } from "../../domain/campaign/campaign";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";

export function renderCampaignDetailPage(campaign: Campaign): string {
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

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    <div class="form-card campaign-detail-card">
      <form method="post" action="/campaigns/${escapeHtml(campaign.id)}/edit">
        <div class="form-field">
          <label for="campaign-detail-title">Title</label>
          <input type="text" id="campaign-detail-title" name="title" maxlength="120" required value="${escapeHtml(campaign.getTitle().toString())}">
        </div>
        <div class="detail-info-row">
          <span>${escapeHtml(campaign.campaignName)} <span class="chapter-badge">Ch. ${campaign.chapter}</span></span>
          <span class="investigator-with-icon">
            <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
            ${renderFactionIcon(campaign.investigatorFaction)}
            <span class="chapter-badge">Ch. ${campaign.chapter}</span>
          </span>
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
          ${campaign.getIsActive()
            ? `<a class="arkham-button" href="/campaigns/${escapeHtml(campaign.id)}/gain-experience">Add experience</a>`
            : ""}
        </div>
      </form>
    </div>
    ${experienceLog}`;

  return renderLayout("Campaign", content);
}

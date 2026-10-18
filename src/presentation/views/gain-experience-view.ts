import { Campaign } from "../../domain/campaign/campaign";
import { InvestigatorFactionName } from "../../domain/value-objects/investigator-faction";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";


function friendAmountFields(campaign: Campaign): string {
  return campaign.friends
    .map(
      (friend, index) => `
      <div class="form-field friend-amount-field">
        <label for="friend-amount-${index}">${escapeHtml(friend.name)}${friend.investigatorName ? ` <span class="friend-investigator-hint">(${escapeHtml(friend.investigatorName)})</span>` : ""} &mdash; experience (optional)</label>
        <input type="number" id="friend-amount-${index}" name="friendAmounts" min="0" step="1">
        <input type="hidden" name="friendNames" value="${escapeHtml(friend.name)}">
      </div>`
    )
    .join("");
}

export function renderGainExperiencePage(
  campaign: Campaign,
  errorMessage: string | null
): string {
  const factionIcon = renderFactionIcon(
    campaign.investigatorFaction as InvestigatorFactionName
  );
  const errorBlock = errorMessage
    ? `<div class="error-message">${escapeHtml(errorMessage)}</div>`
    : "";

  const experienceLogItems = campaign
    .getExperienceLog()
    .map(
      (entry) => `
      <li class="experience-entry">
        <details>
          <summary>
            <span class="entry-kind">${escapeHtml(entry.experienceType.getDisplayName())} &mdash; ${escapeHtml(entry.experienceTitle)}: +${entry.experiencePoints.getAmount()} XP</span>
            ${Object.keys(entry.friendAmounts).length > 0 ? `<span class="entry-friend-amounts">${escapeHtml(campaign.friends.map((friend) => `${friend.name}: +${entry.friendAmounts[friend.name] ?? 0}`).join(" &middot; "))}</span>` : ""}
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
              <label for="edit-${escapeHtml(entry.id)}-amount">Experience</label>
              <input type="number" id="edit-${escapeHtml(entry.id)}-amount" name="experienceAmount" min="0" step="1" required value="${entry.experiencePoints.getAmount()}">
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-title">Title</label>
              <input type="text" id="edit-${escapeHtml(entry.id)}-title" name="experienceTitle" maxlength="120" required value="${escapeHtml(entry.experienceTitle)}">
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

  const experienceLog = campaign.getExperienceLog().length > 0
    ? `<h2>Experience log</h2>
       <ul class="experience-log">${experienceLogItems}</ul>`
    : "";

  const content = `
    <a class="back-link" href="/campaigns/${escapeHtml(campaign.id)}">&larr; Back to campaign</a>
    <div class="campaign-context">
      <span>${escapeHtml(campaign.campaignName)} <span class="chapter-badge">Ch. ${campaign.chapter}</span></span>
      <span class="investigator-with-icon">
        ${factionIcon}
        <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
      </span>
      <span class="experience-total">${escapeHtml(campaign.getTitle().toString())} - ${campaign.getTotalExperience()} XP</span>
    </div>
    ${errorBlock}
    <form class="form-card" method="post" action="/campaigns/${escapeHtml(campaign.id)}/gain-experience">
      <h2>Gain experience</h2>
      <div class="form-field">
        <label for="experienceKind">Experience type</label>
        <select id="experienceKind" name="experienceKind" required>
          <option value="scenario">Scenario</option>
          <option value="interlude">Interlude</option>
          <option value="weakness">Weakness</option>
          <option value="permanent">Permanent</option>
        </select>
      </div>
      <div class="form-field">
        <label for="experienceTitle">Title</label>
        <input type="text" id="experienceTitle" name="experienceTitle" maxlength="120" required placeholder="e.g. &quot;Scenario 1&quot;, &quot;Interlude scenario 1/2&quot;, &quot;Prelude day 1&quot;, &quot;In the thick of it&quot;">
      </div>
      <div class="form-field">
        <label for="experienceAmount">Your experience (${escapeHtml(campaign.investigatorName)})</label>
        <input type="number" id="experienceAmount" name="experienceAmount" min="0" step="1" required>
      </div>
      ${friendAmountFields(campaign)}
      <div class="form-field">
        <label for="notes">Notes</label>
        <textarea id="notes" name="notes" placeholder="Optional notes"></textarea>
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Record experience</button>
      </div>
    </form>
    ${experienceLog}`;

  return renderLayout("Gain experience", content);
}

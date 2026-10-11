import { Campaign } from "../../domain/campaign/campaign";
import { InvestigatorFactionName } from "../../domain/value-objects/investigator-faction";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";

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
      (entry) =>
        `<li>
           <span class="entry-kind">${escapeHtml(entry.experienceType.getDisplayName())}: +${entry.experiencePoints.getAmount()} XP</span>
           ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
         </li>`
    )
    .join("");

  const experienceLog = campaign.getExperienceLog().length > 0
    ? `<h2>Experience log</h2>
       <ul class="experience-log">${experienceLogItems}</ul>`
    : "";

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    <div class="campaign-context">
      <span>${escapeHtml(campaign.campaignName)}</span>
      ${factionIcon}
      <span>${escapeHtml(campaign.investigatorName)}</span>
      <span class="experience-total">${escapeHtml(campaign.title.toString())} - ${campaign.getTotalExperience()} XP</span>
    </div>
    ${errorBlock}
    <form class="form-card" method="post" action="/campaigns/${escapeHtml(campaign.id)}/gain-experience">
      <h2>Gain experience</h2>
      <div class="form-field">
        <label for="experienceKind">Experience type</label>
        <select id="experienceKind" name="experienceKind" required>
          <option value="scenario">Scenario</option>
          <option value="interlude">Interlude</option>
          <option value="card">Card experience</option>
        </select>
      </div>
      <div class="form-field">
        <label for="experienceAmount">Experience (numbers)</label>
        <input type="number" id="experienceAmount" name="experienceAmount" min="0" step="1" required>
      </div>
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

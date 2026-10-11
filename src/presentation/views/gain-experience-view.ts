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
      (entry) => `
      <li class="experience-entry">
        <details>
          <summary>
            <span class="entry-kind">${escapeHtml(entry.experienceType.getDisplayName())}${entry.experienceSuffix ? " " + escapeHtml(entry.experienceSuffix) : ""}: +${entry.experiencePoints.getAmount()} XP</span>
            ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
          </summary>
          <form class="edit-entry-form" method="post" action="/campaigns/${escapeHtml(campaign.id)}/experience/${escapeHtml(entry.id)}">
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-kind">Experience type</label>
              <select id="edit-${escapeHtml(entry.id)}-kind" name="experienceKind" required>
                <option value="scenario" ${entry.experienceType.getKind() === "scenario" ? "selected" : ""}>Scenario</option>
                <option value="interlude" ${entry.experienceType.getKind() === "interlude" ? "selected" : ""}>Interlude</option>
                <option value="card" ${entry.experienceType.getKind() === "card" ? "selected" : ""}>Card experience</option>
              </select>
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-amount">Experience (numbers)</label>
              <input type="number" id="edit-${escapeHtml(entry.id)}-amount" name="experienceAmount" min="0" step="1" required value="${entry.experiencePoints.getAmount()}">
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-suffix">Suffix</label>
              <input type="text" id="edit-${escapeHtml(entry.id)}-suffix" name="experienceSuffix" maxlength="60" value="${entry.experienceSuffix ? escapeHtml(entry.experienceSuffix) : ""}">
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
       <p class="experience-total experience-log-total">Total: ${campaign.getTotalExperience()} XP</p>
       <ul class="experience-log">${experienceLogItems}</ul>`
    : "";

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    <div class="campaign-context">
      <span>${escapeHtml(campaign.campaignName)}</span>
      <span class="investigator-with-icon">
        ${factionIcon}
        <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
      </span>
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
        <label for="experienceSuffix">Suffix (optional)</label>
        <input type="text" id="experienceSuffix" name="experienceSuffix" maxlength="60" placeholder="e.g. 1, Second day, Weakness">
        <p class="form-hint">Add a label after the experience type, like "Scenario 1" or "Weakness".</p>
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

import {
  CampaignDefinition,
  InvestigatorDefinition,
} from "../../application/ports/arkham-catalog";
import { escapeHtml, renderLayout } from "./layout";

export function renderCreateCampaignPage(
  campaigns: CampaignDefinition[],
  investigators: InvestigatorDefinition[],
  errorMessage: string | null,
  previouslyEnteredTitle: string
): string {
  const campaignOptions = campaigns
    .map(
      (campaign) =>
        `<option value="${escapeHtml(campaign.campaignName)}">${escapeHtml(campaign.campaignName)}</option>`
    )
    .join("");

  const investigatorOptions = investigators
    .map(
      (investigator) =>
        `<option value="${escapeHtml(investigator.investigatorId)}">${escapeHtml(investigator.investigatorName)} (${escapeHtml(investigator.factionName)})</option>`
    )
    .join("");

  const errorBlock = errorMessage
    ? `<div class="error-message">${escapeHtml(errorMessage)}</div>`
    : "";

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    ${errorBlock}
    <form class="form-card" method="post" action="/campaigns">
      <h2>Create a new campaign</h2>
      <div class="form-field">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" required value="${escapeHtml(previouslyEnteredTitle)}">
      </div>
      <div class="form-field">
        <label for="campaignName">Campaign</label>
        <select id="campaignName" name="campaignName" required>
          ${campaignOptions}
        </select>
      </div>
      <div class="form-field">
        <label for="friends">Friends you play with</label>
        <input type="text" id="friends" name="friends" placeholder="e.g. Sven, Lisa, Jon">
        <p class="form-hint">Separate multiple names with commas. Optional.</p>
      </div>
      <div class="form-field">
        <label for="investigatorId">Your investigator</label>
        <select id="investigatorId" name="investigatorId" required>
          ${investigatorOptions}
        </select>
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Start campaign</button>
      </div>
    </form>`;

  return renderLayout("Create campaign", content);
}

import { CampaignOverview } from "../../application/use-cases/list-campaigns/campaign-overview";
import { InvestigatorFactionName } from "../../domain/value-objects/investigator-faction";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";
import { renderCampaignSigil } from "./campaign-sigil";

export function renderOverviewPage(campaigns: CampaignOverview[]): string {
  const campaignCards = campaigns.map(renderCampaignCard).join("\n");
  const campaignList = `
    <ul class="campaign-list">
      ${campaignCards}
    </ul>`;
  const emptyState = `
    <p class="empty-state">No campaigns yet. The mythos awaits — start one!</p>`;

  const content = `
    <div class="toolbar">
      <a class="arkham-button" href="/campaigns/new">Create new campaign</a>
    </div>
    ${campaigns.length > 0 ? campaignList : emptyState}`;

  return renderLayout("Campaigns", content);
}

function renderCampaignCard(campaign: CampaignOverview): string {
  const statusBadge = campaign.isActive
    ? '<span class="status-badge active">Active</span>'
    : '<span class="status-badge">Finished</span>';

  const detailsRow = campaign.isActive
    ? `
      <div class="details-row">
        <span class="campaign-name-with-sigil">${escapeHtml(campaign.campaignName)} ${renderCampaignSigil(campaign.campaignName)}</span>
        <span class="investigator-with-icon">
          <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
          ${renderFactionIcon(campaign.investigatorFaction)}
          <span class="chapter-badge">Ch. ${campaign.chapter}</span>
        </span>
        <span class="experience-total total-xp-cell">Total xp: ${campaign.totalExperience}</span>
      </div>
      ${campaign.notes ? `<p class="campaign-notes">${escapeHtml(campaign.notes)}</p>` : ""}
      <div class="actions">
        <a class="arkham-button" href="/campaigns/${escapeHtml(campaign.campaignId)}">View campaign</a>
        ${renderStatusToggle(campaign)}
      </div>`
    : "";

  const finishedButtons = campaign.isActive
    ? ""
    : `
        <span class="finished-buttons">
          <a class="arkham-button" href="/campaigns/${escapeHtml(campaign.campaignId)}">View campaign</a>
          ${renderStatusToggle(campaign)}
        </span>`;

  return `
    <li class="campaign-card ${campaign.isActive ? "" : "inactive finished"}">
      <div class="title-row finished-title-row">
        <h2><a href="/campaigns/${escapeHtml(campaign.campaignId)}">${escapeHtml(campaign.title)}</a></h2>
        ${statusBadge}
        ${finishedButtons}
      </div>
      ${detailsRow}
    </li>`;
}

function renderStatusToggle(campaign: CampaignOverview): string {
  const statusChange = campaign.isActive ? "finish" : "reactivate";
  const buttonLabel = campaign.isActive ? "Mark finished" : "Reactivate";
  return `
    <form method="post" action="/campaigns/${escapeHtml(campaign.campaignId)}/status">
      <input type="hidden" name="statusChange" value="${statusChange}">
      <button class="arkham-button subtle" type="submit">${buttonLabel}</button>
    </form>`;
}


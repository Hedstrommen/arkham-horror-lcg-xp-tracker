import { CampaignOverview } from "../../application/use-cases/list-campaigns/campaign-overview";
import { InvestigatorFactionName } from "../../domain/value-objects/investigator-faction";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";

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

  return `
    <li class="campaign-card ${campaign.isActive ? "" : "inactive"}">
      <div class="title-row">
        <h2>${escapeHtml(campaign.title)}</h2>
        ${statusBadge}
      </div>
      <div class="details-row">
        <span>${escapeHtml(campaign.campaignName)}</span>
        <span class="investigator-with-icon">
          <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
          ${renderFactionIcon(campaign.investigatorFaction)}
        </span>
        <span class="experience-total">${campaign.totalExperience} XP</span>
      </div>
      ${campaign.notes ? `<p class="campaign-notes">${escapeHtml(campaign.notes)}</p>` : ""}
      <div class="actions">
        ${campaign.isActive ? renderGainExperienceButton(campaign.campaignId) : ""}
        ${renderStatusToggle(campaign)}
      </div>
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

function renderGainExperienceButton(campaignId: string): string {
  return `
    <div class="actions">
      <a class="arkham-button" href="/campaigns/${escapeHtml(campaignId)}/gain-experience">Gain XP</a>
    </div>`;
}

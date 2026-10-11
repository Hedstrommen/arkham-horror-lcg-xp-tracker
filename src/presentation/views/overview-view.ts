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
    <div class="new-campaign-bar">
      <a class="arkham-button" href="/campaigns/new">Create new campaign</a>
    </div>
    ${campaigns.length > 0 ? campaignList : emptyState}`;

  return renderLayout("Campaigns", content);
}

function renderCampaignCard(campaign: CampaignOverview): string {
  const factionIcon = renderFactionIcon(
    campaign.investigatorFaction as InvestigatorFactionName
  );
  const statusBadge = campaign.isActive
    ? '<span class="status-badge active">Active</span>'
    : '<span class="status-badge">Finished</span>';

  return `
    <li class="campaign-card ${campaign.isActive ? "" : "inactive"}">
      <div class="title-row">
        <h2><a href="/campaigns/${escapeHtml(campaign.campaignId)}">${escapeHtml(campaign.title)}</a></h2>
        ${statusBadge}
      </div>
      <div class="details-row">
        <span>${escapeHtml(campaign.campaignName)}</span>
        ${factionIcon}
        <span>${escapeHtml(campaign.investigatorName)}</span>
        <span class="experience-total">${campaign.totalExperience} XP</span>
      </div>
      ${campaign.isActive ? renderGainExperienceButton(campaign.campaignId) : ""}
    </li>`;
}

function renderGainExperienceButton(campaignId: string): string {
  return `
    <div class="actions">
      <a class="arkham-button" href="/campaigns/${escapeHtml(campaignId)}/gain-experience">Gain XP</a>
    </div>`;
}

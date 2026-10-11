import {
  CampaignDefinition,
  InvestigatorDefinition,
} from "../../application/ports/arkham-catalog";
import { escapeHtml, renderLayout } from "./layout";

const FACTION_ICONS: Record<string, string> = {
  guardian: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 2 L28 7 V15 C28 22 22.5 27.5 16 30 C9.5 27.5 4 22 4 15 V7 Z" fill="#2c6e9e" stroke="#173d5c" stroke-width="1.5"/><path d="M16 7 L23 10 V15 C23 19.5 20 23 16 24.7 C12 23 9 19.5 9 15 V10 Z" fill="#cfe3f2"/></svg>',
  seeker: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="14" cy="13" r="7" fill="none" stroke="#c8842c" stroke-width="2.5"/><path d="M19.2 18.2 L26 25" stroke="#c8842c" stroke-width="3.5" stroke-linecap="round"/><path d="M11 13 H17 M14 10 V16" stroke="#c8842c" stroke-width="2"/></svg>',
  rogue: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M6 26 L16 4 L26 26 L21 26 L16 14 L11 26 Z" fill="#4f7a4f" stroke="#2f4a2f" stroke-width="1.5"/></svg>',
  mystic: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#6b4d9e"/><path d="M16 3 L18.5 12 L27 10 L20 16 L27 22 L18.5 20 L16 29 L13.5 20 L5 22 L12 16 L5 10 L13.5 12 Z" fill="none" stroke="#6b4d9e" stroke-width="1.6"/></svg>',
  survivor: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 4 L28 14 H23 V28 H9 V14 H4 Z" fill="#a4442c" stroke="#5f2416" stroke-width="1.5"/><path d="M9 14 H23 M9 20 H23" stroke="#5f2416" stroke-width="1.2"/></svg>',
  neutral: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#7a7266" stroke-width="2.5"/></svg>',
};

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

  const errorBlock = errorMessage
    ? `<div class="error-message">${escapeHtml(errorMessage)}</div>`
    : "";

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    ${errorBlock}
    <form class="form-card" method="post" action="/campaigns">
      <h2>Create a new campaign</h2>
      <div class="form-field">
        <label for="campaignName">Campaign
          <span class="custom-campaign-toggle">
            <input type="checkbox" id="custom-campaign-checkbox">
            <label for="custom-campaign-checkbox" class="custom-campaign-label">Custom</label>
          </span>
        </label>
        <select id="campaignName" name="campaignName" required>${campaignOptions}</select>
        <input type="text" id="customCampaignName" name="campaignName" class="hidden" maxlength="120" placeholder="Write your own campaign name">
      </div>
      <div class="form-field">
        <label for="friends">Friends you play with</label>
        <input type="text" id="friends" name="friends" placeholder="e.g. Sven, Lisa, Jon">
        <p class="form-hint">Separate multiple names with commas. Optional.</p>
      </div>
      <div class="form-field">
        <label for="notes">Notes</label>
        <textarea id="notes" name="notes" placeholder="Optional notes about the campaign"></textarea>
      </div>
      <div class="form-field">
        <label for="investigator-search">Your investigator</label>
        <input type="text" id="investigator-search" placeholder="Search by name..." autocomplete="off">
        <div class="faction-filter" id="faction-filter">
          <button type="button" class="faction-filter-button selected" data-faction="all">All</button>
          <button type="button" class="faction-filter-button" data-faction="guardian">${FACTION_ICONS.guardian} guardian</button>
          <button type="button" class="faction-filter-button" data-faction="seeker">${FACTION_ICONS.seeker} seeker</button>
          <button type="button" class="faction-filter-button" data-faction="rogue">${FACTION_ICONS.rogue} rogue</button>
          <button type="button" class="faction-filter-button" data-faction="mystic">${FACTION_ICONS.mystic} mystic</button>
          <button type="button" class="faction-filter-button" data-faction="survivor">${FACTION_ICONS.survivor} survivor</button>
        </div>
        <select id="investigatorId" name="investigatorId" required size="6"></select>
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Start campaign</button>
      </div>
    </form>
    <script>
      const ALL_INVESTIGATORS = ${JSON.stringify(investigators)};

      function renderInvestigatorOptions() {
        const searchInputElement = document.getElementById("investigator-search");
        const selectedFactionButton = document.querySelector(".faction-filter-button.selected");
        const searchString = searchInputElement.value.trim().toLowerCase();
        const selectedFaction = selectedFactionButton === null ? "all" : selectedFactionButton.dataset.faction;
        const investigatorSelect = document.getElementById("investigatorId");
        const matchingInvestigators = ALL_INVESTIGATORS.filter(function (investigator) {
          const matchesSearch = searchString.length === 0
            || investigator.investigatorName.toLowerCase().includes(searchString);
          const matchesFaction = selectedFaction === "all" || investigator.factionName === selectedFaction;
          return matchesSearch && matchesFaction;
        });
        investigatorSelect.innerHTML = matchingInvestigators
          .map(function (investigator) {
            const symbol = ${JSON.stringify(FACTION_ICONS)}[investigator.factionName] || "";
            return '<option value="' + investigator.investigatorId + '">' + symbol + " " + investigator.investigatorName + " (" + investigator.factionName + ")" + "</option>";
          })
          .join("");
      }

      document.getElementById("investigator-search").addEventListener("input", renderInvestigatorOptions);
      for (const filterButton of document.querySelectorAll(".faction-filter-button")) {
        filterButton.addEventListener("click", function () {
          for (const otherButton of document.querySelectorAll(".faction-filter-button")) {
            otherButton.classList.remove("selected");
          }
          filterButton.classList.add("selected");
          renderInvestigatorOptions();
        });
      }
      document.getElementById("custom-campaign-checkbox").addEventListener("change", function (event) {
        const isCustom = event.target.checked;
        document.getElementById("campaignName").classList.toggle("hidden", isCustom);
        document.getElementById("customCampaignName").classList.toggle("hidden", !isCustom);
        if (isCustom) {
          document.getElementById("campaignName").removeAttribute("required");
          document.getElementById("customCampaignName").setAttribute("required", "required");
          document.getElementById("customCampaignName").focus();
        } else {
          document.getElementById("customCampaignName").removeAttribute("required");
          document.getElementById("campaignName").setAttribute("required", "required");
        }
      });
      renderInvestigatorOptions();
    </script>`;

  return renderLayout("Create campaign", content);
}

import {
  CampaignDefinition,
  InvestigatorDefinition,
} from "../../application/ports/arkham-catalog";
import { escapeHtml, renderLayout } from "./layout";

const FACTION_ICONS: Record<string, string> = {
  guardian: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 2.5 L27.5 6.8 V15 C27.5 21.8 22.6 26.9 16 29.5 C9.4 26.9 4.5 21.8 4.5 15 V6.8 Z" fill="#2c5d8c" stroke="#12293f" stroke-width="1.4"/><path d="M16 6.5 L23.2 9.2 V14.8 C23.2 19.3 20.2 23.1 16 25.2 C11.8 23.1 8.8 19.3 8.8 14.8 V9.2 Z" fill="#7fa8c9"/><path d="M16 10 V21 M12 13.5 H20" stroke="#12293f" stroke-width="1.6" stroke-linecap="round"/></svg>',
  seeker: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="13.5" cy="13" r="6.5" fill="none" stroke="#c4792b" stroke-width="2.6"/><path d="M18.4 17.9 L25.5 25" stroke="#c4792b" stroke-width="3.4" stroke-linecap="round"/><circle cx="13.5" cy="13" r="2.2" fill="#c4792b"/></svg>',
  rogue: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M15.5 3.5 L18.5 13.5 L26 21 L22.5 24.5 L15 17 L5.5 27.5 L3.5 25.5 L14 16 L7 10.5 L10.5 7 Z" fill="#4d7d4a" stroke="#263f25" stroke-width="1.3"/></svg>',
  mystic: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 2.5 L19 11.5 L28.5 9.5 L21.5 16 L28.5 22.5 L19 20.5 L16 29.5 L13 20.5 L3.5 22.5 L10.5 16 L3.5 9.5 L13 11.5 Z" fill="none" stroke="#6f5ba1" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16" cy="16" r="4.5" fill="#6f5ba1"/></svg>',
  survivor: '<svg class="class-icon" viewBox="0 0 32 32"><path d="M16 3.5 L28.5 13.5 H24 V28.5 H8 V13.5 H3.5 Z" fill="#a63d22" stroke="#4f1d0e" stroke-width="1.4"/><path d="M8 13.5 H24 M8 20 H24 M16 3.5 V28.5" stroke="#4f1d0e" stroke-width="1.1"/></svg>',
  neutral: '<svg class="class-icon" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10.5" fill="none" stroke="#6e675c" stroke-width="2.6"/></svg>',
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

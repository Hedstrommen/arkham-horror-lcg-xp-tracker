import {
  CampaignDefinition,
  InvestigatorDefinition,
} from "../../application/ports/arkham-catalog";
import { escapeHtml, renderLayout } from "./layout";

const FACTION_SYMBOLS: Record<string, string> = {
  guardian: "🛡",
  seeker: "🔍",
  rogue: "🗡",
  mystic: "🔮",
  survivor: "🪓",
  neutral: "◯",
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
        <label for="campaignName">Campaign</label>
        <select id="campaignName" name="campaignName" required>${campaignOptions}</select>
        <button type="button" class="arkham-button subtle" id="add-custom-campaign-button">Add custom campaign</button>
      </div>
      <div class="form-field hidden" id="custom-campaign-field">
        <label for="customCampaignName">Custom campaign name</label>
        <input type="text" id="customCampaignName" name="campaignName" maxlength="120" placeholder="Write your own campaign name">
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
          <button type="button" class="faction-filter-button" data-faction="guardian">🛡 guardian</button>
          <button type="button" class="faction-filter-button" data-faction="seeker">🔍 seeker</button>
          <button type="button" class="faction-filter-button" data-faction="rogue">🗡 rogue</button>
          <button type="button" class="faction-filter-button" data-faction="mystic">🔮 mystic</button>
          <button type="button" class="faction-filter-button" data-faction="survivor">🪓 survivor</button>
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
            const symbol = ${JSON.stringify(FACTION_SYMBOLS)}[investigator.factionName] || "";
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
      document.getElementById("add-custom-campaign-button").addEventListener("click", function () {
        document.getElementById("campaignName").classList.add("hidden");
        document.getElementById("custom-campaign-field").classList.remove("hidden");
        document.getElementById("add-custom-campaign-button").classList.add("hidden");
        document.getElementById("campaignName").removeAttribute("required");
        document.getElementById("customCampaignName").setAttribute("required", "required");
      });
      renderInvestigatorOptions();
    </script>`;

  return renderLayout("Create campaign", content);
}

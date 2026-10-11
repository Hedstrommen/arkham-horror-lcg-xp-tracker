import {
  CampaignDefinition,
  InvestigatorDefinition,
} from "../../application/ports/arkham-catalog";
import { escapeHtml, renderLayout } from "./layout";

const FACTION_ICON_URLS: Record<string, string> = {
  guardian: "/styles/factions/guardian.png",
  seeker: "/styles/factions/seeker.png",
  rogue: "/styles/factions/rogue.png",
  mystic: "/styles/factions/mystic.png",
  survivor: "/styles/factions/survivor.png",
};

export function renderCreateCampaignPage(
  campaigns: CampaignDefinition[],
  investigators: InvestigatorDefinition[],
  errorMessage: string | null,
  previouslyEnteredTitle: string
): string {
  const errorBlock = errorMessage
    ? `<div class="error-message">${escapeHtml(errorMessage)}</div>`
    : "";

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    ${errorBlock}
    <form class="form-card" method="post" action="/campaigns">
      <h2>Create a new campaign</h2>
      <div class="form-field chapter-select">
        <span class="chapter-label">Campaign chapter:</span>
        <label class="chapter-checkbox"><input type="checkbox" id="campaign-chapter-1-checkbox" checked> Chapter 1</label>
        <label class="chapter-checkbox"><input type="checkbox" id="campaign-chapter-2-checkbox"> Chapter 2</label>
      </div>
      <div class="form-field">
        <label for="campaignTitle">Title (optional)</label>
        <input type="text" id="campaignTitle" name="title" maxlength="120" placeholder="Leave empty to use the campaign name">
      </div>
      <div class="form-field">
        <label for="campaignName">Campaign
          <span class="custom-campaign-toggle">
            <input type="checkbox" id="custom-campaign-checkbox">
            <label for="custom-campaign-checkbox" class="custom-campaign-label">Custom</label>
          </span>
        </label>
        <select id="campaignName" name="campaignName" required></select>
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
        <div class="chapter-select">
          <span class="chapter-label">Investigator chapter:</span>
          <label class="chapter-checkbox"><input type="checkbox" id="investigator-chapter-1-checkbox" checked> Chapter 1</label>
          <label class="chapter-checkbox"><input type="checkbox" id="investigator-chapter-2-checkbox"> Chapter 2</label>
        </div>
        <input type="text" id="investigator-search" placeholder="Search by name..." autocomplete="off">
        <div class="faction-filter" id="faction-filter">
          <button type="button" class="faction-filter-button selected" data-faction="all">All</button>
          <button type="button" class="faction-filter-button" data-faction="guardian"><img class="class-icon" src="/styles/factions/guardian.png" alt="guardian"> guardian</button>
          <button type="button" class="faction-filter-button" data-faction="seeker"><img class="class-icon" src="/styles/factions/seeker.png" alt="seeker"> seeker</button>
          <button type="button" class="faction-filter-button" data-faction="rogue"><img class="class-icon" src="/styles/factions/rogue.png" alt="rogue"> rogue</button>
          <button type="button" class="faction-filter-button" data-faction="mystic"><img class="class-icon" src="/styles/factions/mystic.png" alt="mystic"> mystic</button>
          <button type="button" class="faction-filter-button" data-faction="survivor"><img class="class-icon" src="/styles/factions/survivor.png" alt="survivor"> survivor</button>
        </div>
        <select id="investigatorId" name="investigatorId" required size="6"></select>
      </div>
      <input type="hidden" id="chapter" name="chapter" value="1">
      <div class="actions">
        <button class="arkham-button" type="submit">Start campaign</button>
      </div>
    </form>
    <script>
      const ALL_CAMPAIGNS = ${JSON.stringify(campaigns)};
      const ALL_INVESTIGATORS = ${JSON.stringify(investigators)};

      function checkedChapters(prefix) {
        const chapters = [1, 2].filter(function (chapter) {
          return document.getElementById(prefix + "-chapter-" + chapter + "-checkbox").checked;
        });
        return chapters.length > 0 ? chapters : [1];
      }

      function renderCampaignOptions() {
        const campaignSelect = document.getElementById("campaignName");
        campaignSelect.innerHTML = ALL_CAMPAIGNS
          .filter(function (campaign) { return checkedChapters("campaign").includes(campaign.chapter); })
          .map(function (campaign) {
            return '<option value="' + campaign.campaignName + '">' + campaign.campaignName + "</option>";
          })
          .join("");
        document.getElementById("chapter").value = checkedChapters("campaign").includes(1) ? "1" : "2";
      }

      document.getElementById("campaign-chapter-1-checkbox").addEventListener("change", renderCampaignOptions);
      document.getElementById("campaign-chapter-2-checkbox").addEventListener("change", renderCampaignOptions);
      document.getElementById("investigator-chapter-1-checkbox").addEventListener("change", renderInvestigatorOptions);
      document.getElementById("investigator-chapter-2-checkbox").addEventListener("change", renderInvestigatorOptions);

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
          const matchesChapter = checkedChapters("investigator").includes(investigator.chapter);
          return matchesSearch && matchesFaction && matchesChapter;
        });
        investigatorSelect.innerHTML = matchingInvestigators
          .map(function (investigator) {
            const symbol = "";
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
      renderCampaignOptions();
      renderInvestigatorOptions();
    </script>`;

  return renderLayout("Create campaign", content);
}

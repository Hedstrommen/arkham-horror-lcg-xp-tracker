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
        <label>Friends you play with, one at a time:</label>
        <div class="friend-editor">
          <div class="friend-add-row">
            <input type="text" id="friend-add-name" maxlength="120" placeholder="Friend's name">
            <select id="friend-add-investigator">
              <option value="" selected>No investigator</option>
            </select>
            <button type="button" class="arkham-button subtle" id="add-friend-button">Add friend</button>
          </div>
          <div class="friend-list" id="friend-edit-list"></div>
        </div>
        <p class="form-hint">Optional. Pick which investigator each friend plays, or leave it unset.</p>
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
      const ALL_INVESTIGATORS = ${JSON.stringify(investigators)}
        .sort(function (first, second) {
          return first.investigatorName.localeCompare(second.investigatorName);
        });
      const friendEntries = [];

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
        }).sort(function (first, second) {
          return first.investigatorName.localeCompare(second.investigatorName);
        });
        investigatorSelect.innerHTML = matchingInvestigators
          .map(function (investigator) {
            return '<option value="' + investigator.investigatorId + '">' + investigator.investigatorName + " (" + investigator.factionName + ")" + "</option>";
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

      const friendAddInvestigatorSelect = document.getElementById("friend-add-investigator");
      friendAddInvestigatorSelect.innerHTML = '<option value="" selected>No investigator</option>' + ALL_INVESTIGATORS
        .map(function (investigator) {
          return '<option value="' + investigator.investigatorId + '">' + investigator.investigatorName + " (" + investigator.factionName + ")" + "</option>";
        })
        .join("");

      function renderFriendRows() {
        const listElement = document.getElementById("friend-edit-list");
        listElement.innerHTML = friendEntries.length === 0
          ? '<p class="form-hint">No friends added yet.</p>'
          : friendEntries.map(function (friend, index) {
              return '<div class="friend-edit-row" data-friend-index="' + index + '">'
                + '<input type="text" class="friend-name-input" maxlength="120" value="' + friend.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + '" placeholder="Friend\'s name">'
                + '<select class="friend-investigator-select"><option value="">No investigator</option>'
                + ALL_INVESTIGATORS.map(function (investigator) {
                    return '<option value="' + investigator.investigatorId + '"' + (friend.investigatorId === investigator.investigatorId ? " selected" : "") + '>'
                      + investigator.investigatorName + " (" + investigator.factionName + ")</option>";
                  }).join("")
                + '</select>'
                + '<button type="button" class="arkham-button subtle friend-remove-button">Remove</button>'
                + "</div>";
            }).join("");
        for (const rowElement of listElement.querySelectorAll(".friend-edit-row")) {
          const index = Number(rowElement.dataset.friendIndex);
          rowElement.querySelector(".friend-remove-button").addEventListener("click", function () {
            friendEntries.splice(index, 1);
            renderFriendRows();
          });
        }
      }

      function addFriend() {
        const nameInput = document.getElementById("friend-add-name");
        const investigatorSelect = document.getElementById("friend-add-investigator");
        const name = nameInput.value.trim();
        if (name.length === 0) {
          alert("Write your friend's name first.");
          return;
        }
        if (friendEntries.some(function (friend) { return friend.name === name; })) {
          alert("A friend with that name has already been added.");
          return;
        }
        const investigatorId = investigatorSelect.value;
        const investigator = investigatorId === "" ? null : ALL_INVESTIGATORS.find(function (candidate) {
          return candidate.investigatorId === investigatorId;
        });
        friendEntries.push({
          name: name,
          investigatorId: investigator === null || investigator === undefined ? null : investigator.investigatorId,
          investigatorName: investigator === null || investigator === undefined ? null : investigator.investigatorName,
          investigatorFaction: investigator === null || investigator === undefined ? null : investigator.factionName
        });
        nameInput.value = "";
        investigatorSelect.value = "";
        nameInput.focus();
        renderFriendRows();
      }

      document.getElementById("add-friend-button").addEventListener("click", addFriend);
      document.getElementById("friend-add-name").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          addFriend();
        }
      });

      const campaignForm = document.querySelector("form[action='/campaigns']");
      campaignForm.addEventListener("submit", function () {
        const existing = campaignForm.querySelectorAll("input.friend-entry-name, select.friend-entry-investigator");
        for (const input of existing) {
          input.remove();
        }
        const listElement = document.getElementById("friend-edit-list");
        const rows = listElement.querySelectorAll(".friend-edit-row");
        rows.forEach(function (rowElement) {
          const nameInput = document.createElement("input");
          nameInput.type = "hidden";
          nameInput.name = "friendNames";
          nameInput.value = rowElement.querySelector(".friend-name-input").value.trim();
          campaignForm.appendChild(nameInput);
          const investigatorInput = document.createElement("input");
          investigatorInput.type = "hidden";
          investigatorInput.name = "friendInvestigators";
          investigatorInput.value = rowElement.querySelector(".friend-investigator-select").value;
          campaignForm.appendChild(investigatorInput);
        });
      });

      renderFriendRows();
      renderCampaignOptions();
      renderInvestigatorOptions();
    </script>`;

  return renderLayout("Create campaign", content);
}

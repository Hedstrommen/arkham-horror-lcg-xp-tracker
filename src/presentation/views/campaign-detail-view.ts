import { Campaign } from "../../domain/campaign/campaign";
import { escapeHtml, renderLayout } from "./layout";
import { renderFactionIcon } from "./faction-icon";
import { Friend } from "../../domain/value-objects/friend";
import { InvestigatorDefinition } from "../../application/ports/arkham-catalog";

const CAMPAIGN_SIGIL_URLS: Record<string, string> = {
  "Night of the Zealot": "/styles/campaign-sigils/night-of-the-zealot.svg",
  "The Dunwich Legacy": "/styles/campaign-sigils/the-dunwich-legacy.svg",
  "The Path to Carcosa": "/styles/campaign-sigils/the-path-to-carcosa.svg",
  "The Forgotten Age": "/styles/campaign-sigils/the-forgotten-age.svg",
  "The Circle Undone": "/styles/campaign-sigils/the-circle-undone.svg",
  "The Dream Eaters": "/styles/campaign-sigils/the-dream-eaters.svg",
  "The Innsmouth Conspiracy": "/styles/campaign-sigils/the-innsmouth-conspiracy.svg",
  "Edge of the Earth": "/styles/campaign-sigils/edge-of-the-earth.svg",
  "The Scarlet Keys": "/styles/campaign-sigils/the-scarlet-keys.svg",
  "The Feast of Hemlock Vale": "/styles/campaign-sigils/the-feast-of-hemlock-vale.svg",
  "The Drowned City": "/styles/campaign-sigils/the-drowned-city.svg",
  "Brethren of Ash": "/styles/campaign-sigils/brethren-of-ash.svg",
  "Children of Blood": "/styles/campaign-sigils/children-of-blood.svg",
};

function renderCampaignSigil(campaignName: string): string {
  const sigilUrl = CAMPAIGN_SIGIL_URLS[campaignName];
  if (sigilUrl === undefined) {
    return "";
  }
  return `<img class="campaign-sigil" src="${sigilUrl}" alt="${escapeHtml(campaignName)}" title="${escapeHtml(campaignName)}">`;
}

function renderFriendLine(campaign: Campaign, friend: Friend): string {
  const totalXp = campaign.getFriendTotalExperience(friend.name);
  const faction = friend.investigatorFaction ?? "neutral";
  const investigator = friend.investigatorName === null
    ? '<span class="friend-no-investigator">no investigator</span>'
    : `<span class="investigator-name ${escapeHtml(faction)}">${escapeHtml(friend.investigatorName)}</span> ${renderFactionIcon(faction as never)}`;
  return `<div class="detail-friend-entry">
    <span class="friend-name">${escapeHtml(friend.name)}</span>
    <span class="friend-investigator">${investigator}</span>
    <span class="friend-total-xp">${totalXp} XP</span>
  </div>`;
}

export function renderCampaignDetailPage(
  campaign: Campaign,
  investigators: InvestigatorDefinition[],
  editMode = false
): string {
  const experienceLogItems = campaign
    .getExperienceLog()
    .map(
      (entry) => `
      <li class="experience-entry">
        <details>
          <summary>
            <span class="entry-kind">${escapeHtml(entry.experienceType.getDisplayName())} &mdash; ${escapeHtml(entry.experienceTitle)}: +${entry.experiencePoints.getAmount()} XP</span>
            ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
          </summary>
          <form class="edit-entry-form" method="post" action="/campaigns/${escapeHtml(campaign.id)}/experience/${escapeHtml(entry.id)}">
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-kind">Experience type</label>
              <select id="edit-${escapeHtml(entry.id)}-kind" name="experienceKind" required>
                <option value="scenario" ${entry.experienceType.getKind() === "scenario" ? "selected" : ""}>Scenario</option>
                <option value="interlude" ${entry.experienceType.getKind() === "interlude" ? "selected" : ""}>Interlude</option>
                <option value="weakness" ${entry.experienceType.getKind() === "weakness" ? "selected" : ""}>Weakness</option>
                <option value="permanent" ${entry.experienceType.getKind() === "permanent" ? "selected" : ""}>Permanent</option>
              </select>
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-title">Title</label>
              <input type="text" id="edit-${escapeHtml(entry.id)}-title" name="experienceTitle" maxlength="120" required value="${escapeHtml(entry.experienceTitle)}">
            </div>
            <div class="form-field">
              <label for="edit-${escapeHtml(entry.id)}-amount">Your experience (${escapeHtml(campaign.investigatorName)})</label>
              <input type="number" id="edit-${escapeHtml(entry.id)}-amount" name="experienceAmount" min="0" step="1" required value="${entry.experiencePoints.getAmount()}">
            </div>
            ${friendAmountFields(campaign, entry)}
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

  const breakdownParts = Object.entries(campaign.getExperienceBreakdownByKind())
    .map(([kind, amount]) => `${kind.charAt(0).toUpperCase() + kind.slice(1)}: ${amount}`)
    .join(" &middot; ");
  const breakdownLine = breakdownParts.length > 0
    ? `<span class="experience-breakdown">${breakdownParts}</span>`
    : "";

  const experienceLog = campaign.getExperienceLog().length > 0
    ? `<h2>Experience log</h2>
       <ul class="experience-log">${experienceLogItems}</ul>`
    : "";

  const infoSection = editMode
    ? `
      <form method="post" action="/campaigns/${escapeHtml(campaign.id)}/edit" id="edit-campaign-form">
        <div class="form-field">
          <label for="campaign-detail-title">Title</label>
          <input type="text" id="campaign-detail-title" name="title" maxlength="120" required value="${escapeHtml(campaign.getTitle().toString())}">
        </div>
        <div class="form-field">
          <label>Friends who plays who, one at a time:</label>
          <div class="friend-editor">
            <div class="friend-add-row">
              <input type="text" id="friend-add-name" maxlength="120" placeholder="Friend's name">
              <select id="friend-add-investigator"></select>
              <button type="button" class="arkham-button subtle" id="add-friend-button">Add friend</button>
            </div>
            <div class="friend-list" id="friend-edit-list"></div>
          </div>
        </div>
        <div class="form-field">
          <label for="campaign-detail-notes">Notes</label>
          <textarea id="campaign-detail-notes" name="notes">${campaign.notes ? escapeHtml(campaign.notes) : ""}</textarea>
        </div>
        <div class="actions">
          <button class="arkham-button" type="submit">Save changes</button>
          <a class="arkham-button subtle" href="/campaigns/${escapeHtml(campaign.id)}">Cancel</a>
        </div>
      </form>`
    : `
      <div class="campaign-view-info">
        <h2>${escapeHtml(campaign.getTitle().toString())}</h2>
        <div class="detail-info-row">
          <span class="campaign-name-with-sigil">${escapeHtml(campaign.campaignName)} ${renderCampaignSigil(campaign.campaignName)}</span>
          <span class="investigator-with-icon">
            <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
            ${renderFactionIcon(campaign.investigatorFaction)}
            <span class="chapter-badge">Ch. ${campaign.chapter}</span>
          </span>
        </div>
        ${campaign.friends.length > 0 ? `<div class="detail-friends"><h3 class="detail-friends-heading">Friends</h3>${campaign.friends.map((friend) => renderFriendLine(campaign, friend)).join("")}</div>` : ""}
        ${campaign.notes ? `<p class="detail-notes">${escapeHtml(campaign.notes)}</p>` : ""}
        <p class="detail-total-xp">Total XP: ${campaign.getTotalExperience()} ${breakdownLine}</p>
      </div>
      <div class="actions detail-actions">
        <a class="arkham-button subtle" href="/campaigns/${escapeHtml(campaign.id)}?edit=1">Edit</a>
        ${campaign.getIsActive()
          ? `<a class="arkham-button" href="/campaigns/${escapeHtml(campaign.id)}/gain-experience">Add experience</a>`
          : ""}
        <form method="post" action="/campaigns/${escapeHtml(campaign.id)}/delete" class="inline-form">
          <button class="arkham-button danger" type="submit">Delete campaign</button>
        </form>
      </div>`;

  const content = `
    <a class="back-link" href="/">&larr; Back to campaigns</a>
    <div class="form-card campaign-detail-card">
      ${infoSection}
    </div>
    ${experienceLog}
    ${editMode ? friendEditorScript(campaign.friends, investigators) : ""}`;

  return renderLayout("Campaign", content);
}

function friendAmountFields(campaign: Campaign, entry: { friendAmounts: Record<string, number> }): string {
  return campaign.friends
    .map(
      (friend, index) => `
            <div class="form-field friend-amount-field">
              <label for="edit-friend-amount-${index}">${escapeHtml(friend.name)}${friend.investigatorName ? ` <span class="friend-investigator-hint">(${escapeHtml(friend.investigatorName)})</span>` : ""} &mdash; experience (optional)</label>
              <input type="number" id="edit-friend-amount-${index}" name="friendAmounts" min="0" step="1" value="${entry.friendAmounts[friend.name] ?? ""}">
              <input type="hidden" name="friendNames" value="${escapeHtml(friend.name)}">
            </div>`
    )
    .join("");
}

function friendEditorScript(friends: Friend[], investigators: InvestigatorDefinition[]): string {
  return `
    <script>
      const friendEntries = ${JSON.stringify(friends)};
      const ALL_INVESTIGATORS = ${JSON.stringify(investigators)};
      const friendAddSelect = document.getElementById("friend-add-investigator");
      friendAddSelect.innerHTML = '<option value="" selected>No investigator</option>' + ALL_INVESTIGATORS
        .map(function (investigator) {
          return '<option value="' + investigator.investigatorId + '">' + investigator.investigatorName + " (" + investigator.factionName + ")</option>";
        })
        .join("");

      function renderFriendRows() {
        const listElement = document.getElementById("friend-edit-list");
        listElement.innerHTML = friendEntries.length === 0
          ? '<p class="form-hint">No friends added yet.</p>'
          : friendEntries.map(function (friend, index) {
              return '<div class="friend-edit-row" data-friend-index="' + index + '">'
                + '<input type="text" class="friend-name-input" maxlength="120" value="' + friend.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + '" placeholder="Friend&#39;s name">'
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

      const editForm = document.getElementById("edit-campaign-form");
      editForm.addEventListener("submit", function () {
        for (const input of editForm.querySelectorAll("input.appended-friend-field")) {
          input.remove();
        }
        const listElement = document.getElementById("friend-edit-list");
        const rows = listElement.querySelectorAll(".friend-edit-row");
        rows.forEach(function (rowElement) {
          const nameInput = document.createElement("input");
          nameInput.type = "hidden";
          nameInput.className = "appended-friend-field";
          nameInput.name = "friendNames";
          nameInput.value = rowElement.querySelector(".friend-name-input").value.trim();
          editForm.appendChild(nameInput);
          const investigatorInput = document.createElement("input");
          investigatorInput.type = "hidden";
          investigatorInput.className = "appended-friend-field";
          investigatorInput.name = "friendInvestigators";
          investigatorInput.value = rowElement.querySelector(".friend-investigator-select").value;
          editForm.appendChild(investigatorInput);
        });
      });

      renderFriendRows();
    </script>`;
}

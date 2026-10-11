const STORAGE_KEY = "arkham-xp-tracker.campaigns";
const EXPORT_FILE_NAME = "arkham-xp-tracker-data.json";


let campaigns = [];
let arkhamCatalog = { campaigns: [], investigators: [] };
let selectedCampaignId = null;
let selectedInvestigatorId = null;
let gainPageReturnTarget = "overview";

let selectedCampaignChapters = [1];
let selectedInvestigatorChapters = [1];

function checkedChapters(prefix) {
  const chapters = [1, 2].filter(
    (chapter) => document.getElementById(`${prefix}-chapter-${chapter}-checkbox`).checked
  );
  return chapters.length > 0 ? chapters : [1];
}

function refreshCampaignChapterSelection() {
  selectedCampaignChapters = checkedChapters("campaign");
  renderCampaignOptions();
}

function refreshInvestigatorChapterSelection() {
  selectedInvestigatorChapters = checkedChapters("investigator");
  renderInvestigatorOptions();
}

function renderCampaignOptions() {
  const campaignSelect = document.getElementById("campaignName");
  const matchingCampaigns = arkhamCatalog.campaigns.filter(
    (campaign) => selectedCampaignChapters.includes(campaign.chapter ?? 1)
  );
  campaignSelect.innerHTML = matchingCampaigns
    .map((campaign) => `<option value="${escapeHtml(campaign.campaignName)}">${escapeHtml(campaign.campaignName)}</option>`)
    .join("");
}


document.addEventListener("DOMContentLoaded", startApp);

async function startApp() {
  campaigns = loadCampaigns();
  arkhamCatalog = await loadArkhamCatalog();
  showOverview();
}

async function loadArkhamCatalog() {
  const campaignResponse = await fetch("data/campaign-snapshot.json");
  const investigatorResponse = await fetch("data/investigator-snapshot.json");
  return {
    campaigns: await campaignResponse.json(),
    investigators: await investigatorResponse.json(),
  };
}

function loadCampaigns() {
  const storedJson = localStorage.getItem(STORAGE_KEY);
  return storedJson === null ? [] : JSON.parse(storedJson);
}

function persistCampaigns() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showOverview() {
  selectedCampaignId = null;
  const appElement = document.getElementById("app");
  const sortedCampaigns = [...campaigns].sort((first, second) => {
    if (first.isActive !== second.isActive) {
      return first.isActive ? -1 : 1;
    }
    return second.createdAt.localeCompare(first.createdAt);
  });

  const campaignCards = sortedCampaigns.map(renderCampaignCard).join("");
  const content = `
    <div class="toolbar">
      <a class="arkham-button" href="#" id="create-campaign-link">Create new campaign</a>
      <span class="utility-group">
        <button class="arkham-button subtle" id="export-data-button">Export</button>
        <label class="arkham-button subtle import-label">Import
          <input type="file" id="import-data-input" accept=".json,application/json" hidden>
        </label>
      </span>
    </div>
    ${
      campaigns.length > 0
        ? `<ul class="campaign-list">${campaignCards}</ul>`
        : '<p class="empty-state">No campaigns yet. The mythos awaits — start one!</p>'
    }`;
  appElement.innerHTML = content;

  document.getElementById("create-campaign-link").addEventListener("click", (event) => {
    event.preventDefault();
    showCreateCampaign();
  });
  document.getElementById("export-data-button").addEventListener("click", exportData);
  document.getElementById("import-data-input").addEventListener("change", importData);
  for (const campaign of campaigns) {
    bindCampaignCardEvents(campaign);
  }
}

function renderCampaignCard(campaign) {

  return `
    <li class="campaign-card ${campaign.isActive ? "" : "inactive"}" data-campaign-id="${escapeHtml(campaign.id)}">
      <div class="title-row">
        <h2>${escapeHtml(campaign.title)}</h2>
        <span class="status-badge ${campaign.isActive ? "active" : ""}">
          ${campaign.isActive ? "Active" : "Finished"}
        </span>
      </div>
      <div class="details-row">
        <span>${escapeHtml(campaign.campaignName)} <span class="chapter-badge">Ch. ${campaign.chapter ?? 1}</span></span>
        <span class="investigator-with-icon">
          <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
          ${renderClassIcon(campaign.investigatorFaction)}
          <span class="chapter-badge">Ch. ${campaign.chapter ?? 1}</span>
        </span>
        <span class="experience-total total-xp-cell">Total xp: ${getTotalExperience(campaign)}</span>
      </div>
      ${campaign.notes ? `<p class="campaign-notes">${escapeHtml(campaign.notes)}</p>` : ""}
      <div class="actions">
        ${campaign.isActive
          ? `<button class="arkham-button gain-experience-button">Gain XP</button>`
          : ""}
        <button class="arkham-button subtle status-toggle-button">
          ${campaign.isActive ? "Mark finished" : "Reactivate"}
        </button>
      </div>
    </li>`;
}

function bindCampaignCardEvents(campaign) {
  const cardElement = document.querySelector(
    `.campaign-card[data-campaign-id="${CSS.escape(campaign.id)}"]`
  );
  if (cardElement === null) {
    return;
  }
  cardElement.addEventListener("click", () => {
    selectedCampaignId = campaign.id;
    showCampaignDetail();
  });
  const gainButton = cardElement.querySelector(".gain-experience-button");
  if (gainButton !== null) {
    gainButton.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedCampaignId = campaign.id;
      gainPageReturnTarget = "overview";
      showGainExperience();
    });
  }
  cardElement.querySelector(".status-toggle-button").addEventListener("click", (event) => {
    event.stopPropagation();
    if (campaign.isActive) {
      markFinished(campaign);
    } else {
      reactivate(campaign);
    }
    persistCampaigns();
    showOverview();
  });
}



function renderExperienceBreakdown(campaign) {
  const breakdown = getExperienceBreakdown(campaign);
  const parts = Object.entries(breakdown)
    .map(([kind, amount]) => `${EXPERIENCE_DISPLAY_NAMES(kind)} xp: ${amount}`);
  if (parts.length === 0) {
    return "";
  }
  return `<span class="experience-breakdown">${parts.join(" &middot; ")}</span>`;
}

function showCampaignDetail() {
  const campaign = campaigns.find((candidate) => candidate.id === selectedCampaignId);
  if (campaign === undefined) {
    showOverview();
    return;
  }
  const appElement = document.getElementById("app");
  const logItems = campaign.experienceLog
    .map(
      (entry) => `
      <li class="experience-entry" data-entry-id="${escapeHtml(entry.id)}">
        <span class="entry-kind">${EXPERIENCE_DISPLAY_NAMES(entry.experienceKind)} &mdash; ${escapeHtml(entry.experienceTitle)}: +${entry.experienceAmount} XP</span>
        ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
      </li>`
    )
    .join("");

  appElement.innerHTML = `
    <a class="back-link" href="#" id="back-to-overview-link">&larr; Back to campaigns</a>
    <div class="form-card campaign-detail-card">
      <form id="edit-campaign-form">
        <div class="form-field">
          <label for="campaign-detail-title">Title</label>
          <input type="text" id="campaign-detail-title" maxlength="120" required value="${escapeHtml(campaign.title)}">
        </div>
        <div class="detail-info-row">
          <span>${escapeHtml(campaign.campaignName)} <span class="chapter-badge">Ch. ${campaign.chapter ?? 1}</span></span>
          <span class="investigator-with-icon">
            <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
            ${renderClassIcon(campaign.investigatorFaction)}
            <span class="chapter-badge">Ch. ${campaign.chapter ?? 1}</span>
          </span>
        </div>
        <div class="form-field">
          <label for="campaign-detail-friends">Friends</label>
          <input type="text" id="campaign-detail-friends" value="${escapeHtml(campaign.friends.join(", "))}">
        </div>
        <div class="form-field">
          <label for="campaign-detail-notes">Notes</label>
          <textarea id="campaign-detail-notes">${campaign.notes ? escapeHtml(campaign.notes) : ""}</textarea>
        </div>
        <div class="actions">
          <button class="arkham-button" type="submit">Save changes</button>
          ${campaign.isActive ? `<a class="arkham-button" href="#" id="detail-add-experience-button">Add experience</a>` : ""}
        </div>
      </form>
    </div>
    ${campaign.experienceLog.length > 0 ? `<h2>Experience log</h2><p class="experience-total experience-log-total">Total: ${getTotalExperience(campaign)} XP ${renderExperienceBreakdown(campaign)}</p><ul class="experience-log">${logItems}</ul>` : ""}`;

  document.getElementById("back-to-overview-link").addEventListener("click", (event) => {
    event.preventDefault();
    showOverview();
  });
  document.getElementById("edit-campaign-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleEditCampaign(campaign);
  });
  const addExperienceButton = document.getElementById("detail-add-experience-button");
  if (addExperienceButton !== null) {
    addExperienceButton.addEventListener("click", (event) => {
      event.preventDefault();
      gainPageReturnTarget = "detail";
      showGainExperience();
    });
  }
  bindExperienceEntryEditing(campaign);
}

function handleEditCampaign(campaign) {
  const title = document.getElementById("campaign-detail-title").value;
  const friendsInput = document.getElementById("campaign-detail-friends").value;
  const notes = document.getElementById("campaign-detail-notes").value;

  try {
    campaign.title = parseCampaignTitle(title);
    campaign.friends = friendsInput
      .split(",")
      .map((friend) => friend.trim())
      .filter((friend) => friend.length > 0);
    const trimmedNotes = notes.trim();
    campaign.notes = trimmedNotes.length > 0 ? trimmedNotes : null;
    persistCampaigns();
    showCampaignDetail();
  } catch (error) {
    alert(error.message);
  }
}

function showCreateCampaign() {
  const appElement = document.getElementById("app");

  appElement.innerHTML = `
    <a class="back-link" href="#" id="back-to-overview-link">&larr; Back to campaigns</a>
    <form class="form-card" id="create-campaign-form">
      <h2>Create a new campaign</h2>
      <div class="form-field chapter-select">
        <span class="chapter-label">Campaign chapter:</span>
        <label class="chapter-checkbox"><input type="checkbox" id="campaign-chapter-1-checkbox" checked> Chapter 1</label>
        <label class="chapter-checkbox"><input type="checkbox" id="campaign-chapter-2-checkbox"> Chapter 2</label>
      </div>
      <div class="form-field">
        <label for="campaignTitle">Title (optional)</label>
        <input type="text" id="campaignTitle" maxlength="120" placeholder="Leave empty to use the campaign name">
      </div>
      <div class="form-field">
        <label for="campaignName">Campaign
          <span class="custom-campaign-toggle">
            <input type="checkbox" id="custom-campaign-checkbox">
            <label for="custom-campaign-checkbox" class="custom-campaign-label">Custom</label>
          </span>
        </label>
        <select id="campaignName" required></select>
        <input type="text" id="customCampaignName" class="hidden" maxlength="120" placeholder="Write your own campaign name">
      </div>
      <div class="form-field hidden" id="custom-campaign-field">
        <label for="customCampaignName">Custom campaign name</label>
        <input type="text" id="customCampaignName" maxlength="120" placeholder="Write your own campaign name">
      </div>
      <div class="form-field">
        <label for="friends">Friends you play with</label>
        <input type="text" id="friends" placeholder="e.g. Sven, Lisa, Jon">
        <p class="form-hint">Separate multiple names with commas. Optional.</p>
      </div>
      <div class="form-field">
        <label for="notes">Notes</label>
        <textarea id="notes" placeholder="Optional notes about the campaign"></textarea>
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
          ${["all", "guardian", "seeker", "rogue", "mystic", "survivor"]
            .map((faction) => `<button type="button" class="faction-filter-button ${faction === "all" ? "selected" : ""}" data-faction="${faction}">${faction === "all" ? "All" : renderClassIcon(faction) + " " + faction}</button>`)
            .join("")}
        </div>
        <div class="investigator-pick-list" id="investigator-pick-list" role="listbox"></div>
        <input type="hidden" id="investigatorId" name="investigatorId">
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Start campaign</button>
      </div>
    </form>`;

  document.getElementById("back-to-overview-link").addEventListener("click", (event) => {
    event.preventDefault();
    showOverview();
  });
  document.getElementById("create-campaign-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleCreateCampaign();
  });
  document.getElementById("custom-campaign-checkbox").addEventListener("change", (event) => {
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

  const searchInputElement = document.getElementById("investigator-search");
  searchInputElement.addEventListener("input", () => renderInvestigatorOptions());
  for (const filterButton of document.querySelectorAll(".faction-filter-button")) {
    filterButton.addEventListener("click", () => {
      for (const otherButton of document.querySelectorAll(".faction-filter-button")) {
        otherButton.classList.remove("selected");
      }
      filterButton.classList.add("selected");
      renderInvestigatorOptions();
    });
  }
  selectedInvestigatorId = null;
  selectedCampaignChapters = checkedChapters("campaign");
  selectedInvestigatorChapters = checkedChapters("investigator");
  document.getElementById("campaign-chapter-1-checkbox").addEventListener("change", refreshCampaignChapterSelection);
  document.getElementById("campaign-chapter-2-checkbox").addEventListener("change", refreshCampaignChapterSelection);
  document.getElementById("investigator-chapter-1-checkbox").addEventListener("change", refreshInvestigatorChapterSelection);
  document.getElementById("investigator-chapter-2-checkbox").addEventListener("change", refreshInvestigatorChapterSelection);
  renderCampaignOptions();
  renderInvestigatorOptions();
}

function renderInvestigatorOptions() {
  const searchString = document.getElementById("investigator-search").value.trim().toLowerCase();
  const selectedFaction = document.querySelector(".faction-filter-button.selected")?.dataset.faction ?? "all";
  const pickListElement = document.getElementById("investigator-pick-list");
  const matchingInvestigators = arkhamCatalog.investigators.filter((investigator) => {
    const matchesSearch = searchString.length === 0
      || investigator.investigatorName.toLowerCase().includes(searchString);
    const matchesFaction = selectedFaction === "all" || investigator.factionName === selectedFaction;
    const matchesChapter = selectedInvestigatorChapters.includes(investigator.chapter ?? 1);
    return matchesSearch && matchesFaction && matchesChapter;
  });
  pickListElement.innerHTML = matchingInvestigators
    .map((investigator) => `
      <button type="button"
              class="investigator-pick ${investigator.investigatorId === selectedInvestigatorId ? "selected" : ""}"
              data-investigator-id="${escapeHtml(investigator.investigatorId)}">
        <span class="investigator-name ${escapeHtml(investigator.factionName)}">${escapeHtml(investigator.investigatorName)}</span>
        ${renderClassIcon(investigator.factionName)}
      </button>`)
    .join("");
  for (const pickButton of pickListElement.querySelectorAll(".investigator-pick")) {
    pickButton.addEventListener("click", () => {
      selectedInvestigatorId = pickButton.dataset.investigatorId;
      document.getElementById("investigatorId").value = selectedInvestigatorId;
      for (const otherButton of pickListElement.querySelectorAll(".investigator-pick")) {
        otherButton.classList.remove("selected");
      }
      pickButton.classList.add("selected");
    });
  }
}

function handleCreateCampaign() {
  const isCustomCampaign = document.getElementById("custom-campaign-checkbox").checked;
  const campaignName = isCustomCampaign
    ? document.getElementById("customCampaignName").value
    : document.getElementById("campaignName").value;
  const titleInput = document.getElementById("campaignTitle").value.trim();
  const title = titleInput.length > 0 ? titleInput : campaignName;
  const friendsInput = document.getElementById("friends").value;
  const notes = document.getElementById("notes").value;
  const investigatorId = document.getElementById("investigatorId").value;

  try {
    const friends = friendsInput
      .split(",")
      .map((friend) => friend.trim())
      .filter((friend) => friend.length > 0);
    const investigator = arkhamCatalog.investigators.find(
      (candidate) => candidate.investigatorId === investigatorId
    );
    if (investigator === undefined) {
      throw new Error("Pick an investigator from the list.");
    }
    const campaign = createCampaign(
      `campaign-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      title,
      campaignName,
      friends,
      investigatorId,
      investigator.investigatorName,
      investigator.factionName,
      notes
    );
    campaign.chapter = selectedCampaignChapters.includes(2) && !selectedCampaignChapters.includes(1) ? 2 : (selectedCampaignChapters.includes(1) ? 1 : 2);
    campaigns.push(campaign);
    persistCampaigns();
    showOverview();
  } catch (error) {
    alert(error.message);
  }
}

function showGainExperience() {
  const campaign = campaigns.find((candidate) => candidate.id === selectedCampaignId);
  if (campaign === undefined) {
    showOverview();
    return;
  }
  const appElement = document.getElementById("app");
  const logItems = campaign.experienceLog
    .map(
      (entry) => `
      <li class="experience-entry" data-entry-id="${escapeHtml(entry.id)}">
        <span class="entry-kind">${EXPERIENCE_DISPLAY_NAMES(entry.experienceKind)} &mdash; ${escapeHtml(entry.experienceTitle)}: +${entry.experienceAmount} XP</span>
        ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
      </li>`
    )
    .join("");

  const backLinkLabel = gainPageReturnTarget === "detail"
    ? "&larr; Back to campaign"
    : "&larr; Back to campaigns";

  appElement.innerHTML = `
    <a class="back-link" href="#" id="back-to-overview-link">${backLinkLabel}</a>
    <div class="campaign-context">
      <span>${escapeHtml(campaign.campaignName)} <span class="chapter-badge">Ch. ${campaign.chapter ?? 1}</span></span>
      <span class="investigator-with-icon">
        ${renderClassIcon(campaign.investigatorFaction)}
        <span class="investigator-name ${escapeHtml(campaign.investigatorFaction)}">${escapeHtml(campaign.investigatorName)}</span>
      </span>
      <span class="experience-total">${escapeHtml(campaign.title)} — ${getTotalExperience(campaign)} XP</span>
    </div>
    <form class="form-card" id="gain-experience-form">
      <h2>Gain experience</h2>
      <div class="form-field">
        <label for="experienceKind">Experience type</label>
        <select id="experienceKind" required>
          <option value="scenario">Scenario</option>
          <option value="interlude">Interlude</option>
          <option value="weakness">Weakness</option>
          <option value="permanent">Permanent</option>
        </select>
      </div>
      <div class="form-field">
        <label for="experienceTitle">Title</label>
        <input type="text" id="experienceTitle" maxlength="120" required placeholder='e.g. "Scenario 1", "Interlude scenario 1/2", "Prelude day 1", "In the thick of it"'>
      </div>
      <div class="form-field">
        <label for="experienceAmount">Experience</label>
        <input type="number" id="experienceAmount" min="0" step="1" required>
      </div>
      <div class="form-field">
        <label for="notes">Notes</label>
        <textarea id="notes" placeholder="Optional notes"></textarea>
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Record experience</button>
      </div>
    </form>
    ${campaign.experienceLog.length > 0 ? `<h2>Experience log</h2><p class="experience-total experience-log-total">Total: ${getTotalExperience(campaign)} XP ${renderExperienceBreakdown(campaign)}</p><ul class="experience-log">${logItems}</ul>` : ""}`;

  document.getElementById("back-to-overview-link").addEventListener("click", (event) => {
    event.preventDefault();
    if (gainPageReturnTarget === "detail") {
      showCampaignDetail();
    } else {
      showOverview();
    }
  });
  document.getElementById("gain-experience-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleGainExperience(campaign);
  });
  bindExperienceEntryEditing(campaign);
}

function bindExperienceEntryEditing(campaign) {
  for (const entryElement of document.querySelectorAll(".experience-entry")) {
    entryElement.addEventListener("click", () => {
      const entry = campaign.experienceLog.find(
        (candidate) => candidate.id === entryElement.dataset.entryId
      );
      if (entry !== undefined) {
        showEditExperience(campaign, entry);
      }
    });
  }
}

function showEditExperience(campaign, entry) {
  const appElement = document.getElementById("app");
  appElement.insertAdjacentHTML("beforeend", `
    <div class="edit-entry-overlay" id="edit-entry-overlay">
      <form class="form-card edit-entry-card" id="edit-experience-form">
        <h2>Edit experience</h2>
        <div class="form-field">
          <label for="edit-experienceKind">Experience type</label>
          <select id="edit-experienceKind" required>
            <option value="scenario" ${entry.experienceKind === "scenario" ? "selected" : ""}>Scenario</option>
            <option value="interlude" ${entry.experienceKind === "interlude" ? "selected" : ""}>Interlude</option>
            <option value="weakness" ${entry.experienceKind === "weakness" ? "selected" : ""}>Weakness</option>
            <option value="permanent" ${entry.experienceKind === "permanent" ? "selected" : ""}>Permanent</option>
          </select>
        </div>
        <div class="form-field">
          <label for="edit-experienceTitle">Title</label>
          <input type="text" id="edit-experienceTitle" maxlength="120" required value="${escapeHtml(entry.experienceTitle)}">
        </div>
        <div class="form-field">
          <label for="edit-experienceAmount">Experience</label>
          <input type="number" id="edit-experienceAmount" min="0" step="1" required value="${entry.experienceAmount}">
        </div>
        <div class="form-field">
          <label for="edit-notes">Notes</label>
          <textarea id="edit-notes">${entry.notes ? escapeHtml(entry.notes) : ""}</textarea>
        </div>
        <div class="actions">
          <button class="arkham-button" type="submit">Save changes</button>
          <button class="arkham-button subtle" type="button" id="cancel-edit-button">Cancel</button>
        </div>
      </form>
    </div>`);

  document.getElementById("edit-experience-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleUpdateExperience(campaign, entry);
  });
  document.getElementById("cancel-edit-button").addEventListener("click", () => {
    document.getElementById("edit-entry-overlay").remove();
  });
}

function EXPERIENCE_DISPLAY_NAMES(kind) {
  return {
    scenario: "Scenario",
    interlude: "Interlude",
    weakness: "Weakness",
    permanent: "Permanent",
  }[kind] ?? kind;
}

function handleGainExperience(campaign) {
  const experienceKind = document.getElementById("experienceKind").value;
  const experienceTitle = document.getElementById("experienceTitle").value;
  const experienceAmount = document.getElementById("experienceAmount").value;
  const notes = document.getElementById("notes").value;

  try {
    gainExperience(campaign, experienceKind, experienceTitle, experienceAmount, notes);
    persistCampaigns();
    if (gainPageReturnTarget === "detail") {
      showCampaignDetail();
    } else {
      showOverview();
    }
  } catch (error) {
    alert(error.message);
  }
}

function handleUpdateExperience(campaign, entry) {
  const experienceKind = document.getElementById("edit-experienceKind").value;
  const experienceTitle = document.getElementById("edit-experienceTitle").value;
  const experienceAmount = document.getElementById("edit-experienceAmount").value;
  const notes = document.getElementById("edit-notes").value;

  try {
    updateExperienceEntry(campaign, entry.id, experienceKind, experienceTitle, experienceAmount, notes);
    persistCampaigns();
    if (gainPageReturnTarget === "detail") {
      showCampaignDetail();
    } else {
      showGainExperience();
    }
  } catch (error) {
    alert(error.message);
  }
}

function exportData() {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    campaigns,
  };
  const downloadBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: "application/json",
  });
  const downloadUrl = URL.createObjectURL(downloadBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = EXPORT_FILE_NAME;
  downloadLink.click();
  URL.revokeObjectURL(downloadUrl);
}

function importData(event) {
  const file = event.target.files[0];
  if (file === undefined) {
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = () => {
    try {
      const importedPayload = JSON.parse(String(fileReader.result));
      const importedCampaigns = importedPayload.campaigns;
      if (!Array.isArray(importedCampaigns)) {
        throw new Error("This file does not contain a campaigns list.");
      }
      const confirmReplace = campaigns.length > 0
        ? confirm(
            `Import ${importedCampaigns.length} campaigns? This will REPLACE the ${campaigns.length} campaign(s) currently on this device.`
          )
        : true;
      if (!confirmReplace) {
        return;
      }
      campaigns = importedCampaigns;
      persistCampaigns();
      showOverview();
    } catch (error) {
      alert(`Could not import: ${error.message}`);
    }
  };
  fileReader.readAsText(file);
  event.target.value = "";
}

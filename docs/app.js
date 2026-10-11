const STORAGE_KEY = "arkham-xp-tracker.campaigns";
const EXPORT_FILE_NAME = "arkham-xp-tracker-data.json";
const FACTION_SYMBOLS = {
  guardian: "🛡",
  seeker: "🔍",
  rogue: "🗡",
  mystic: "🔮",
  survivor: "🪓",
  neutral: "◯",
};

let campaigns = [];
let arkhamCatalog = { campaigns: [], investigators: [] };
let selectedCampaignId = null;

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
      <button class="arkham-button subtle" id="export-data-button">Export my data</button>
      <label class="arkham-button subtle import-label">Import data
        <input type="file" id="import-data-input" accept=".json,application/json" hidden>
      </label>
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
  const factionSymbol = FACTION_SYMBOLS[campaign.investigatorFaction] ?? FACTION_SYMBOLS.neutral;
  return `
    <li class="campaign-card ${campaign.isActive ? "" : "inactive"}" data-campaign-id="${escapeHtml(campaign.id)}">
      <div class="title-row">
        <h2><a href="#" class="open-campaign-link">${escapeHtml(campaign.title)}</a></h2>
        <span class="status-badge ${campaign.isActive ? "active" : ""}">
          ${campaign.isActive ? "Active" : "Finished"}
        </span>
      </div>
      <div class="details-row">
        <span>${escapeHtml(campaign.campaignName)}</span>
        <span class="faction-icon ${escapeHtml(campaign.investigatorFaction)}">
          <span class="faction-symbol">${factionSymbol}</span>${escapeHtml(campaign.investigatorFaction)}
        </span>
        <span>${escapeHtml(campaign.investigatorName)}</span>
        <span class="experience-total">${getTotalExperience(campaign)} XP</span>
      </div>
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
  cardElement.querySelector(".open-campaign-link").addEventListener("click", (event) => {
    event.preventDefault();
    selectedCampaignId = campaign.id;
    showGainExperience();
  });
  const gainButton = cardElement.querySelector(".gain-experience-button");
  if (gainButton !== null) {
    gainButton.addEventListener("click", () => {
      selectedCampaignId = campaign.id;
      showGainExperience();
    });
  }
  cardElement.querySelector(".status-toggle-button").addEventListener("click", () => {
    if (campaign.isActive) {
      markFinished(campaign);
    } else {
      reactivate(campaign);
    }
    persistCampaigns();
    showOverview();
  });
}

function showCreateCampaign() {
  const appElement = document.getElementById("app");
  const campaignOptions = arkhamCatalog.campaigns
    .map((campaign) => `<option value="${escapeHtml(campaign.campaignName)}">${escapeHtml(campaign.campaignName)}</option>`)
    .join("");
  const investigatorOptions = arkhamCatalog.investigators
    .map((investigator) =>
      `<option value="${escapeHtml(investigator.investigatorId)}">
        ${escapeHtml(investigator.investigatorName)} (${escapeHtml(investigator.factionName)})
      </option>`)
    .join("");

  appElement.innerHTML = `
    <a class="back-link" href="#" id="back-to-overview-link">&larr; Back to campaigns</a>
    <form class="form-card" id="create-campaign-form">
      <h2>Create a new campaign</h2>
      <div class="form-field">
        <label for="title">Title</label>
        <input type="text" id="title" required maxlength="120">
      </div>
      <div class="form-field">
        <label for="campaignName">Campaign</label>
        <select id="campaignName" required>${campaignOptions}</select>
      </div>
      <div class="form-field">
        <label for="friends">Friends you play with</label>
        <input type="text" id="friends" placeholder="e.g. Sven, Lisa, Jon">
        <p class="form-hint">Separate multiple names with commas. Optional.</p>
      </div>
      <div class="form-field">
        <label for="investigatorId">Your investigator</label>
        <select id="investigatorId" required>${investigatorOptions}</select>
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
}

function handleCreateCampaign() {
  const title = document.getElementById("title").value;
  const campaignName = document.getElementById("campaignName").value;
  const friendsInput = document.getElementById("friends").value;
  const investigatorId = document.getElementById("investigatorId").value;

  try {
    const friends = friendsInput
      .split(",")
      .map((friend) => friend.trim())
      .filter((friend) => friend.length > 0);
    const investigator = arkhamCatalog.investigators.find(
      (candidate) => candidate.investigatorId === investigatorId
    );
    const campaign = createCampaign(
      `campaign-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      title,
      campaignName,
      friends,
      investigatorId,
      investigator.investigatorName,
      investigator.factionName
    );
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
      <li>
        <span class="entry-kind">${EXPERIENCE_DISPLAY_NAMES(entry.experienceKind)}: +${entry.experienceAmount} XP</span>
        ${entry.notes ? `<span class="entry-notes">${escapeHtml(entry.notes)}</span>` : ""}
      </li>`
    )
    .join("");

  appElement.innerHTML = `
    <a class="back-link" href="#" id="back-to-overview-link">&larr; Back to campaigns</a>
    <div class="campaign-context">
      <span>${escapeHtml(campaign.campaignName)}</span>
      <span class="faction-icon ${escapeHtml(campaign.investigatorFaction)}">
        <span class="faction-symbol">${FACTION_SYMBOLS[campaign.investigatorFaction] ?? FACTION_SYMBOLS.neutral}</span>
        ${escapeHtml(campaign.investigatorFaction)}
      </span>
      <span>${escapeHtml(campaign.investigatorName)}</span>
      <span class="experience-total">${escapeHtml(campaign.title)} — ${getTotalExperience(campaign)} XP</span>
    </div>
    <form class="form-card" id="gain-experience-form">
      <h2>Gain experience</h2>
      <div class="form-field">
        <label for="experienceKind">Experience type</label>
        <select id="experienceKind" required>
          <option value="scenario">Scenario</option>
          <option value="interlude">Interlude</option>
          <option value="card">Card experience</option>
        </select>
      </div>
      <div class="form-field">
        <label for="experienceAmount">Experience (numbers)</label>
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
    ${campaign.experienceLog.length > 0 ? `<h2>Experience log</h2><ul class="experience-log">${logItems}</ul>` : ""}`;

  document.getElementById("back-to-overview-link").addEventListener("click", (event) => {
    event.preventDefault();
    showOverview();
  });
  document.getElementById("gain-experience-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleGainExperience(campaign);
  });
}

function EXPERIENCE_DISPLAY_NAMES(kind) {
  return { scenario: "Scenario", interlude: "Interlude", card: "Card experience" }[kind] ?? kind;
}

function handleGainExperience(campaign) {
  const experienceKind = document.getElementById("experienceKind").value;
  const experienceAmount = document.getElementById("experienceAmount").value;
  const notes = document.getElementById("notes").value;

  try {
    gainExperience(campaign, experienceKind, experienceAmount, notes);
    persistCampaigns();
    showGainExperience();
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

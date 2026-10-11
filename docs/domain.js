const MAX_CAMPAIGN_TITLE_LENGTH = 120;

function parseCampaignTitle(rawTitle) {
  const trimmedTitle = String(rawTitle ?? "").trim();
  if (trimmedTitle.length === 0) {
    throw new Error("Campaign title cannot be empty.");
  }
  if (trimmedTitle.length > MAX_CAMPAIGN_TITLE_LENGTH) {
    throw new Error("Campaign title cannot exceed 120 characters.");
  }
  return trimmedTitle;
}

const EXPERIENCE_KINDS = ["scenario", "interlude", "weakness", "permanent"];
const EXPERIENCE_KIND_DISPLAY_NAMES = {
  scenario: "Scenario",
  interlude: "Interlude",
  weakness: "Weakness",
  permanent: "Permanent",
};

function parseExperienceKind(rawKind) {
  const kind = String(rawKind ?? "");
  if (!EXPERIENCE_KINDS.includes(kind)) {
    throw new Error(
      `Experience type must be one of: ${EXPERIENCE_KINDS.join(", ")}.`
    );
  }
  return kind;
}

const MAX_EXPERIENCE_TITLE_LENGTH = 120;

function parseExperienceTitle(rawTitle) {
  const trimmedTitle = String(rawTitle ?? "").trim();
  if (trimmedTitle.length === 0) {
    throw new Error("Experience title cannot be empty.");
  }
  if (trimmedTitle.length > MAX_EXPERIENCE_TITLE_LENGTH) {
    throw new Error("Experience title cannot exceed 120 characters.");
  }
  return trimmedTitle;
}

function parseExperienceAmount(rawAmount) {
  const amount = Number(rawAmount);
  if (!Number.isInteger(amount)) {
    throw new Error("Experience must be a whole number.");
  }
  if (amount < 0) {
    throw new Error("Experience cannot be negative.");
  }
  return amount;
}

function createCampaign(
  id,
  campaignName,
  friends,
  investigatorId,
  investigatorName,
  investigatorFaction,
  notes
) {
  const trimmedNotes = String(notes ?? "").trim();
  return {
    id,
    title: parseCampaignTitle(campaignName),
    campaignName: parseCampaignTitle(campaignName),
    friends,
    investigatorId,
    investigatorName,
    investigatorFaction,
    notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    isActive: true,
    createdAt: new Date().toISOString(),
    experienceLog: [],
  };
}

function gainExperience(campaign, experienceKind, experienceTitle, experienceAmount, notes) {
  const kind = parseExperienceKind(experienceKind);
  const title = parseExperienceTitle(experienceTitle);
  const amount = parseExperienceAmount(experienceAmount);
  const trimmedNotes = String(notes ?? "").trim();
  campaign.experienceLog.push({
    id: `${campaign.id}-entry-${campaign.experienceLog.length + 1}`,
    experienceKind: kind,
    experienceTitle: title,
    experienceAmount: amount,
    notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    recordedAt: new Date().toISOString(),
  });
}

function updateExperienceEntry(campaign, entryId, experienceKind, experienceTitle, experienceAmount, notes) {
  const entry = campaign.experienceLog.find((candidate) => candidate.id === entryId);
  if (entry === undefined) {
    throw new Error("That experience entry does not exist.");
  }
  entry.experienceKind = parseExperienceKind(experienceKind);
  entry.experienceTitle = parseExperienceTitle(experienceTitle);
  entry.experienceAmount = parseExperienceAmount(experienceAmount);
  const trimmedNotes = String(notes ?? "").trim();
  entry.notes = trimmedNotes.length > 0 ? trimmedNotes : null;
}

function getTotalExperience(campaign) {
  return campaign.experienceLog.reduce(
    (sum, entry) => sum + entry.experienceAmount,
    0
  );
}

function markFinished(campaign) {
  campaign.isActive = false;
}

function reactivate(campaign) {
  campaign.isActive = true;
}

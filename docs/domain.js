const MAX_CAMPAIGN_TITLE_LENGTH = 120;
const VALID_EXPERIENCE_KINDS = ["scenario", "interlude", "card"];
const EXPERIENCE_KIND_DISPLAY_NAMES = {
  scenario: "Scenario",
  interlude: "Interlude",
  card: "Card experience",
};

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

function parseExperienceKind(rawKind) {
  const kind = String(rawKind ?? "");
  if (!VALID_EXPERIENCE_KINDS.includes(kind)) {
    throw new Error(
      `Experience type must be one of: ${VALID_EXPERIENCE_KINDS.join(", ")}.`
    );
  }
  return kind;
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
  title,
  campaignName,
  friends,
  investigatorId,
  investigatorName,
  investigatorFaction
) {
  return {
    id,
    title: parseCampaignTitle(title),
    campaignName,
    friends,
    investigatorId,
    investigatorName,
    investigatorFaction,
    isActive: true,
    createdAt: new Date().toISOString(),
    experienceLog: [],
  };
}

function gainExperience(campaign, experienceKind, experienceAmount, notes) {
  const kind = parseExperienceKind(experienceKind);
  const amount = parseExperienceAmount(experienceAmount);
  const trimmedNotes = String(notes ?? "").trim();
  campaign.experienceLog.push({
    id: `${campaign.id}-entry-${campaign.experienceLog.length + 1}`,
    experienceKind: kind,
    experienceAmount: amount,
    notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    recordedAt: new Date().toISOString(),
  });
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

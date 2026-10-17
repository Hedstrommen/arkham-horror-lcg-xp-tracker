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

function parseFriendName(rawName) {
  const trimmedName = String(rawName ?? "").trim();
  if (trimmedName.length === 0) {
    throw new Error("Friend name cannot be empty.");
  }
  if (trimmedName.length > MAX_CAMPAIGN_TITLE_LENGTH) {
    throw new Error("Friend name cannot exceed 120 characters.");
  }
  return trimmedName;
}

function normalizeFriend(friend) {
  if (typeof friend === "string") {
    return { name: parseFriendName(friend), investigatorId: null, investigatorName: null, investigatorFaction: null };
  }
  return {
    name: parseFriendName(friend?.name),
    investigatorId: friend?.investigatorId ?? null,
    investigatorName: friend?.investigatorName ?? null,
    investigatorFaction: friend?.investigatorFaction ?? null,
  };
}

function normalizeFriends(rawFriends) {
  const seenNames = new Set();
  const friends = [];
  for (const rawFriend of Array.isArray(rawFriends) ? rawFriends : []) {
    const friend = normalizeFriend(rawFriend);
    if (seenNames.has(friend.name)) {
      continue;
    }
    seenNames.add(friend.name);
    friends.push(friend);
  }
  return friends;
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

function parseFriendAmounts(rawFriendAmounts) {
  const friendAmounts = {};
  for (const [friendName, rawAmount] of Object.entries(rawFriendAmounts ?? {})) {
    if (String(rawAmount ?? "").trim() === "") {
      continue;
    }
    friendAmounts[friendName] = parseExperienceAmount(rawAmount);
  }
  return friendAmounts;
}

function createCampaign(
  id,
  title,
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
    title: parseCampaignTitle(title),
    campaignName: parseCampaignTitle(campaignName),
    friends: normalizeFriends(friends),
    investigatorId,
    investigatorName,
    investigatorFaction,
    notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    isActive: true,
    createdAt: new Date().toISOString(),
    experienceLog: [],
  };
}

function normalizeCampaign(campaign) {
  campaign.friends = normalizeFriends(campaign.friends);
  campaign.experienceLog = campaign.experienceLog ?? [];
  for (const entry of campaign.experienceLog) {
    entry.friendAmounts = entry.friendAmounts ?? {};
  }
  return campaign;
}

function assertKnownFriends(campaign, friendAmounts) {
  const knownNames = new Set(campaign.friends.map((friend) => friend.name));
  for (const friendName of Object.keys(friendAmounts ?? {})) {
    if (!knownNames.has(friendName)) {
      throw new Error(`Unknown friend: ${friendName}`);
    }
  }
}

function gainExperience(campaign, experienceKind, experienceTitle, experienceAmount, notes, friendAmounts) {
  const kind = parseExperienceKind(experienceKind);
  const title = parseExperienceTitle(experienceTitle);
  const amount = parseExperienceAmount(experienceAmount);
  assertKnownFriends(campaign, friendAmounts);
  const trimmedNotes = String(notes ?? "").trim();
  campaign.experienceLog.push({
    id: `${campaign.id}-entry-${campaign.experienceLog.length + 1}`,
    experienceKind: kind,
    experienceTitle: title,
    experienceAmount: amount,
    friendAmounts: parseFriendAmounts(friendAmounts),
    notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    recordedAt: new Date().toISOString(),
  });
}

function updateExperienceEntry(campaign, entryId, experienceKind, experienceTitle, experienceAmount, notes, friendAmounts) {
  const entry = campaign.experienceLog.find((candidate) => candidate.id === entryId);
  if (entry === undefined) {
    throw new Error("That experience entry does not exist.");
  }
  entry.experienceKind = parseExperienceKind(experienceKind);
  entry.experienceTitle = parseExperienceTitle(experienceTitle);
  entry.experienceAmount = parseExperienceAmount(experienceAmount);
  assertKnownFriends(campaign, friendAmounts);
  entry.friendAmounts = parseFriendAmounts(friendAmounts);
  const trimmedNotes = String(notes ?? "").trim();
  entry.notes = trimmedNotes.length > 0 ? trimmedNotes : null;
}

function getTotalExperience(campaign) {
  return campaign.experienceLog.reduce(
    (sum, entry) => sum + entry.experienceAmount,
    0
  );
}

function getFriendTotalExperience(campaign, friendName) {
  return campaign.experienceLog.reduce(
    (sum, entry) => sum + (entry.friendAmounts?.[friendName] ?? 0),
    0
  );
}

function getExperienceBreakdown(campaign) {
  const totalsByKind = {};
  for (const entry of campaign.experienceLog) {
    totalsByKind[entry.experienceKind] =
      (totalsByKind[entry.experienceKind] ?? 0) + entry.experienceAmount;
  }
  return totalsByKind;
}

function markFinished(campaign) {
  campaign.isActive = false;
}

function reactivate(campaign) {
  campaign.isActive = true;
}

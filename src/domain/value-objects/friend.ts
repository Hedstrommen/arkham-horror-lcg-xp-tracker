export interface Friend {
  name: string;
  investigatorId: string | null;
  investigatorName: string | null;
  investigatorFaction: string | null;
}

export function parseFriend(rawFriend: { name?: unknown; investigatorId?: unknown; investigatorName?: unknown; investigatorFaction?: unknown }): Friend {
  const name = String(rawFriend.name ?? "").trim();
  if (name.length === 0) {
    throw new Error("Friend name cannot be empty.");
  }
  if (name.length > 120) {
    throw new Error("Friend name cannot exceed 120 characters.");
  }
  return {
    name,
    investigatorId: rawFriend.investigatorId === undefined || rawFriend.investigatorId === null ? null : String(rawFriend.investigatorId),
    investigatorName: rawFriend.investigatorName === undefined || rawFriend.investigatorName === null ? null : String(rawFriend.investigatorName),
    investigatorFaction: rawFriend.investigatorFaction === undefined || rawFriend.investigatorFaction === null ? null : String(rawFriend.investigatorFaction),
  };
}

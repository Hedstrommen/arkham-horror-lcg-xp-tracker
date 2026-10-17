import Database from "better-sqlite3";
import { Campaign } from "../../domain/campaign/campaign";
import { CampaignRepository } from "../../domain/campaign/campaign-repository";
import { ExperienceEntry } from "../../domain/campaign/experience-entry";
import { CampaignTitle } from "../../domain/value-objects/campaign-title";
import { ExperiencePoints } from "../../domain/value-objects/experience-points";
import { ExperienceType } from "../../domain/value-objects/experience-type";
import { Friend } from "../../domain/value-objects/friend";

interface CampaignRow {
  id: string;
  owner_id: string;
  title: string;
  notes: string | null;
  campaign_name: string;
  chapter: number;
  friends: string;
  investigator_id: string;
  investigator_name: string;
  investigator_faction: string;
  is_active: number;
  created_at: string;
}

interface ExperienceEntryRow {
  id: string;
  campaign_id: string;
  experience_kind: string;
  experience_amount: number;
  experience_title: string;
  notes: string | null;
  friend_amounts: string;
}


function parseLegacyFriends(rawFriends: unknown): Friend[] {
  const friends: Friend[] = [];
  for (const rawFriend of Array.isArray(rawFriends) ? rawFriends : []) {
    if (typeof rawFriend === "string") {
      if (rawFriend.trim().length > 0) {
        friends.push({ name: rawFriend, investigatorId: null, investigatorName: null, investigatorFaction: null });
      }
      continue;
    }
    friends.push({
      name: String(rawFriend?.name ?? "").trim(),
      investigatorId: rawFriend?.investigatorId ?? null,
      investigatorName: rawFriend?.investigatorName ?? null,
      investigatorFaction: rawFriend?.investigatorFaction ?? null,
    });
  }
  return friends.filter((friend) => friend.name.length > 0);
}

export class SqliteCampaignRepository implements CampaignRepository {
  private readonly database: Database.Database;

  constructor(database: Database.Database) {
    this.database = database;
  }

  public save(campaign: Campaign): void {
    const insertCampaignStatement = this.database.prepare(`
      INSERT INTO campaigns (
        id, owner_id, title, notes, campaign_name, chapter, friends, investigator_id,
        investigator_name, investigator_faction, is_active, created_at
      ) VALUES (
        @id, @ownerId, @title, @notes, @campaignName, @chapter, @friends, @investigatorId,
        @investigatorName, @investigatorFaction, @isActive, @createdAt
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        campaign_name = excluded.campaign_name,
        friends = excluded.friends,
        investigator_id = excluded.investigator_id,
        investigator_name = excluded.investigator_name,
        investigator_faction = excluded.investigator_faction,
        is_active = excluded.is_active
    `);

    const insertExperienceEntryStatement = this.database.prepare(`
      INSERT INTO experience_entries (
        id, campaign_id, experience_kind, experience_amount, experience_title, notes, friend_amounts
      ) VALUES (
        @id, @campaignId, @experienceKind, @experienceAmount, @experienceTitle, @notes, @friendAmounts
      )
      ON CONFLICT(id) DO NOTHING
    `);

    const deleteOrphanedEntriesStatement = this.database.prepare(`
      DELETE FROM experience_entries
      WHERE campaign_id = ?
        AND id NOT IN (SELECT value FROM json_each(?))
    `);

    this.database.transaction(() => {
      insertCampaignStatement.run({
        id: campaign.id,
        ownerId: campaign.ownerId,
        title: campaign.getTitle().toString(),
        notes: campaign.notes,
        campaignName: campaign.campaignName,
        chapter: campaign.chapter,
        friends: JSON.stringify(campaign.friends),
        investigatorId: campaign.investigatorId,
        investigatorName: campaign.investigatorName,
        investigatorFaction: campaign.investigatorFaction,
        isActive: campaign.getIsActive() ? 1 : 0,
        createdAt: this.findCreatedAt(campaign.id),
      });

      const experienceLog = campaign.getExperienceLog();
      for (const entry of experienceLog) {
        insertExperienceEntryStatement.run({
          id: entry.id,
          campaignId: campaign.id,
          experienceKind: entry.experienceType.getKind(),
          experienceAmount: entry.experiencePoints.getAmount(),
          experienceTitle: entry.experienceTitle,
          notes: entry.notes,
          friendAmounts: JSON.stringify(entry.friendAmounts ?? {}),
        });
      }

      deleteOrphanedEntriesStatement.run(
        campaign.id,
        JSON.stringify(experienceLog.map((entry) => entry.id))
      );
    })();
  }

  public deleteByIdAndOwnerId(campaignId: string, ownerId: string): void {
    this.database
      .prepare("DELETE FROM experience_entries WHERE campaign_id = ?")
      .run(campaignId);
    this.database
      .prepare("DELETE FROM campaigns WHERE id = ? AND owner_id = ?")
      .run(campaignId, ownerId);
  }

  public findByIdAndOwnerId(
    campaignId: string,
    ownerId: string
  ): Campaign | null {
    const campaignRow = this.database
      .prepare("SELECT * FROM campaigns WHERE id = ? AND owner_id = ?")
      .get(campaignId, ownerId) as CampaignRow | undefined;

    if (campaignRow === undefined) {
      return null;
    }

    return this.reconstituteCampaign(campaignRow);
  }

  public findAllByOwnerIdOrderedByStatusThenRecency(
    ownerId: string
  ): Campaign[] {
    const campaignRows = this.database
      .prepare(
        "SELECT * FROM campaigns WHERE owner_id = ? ORDER BY is_active DESC, created_at DESC"
      )
      .all(ownerId) as CampaignRow[];

    return campaignRows.map((campaignRow) =>
      this.reconstituteCampaign(campaignRow)
    );
  }

  private reconstituteCampaign(campaignRow: CampaignRow): Campaign {
    const entryRows = this.database
      .prepare(
        "SELECT * FROM experience_entries WHERE campaign_id = ? ORDER BY rowid"
      )
      .all(campaignRow.id) as ExperienceEntryRow[];

    const experienceLog = entryRows.map((entryRow) =>
      new ExperienceEntry(
        entryRow.id,
        ExperienceType.fromUserInput(entryRow.experience_kind),
        ExperiencePoints.fromUserInput(entryRow.experience_amount),
        entryRow.experience_title,
        entryRow.notes,
        JSON.parse(entryRow.friend_amounts ?? "{}") as Record<string, number>
      )
    );

    return Campaign.reconstitute(
      campaignRow.id,
      campaignRow.owner_id,
      CampaignTitle.fromUserInput(campaignRow.title),
      campaignRow.campaign_name,
      campaignRow.chapter,
      parseLegacyFriends(JSON.parse(campaignRow.friends)),
      campaignRow.investigator_id,
      campaignRow.investigator_name,
      campaignRow.investigator_faction,
      campaignRow.notes,
      campaignRow.is_active === 1,
      experienceLog
    );
  }

  private findCreatedAt(campaignId: string): string {
    const existingRow = this.database
      .prepare("SELECT created_at FROM campaigns WHERE id = ?")
      .get(campaignId) as { created_at: string } | undefined;

    return existingRow?.created_at ?? new Date().toISOString();
  }
}

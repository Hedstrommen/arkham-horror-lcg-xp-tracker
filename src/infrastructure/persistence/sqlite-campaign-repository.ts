import Database from "better-sqlite3";
import { Campaign } from "../../domain/campaign/campaign";
import { CampaignRepository } from "../../domain/campaign/campaign-repository";
import { ExperienceEntry } from "../../domain/campaign/experience-entry";
import { CampaignTitle } from "../../domain/value-objects/campaign-title";
import { ExperiencePoints } from "../../domain/value-objects/experience-points";
import { ExperienceType } from "../../domain/value-objects/experience-type";

interface CampaignRow {
  id: string;
  title: string;
  campaign_name: string;
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
  notes: string | null;
}

export class SqliteCampaignRepository implements CampaignRepository {
  private readonly database: Database.Database;

  constructor(database: Database.Database) {
    this.database = database;
  }

  public save(campaign: Campaign): void {
    const insertCampaignStatement = this.database.prepare(`
      INSERT INTO campaigns (
        id, title, campaign_name, friends, investigator_id,
        investigator_name, investigator_faction, is_active, created_at
      ) VALUES (
        @id, @title, @campaignName, @friends, @investigatorId,
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
        id, campaign_id, experience_kind, experience_amount, notes
      ) VALUES (
        @id, @campaignId, @experienceKind, @experienceAmount, @notes
      )
      ON CONFLICT(id) DO NOTHING
    `);

    const deleteOrphanedEntriesStatement = this.database.prepare(`
      DELETE FROM experience_entries
      WHERE campaign_id = @campaignId
        AND id NOT IN (@keptEntryIds)
    `);

    this.database.transaction(() => {
      insertCampaignStatement.run({
        id: campaign.id,
        title: campaign.title.toString(),
        campaignName: campaign.campaignName,
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
          notes: entry.notes,
        });
      }

      if (experienceLog.length > 0) {
        deleteOrphanedEntriesStatement.run({
          campaignId: campaign.id,
          keptEntryIds: experienceLog.map((entry) => entry.id),
        });
      }
    })();
  }

  public findById(campaignId: string): Campaign | null {
    const campaignRow = this.database
      .prepare(
        "SELECT * FROM campaigns WHERE id = ?"
      )
      .get(campaignId) as CampaignRow | undefined;

    if (campaignRow === undefined) {
      return null;
    }

    return this.reconstituteCampaign(campaignRow);
  }

  public findAllOrderedByStatusThenRecency(): Campaign[] {
    const campaignRows = this.database
      .prepare(
        "SELECT * FROM campaigns ORDER BY is_active DESC, created_at DESC"
      )
      .all() as CampaignRow[];

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
        entryRow.notes
      )
    );

    return Campaign.reconstitute(
      campaignRow.id,
      CampaignTitle.fromUserInput(campaignRow.title),
      campaignRow.campaign_name,
      JSON.parse(campaignRow.friends) as string[],
      campaignRow.investigator_id,
      campaignRow.investigator_name,
      campaignRow.investigator_faction,
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

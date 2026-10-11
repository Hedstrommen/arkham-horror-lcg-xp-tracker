import { CampaignTitle } from "../value-objects/campaign-title";
import { ExperienceEntry } from "./experience-entry";
import { ExperiencePoints } from "../value-objects/experience-points";
import { ExperienceType } from "../value-objects/experience-type";

export class Campaign {
  private experienceLog: ExperienceEntry[];

  private constructor(
    public readonly id: string,
    public readonly ownerId: string,
    private title: CampaignTitle,
    public notes: string | null,
    public readonly campaignName: string,
    public readonly chapter: number,
    public friends: string[],
    public readonly investigatorId: string,
    public readonly investigatorName: string,
    public readonly investigatorFaction: string,
    private isActive: boolean,
    experienceLog: ExperienceEntry[]
  ) {
    this.experienceLog = experienceLog;
  }

  public static startNew(
    id: string,
    ownerId: string,
    title: CampaignTitle,
    campaignName: string,
    chapter: number,
    friends: string[],
    investigatorId: string,
    investigatorName: string,
    investigatorFaction: string,
    notes: string | null
  ): Campaign {
    return new Campaign(
      id,
      ownerId,
      title,
      notes,
      campaignName,
      chapter,
      friends,
      investigatorId,
      investigatorName,
      investigatorFaction,
      true,
      []
    );
  }

  public static reconstitute(
    id: string,
    ownerId: string,
    title: CampaignTitle,
    campaignName: string,
    chapter: number,
    friends: string[],
    investigatorId: string,
    investigatorName: string,
    investigatorFaction: string,
    notes: string | null,
    isActive: boolean,
    experienceLog: ExperienceEntry[]
  ): Campaign {
    return new Campaign(
      id,
      ownerId,
      title,
      notes,
      campaignName,
      chapter,
      friends,
      investigatorId,
      investigatorName,
      investigatorFaction,
      isActive,
      experienceLog
    );
  }

  public gainExperience(
    experienceType: ExperienceType,
    experiencePoints: ExperiencePoints,
    experienceTitle: string,
    notes: string | null
  ): ExperienceEntry {
    const entry = new ExperienceEntry(
      this.generateEntryId(),
      experienceType,
      experiencePoints,
      experienceTitle,
      notes
    );
    this.experienceLog.push(entry);
    return entry;
  }

  public updateExperienceEntry(
    entryId: string,
    experienceType: ExperienceType,
    experiencePoints: ExperiencePoints,
    experienceTitle: string,
    notes: string | null
  ): void {
    const entry = this.experienceLog.find(
      (candidateEntry) => candidateEntry.id === entryId
    );
    if (entry === undefined) {
      throw new Error(`No experience entry found with id ${entryId}.`);
    }
    entry.experienceType = experienceType;
    entry.experiencePoints = experiencePoints;
    entry.experienceTitle = experienceTitle;
    entry.notes = notes;
  }

  public getTotalExperience(): number {
    return this.experienceLog.reduce(
      (sum, entry) => sum + entry.experiencePoints.getAmount(),
      0
    );
  }

  public getExperienceBreakdownByKind(): Record<string, number> {
    const totalsByKind: Record<string, number> = {};
    for (const entry of this.experienceLog) {
      const kind = entry.experienceType.getKind();
      totalsByKind[kind] =
        (totalsByKind[kind] ?? 0) + entry.experiencePoints.getAmount();
    }
    return totalsByKind;
  }

  public getExperienceLog(): ExperienceEntry[] {
    return [...this.experienceLog];
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public rename(newTitle: CampaignTitle): void {
    this.title = newTitle;
  }

  public getTitle(): CampaignTitle {
    return this.title;
  }

  public updateFriendsAndNotes(friends: string[], notes: string | null): void {
    this.friends = friends;
    this.notes = notes;
  }

  public markFinished(): void {
    this.isActive = false;
  }

  public reactivate(): void {
    this.isActive = true;
  }

  private generateEntryId(): string {
    const highestEntryNumber = this.experienceLog.reduce((highest, entry) => {
      const entryNumber = Number(entry.id.split("-")[1]);
      return entryNumber > highest ? entryNumber : highest;
    }, 0);
    return `${this.id}-entry-${highestEntryNumber + 1}`;
  }
}

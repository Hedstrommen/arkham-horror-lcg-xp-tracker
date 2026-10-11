export interface UpdateExperienceCommand {
  campaignId: string;
  ownerId: string;
  entryId: string;
  experienceKind: string;
  experienceAmount: number;
  experienceTitle: string;
  notes: string | null;
}

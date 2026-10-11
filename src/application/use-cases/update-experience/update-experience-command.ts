export interface UpdateExperienceCommand {
  campaignId: string;
  ownerId: string;
  entryId: string;
  experienceKind: string;
  experienceAmount: number;
  experienceSuffix: string | null;
  notes: string | null;
}

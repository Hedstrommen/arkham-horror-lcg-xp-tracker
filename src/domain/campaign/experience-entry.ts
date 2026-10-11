import { ExperiencePoints } from "../value-objects/experience-points";
import { ExperienceType } from "../value-objects/experience-type";

export class ExperienceEntry {
  constructor(
    public readonly id: string,
    public readonly experienceType: ExperienceType,
    public readonly experiencePoints: ExperiencePoints,
    public readonly notes: string | null
  ) {}
}

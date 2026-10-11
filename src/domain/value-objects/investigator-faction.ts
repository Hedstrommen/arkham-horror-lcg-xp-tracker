export type InvestigatorFactionName =
  | "guardian"
  | "seeker"
  | "rogue"
  | "mystic"
  | "survivor"
  | "neutral";

export class InvestigatorFaction {
  private readonly name: InvestigatorFactionName;

  private constructor(name: InvestigatorFactionName) {
    this.name = name;
  }

  public static fromName(name: InvestigatorFactionName): InvestigatorFaction {
    const validNames: InvestigatorFactionName[] = [
      "guardian",
      "seeker",
      "rogue",
      "mystic",
      "survivor",
      "neutral",
    ];
    if (!validNames.includes(name)) {
      throw new Error(`Unknown investigator faction: ${name}`);
    }
    return new InvestigatorFaction(name);
  }

  public getName(): InvestigatorFactionName {
    return this.name;
  }
}

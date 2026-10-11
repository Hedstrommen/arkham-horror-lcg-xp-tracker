export class CampaignTitle {
  private readonly text: string;

  private constructor(text: string) {
    this.text = text;
  }

  public static fromUserInput(rawText: string): CampaignTitle {
    const trimmedText = rawText.trim();
    if (trimmedText.length === 0) {
      throw new Error("Campaign title cannot be empty.");
    }
    if (trimmedText.length > 120) {
      throw new Error("Campaign title cannot exceed 120 characters.");
    }
    return new CampaignTitle(trimmedText);
  }

  public toString(): string {
    return this.text;
  }
}

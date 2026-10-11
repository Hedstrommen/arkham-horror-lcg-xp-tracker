export class Username {
  private readonly text: string;

  private constructor(text: string) {
    this.text = text;
  }

  public static fromUserInput(rawText: string): Username {
    const trimmedText = rawText.trim();
    if (trimmedText.length < 3) {
      throw new Error("Username must be at least 3 characters long.");
    }
    if (trimmedText.length > 30) {
      throw new Error("Username cannot exceed 30 characters.");
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedText)) {
      throw new Error(
        "Username can only contain letters, numbers, underscores and hyphens."
      );
    }
    return new Username(trimmedText);
  }

  public toString(): string {
    return this.text;
  }
}

export class PlainTextPassword {
  private readonly text: string;

  private constructor(text: string) {
    this.text = text;
  }

  public static fromUserInput(rawText: string): PlainTextPassword {
    if (rawText.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (rawText.length > 200) {
      throw new Error("Password cannot exceed 200 characters.");
    }
    return new PlainTextPassword(rawText);
  }

  public toString(): string {
    return this.text;
  }
}

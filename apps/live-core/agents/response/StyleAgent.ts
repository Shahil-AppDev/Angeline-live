export class StyleAgent {
  private maxLength: number = 280;

  applyStyle(response: string, username: string): string {
    let styled = response.trim();

    styled = this.ensureMaxLength(styled);

    styled = this.addPersonalization(styled, username);

    styled = this.cleanupFormatting(styled);

    return styled;
  }

  private ensureMaxLength(text: string): string {
    if (text.length <= this.maxLength) {
      return text;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    let result = '';
    for (const sentence of sentences) {
      const withSentence = result + sentence.trim() + '. ';
      if (withSentence.length > this.maxLength) {
        break;
      }
      result = withSentence;
    }

    return result.trim() || text.substring(0, this.maxLength - 3) + '...';
  }

  private addPersonalization(text: string, username: string): string {
    if (!text.toLowerCase().includes(username.toLowerCase()) && 
        !text.startsWith('@')) {
      return `@${username} ${text}`;
    }
    return text;
  }

  private cleanupFormatting(text: string): string {
    text = text.replace(/\*\*/g, '');
    text = text.replace(/\*/g, '');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/\s{2,}/g, ' ');
    
    return text.trim();
  }

  validateResponse(response: string): { valid: boolean; reason?: string } {
    if (!response || response.trim().length === 0) {
      return { valid: false, reason: 'Empty response' };
    }

    if (response.length < 10) {
      return { valid: false, reason: 'Response too short' };
    }

    if (response.length > 500) {
      return { valid: false, reason: 'Response too long' };
    }

    return { valid: true };
  }
}

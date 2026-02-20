import * as vscode from 'vscode';

export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('AI Code Mentor');
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
  }

  warn(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
  }

  error(message: string, error?: Error): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
    if (error) {
      this.outputChannel.appendLine(`  ${error.message}`);
      if (error.stack) {
        this.outputChannel.appendLine(`  ${error.stack}`);
      }
    }
  }

  success(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] SUCCESS: ${message}`);
  }

  logFileScanned(filePath: string, issueCount: number, duration: number): void {
    this.info(`Scanned ${filePath} - ${issueCount} issues found (${duration}ms)`);
  }

  logFileSkipped(filePath: string, reason: string): void {
    this.info(`Skipped ${filePath} - ${reason}`);
  }

  logReviewStarted(filePath: string): void {
    this.info(`Review started: ${filePath}`);
  }

  logReviewScore(score: number | null): void {
    const scoreText = score !== null ? `${score}/10` : 'N/A';
    this.info(`Score: ${scoreText}`);
  }

  logSuggestionCount(count: number): void {
    this.info(`Suggestion count: ${count}`);
  }

  logReviewFinished(filePath: string): void {
    this.success(`Review finished: ${filePath}`);
  }

  logAIResponse(responseLength: number, parseSuccess: boolean): void {
    const status = parseSuccess ? 'Successfully parsed JSON' : 'Fallback to regex parsing';
    this.info(`AI response: ${responseLength} chars | ${status}`);
  }

  logWorkspaceReview(totalFiles: number, scannedFiles: number, skippedFiles: number, duration: number): void {
    const durationSec = (duration / 1000).toFixed(1);
    this.success(
      `Workspace review completed | Total: ${totalFiles} | Scanned: ${scannedFiles} | Skipped: ${skippedFiles} (${durationSec}s)`
    );
  }

  show(): void {
    this.outputChannel.show(true);
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}

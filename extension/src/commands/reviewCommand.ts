/**
 * Review Command Handler
 * 
 * Handles the AI review command execution.
 * Reads the active file, sends it for analysis, and applies diagnostics.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ApiClient } from '../api/client';
import { parseReviewText, ReviewStore, ReviewDiagnostics } from '../review';
import { ParsedReview } from '../types';
import { Logger } from '../services/logger';
import { FileCache } from '../services/fileCache';
import { FileDecorationProvider } from '../services/fileDecorationProvider';
import { StatusBarManager } from '../services/statusBarManager';

const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.java',
  '.cpp',
  '.cs',
  '.go',
  '.rs'
]);

const IGNORED_BASENAMES = new Set([
  'package-lock.json',
  'yarn.lock'
]);

const IGNORED_PATH_PARTS = [
  'node_modules',
  'dist',
  'build',
  'out',
  '.git',
  'coverage',
  '.venv',
  '__pycache__'
];

function isIgnoredFile(document: vscode.TextDocument): boolean {
  if (document.isUntitled) {
    return false;
  }

  const filePath = document.uri.fsPath;
  const baseName = path.basename(filePath).toLowerCase();
  if (IGNORED_BASENAMES.has(baseName)) {
    return true;
  }

  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  if (IGNORED_PATH_PARTS.some((part) => normalized.includes(`/${part}/`))) {
    return true;
  }

  const extension = path.extname(baseName);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return true;
  }

  return false;
}

function isIgnoredPath(filePath: string): boolean {
  const baseName = path.basename(filePath).toLowerCase();
  if (IGNORED_BASENAMES.has(baseName)) {
    return true;
  }

  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  return IGNORED_PATH_PARTS.some((part) => normalized.includes(`/${part}/`));
}

function formatReviewSummary(review: ReturnType<typeof parseReviewText>): string {
  const scoreText = review.score !== null ? `${review.score}/10` : 'N/A';
  return `Summary (${scoreText}): ${review.summary}`;
}

function isSupportedFile(document: vscode.TextDocument): boolean {
  if (document.isUntitled) {
    return false;
  }

  const extension = path.extname(document.fileName).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension);
}

/**
 * Determines what should be reviewed based on current context
 */
export function getReviewTarget(): 'file' | 'workspace' | 'none' {
  const editor = vscode.window.activeTextEditor;
  
  if (editor && editor.document) {
    const document = editor.document;
    
    if (isSupportedFile(document) && !isIgnoredFile(document)) {
      return 'file';
    }
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return 'workspace';
  }

  return 'none';
}

/**
 * Command handler for code review functionality
 */
export class ReviewCommand {
  private apiClient: ApiClient;
  private reviewStore: ReviewStore;
  private diagnostics: ReviewDiagnostics;
  private logger: Logger;
  private fileCache: FileCache;
  private decorationProvider?: FileDecorationProvider;
  private statusBar?: StatusBarManager;

  constructor(
    reviewStore: ReviewStore,
    diagnostics: ReviewDiagnostics,
    decorationProvider?: FileDecorationProvider,
    statusBar?: StatusBarManager
  ) {
    this.apiClient = new ApiClient();
    this.reviewStore = reviewStore;
    this.diagnostics = diagnostics;
    this.logger = Logger.getInstance();
    this.fileCache = FileCache.getInstance();
    this.decorationProvider = decorationProvider;
    this.statusBar = statusBar;
  }

  /**
   * Executes the code review command with intelligent fallback
   * 
   * This method:
   * 1. Checks what can be reviewed (file/workspace/none)
   * 2. Automatically falls back to workspace review if no file is active
   * 3. Shows subtle notifications instead of blocking errors
   */
  async execute(): Promise<void> {
    try {
      const target = getReviewTarget();

      if (target === 'none') {
        vscode.window.setStatusBarMessage(
          '$(info) Open a file or folder to start AI review',
          3000
        );
        this.logger.info('No review target available');
        return;
      }

      if (target === 'workspace') {
        this.logger.info('No active file, falling back to workspace review');
        await this.executeWorkspaceReview();
        return;
      }

      // Step 1: Get active editor (we know it exists from getReviewTarget)
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.setStatusBarMessage('$(info) No active file', 3000);
        this.logger.info('No active editor');
        return;
      }
      
      const document = editor.document;

      // Step 2: Check if file type is supported
      if (!isSupportedFile(document)) {
        vscode.window.setStatusBarMessage(
          '$(info) AI Reviewer: This file type is not supported',
          3000
        );
        this.logger.info(`Unsupported file type: ${document.fileName}`);
        return;
      }

      if (isIgnoredFile(document)) {
        vscode.window.setStatusBarMessage(
          '$(info) This file is generated and not useful for AI review',
          3000
        );
        this.logger.info(`Ignored file: ${document.fileName}`);
        return;
      }

      const code = document.getText();

      // Check if file is empty
      if (!code || code.trim().length === 0) {
        vscode.window.setStatusBarMessage('$(info) The current file is empty', 3000);
        this.logger.info('Skipped empty file');
        return;
      }

      // Step 3: Get language
      const language = document.languageId;
      this.logger.logReviewStarted(document.fileName);
      console.log(`[Review Command] Analyzing ${language} file: ${document.fileName}`);
      console.log(`[Review Command] Code length: ${code.length} characters`);

      // Step 4: Check backend health before proceeding
      const isHealthy = await this.apiClient.checkBackendHealth();
      
      if (!isHealthy) {
        const backendUrl = this.apiClient.apiUrl;
        vscode.window.setStatusBarMessage(
          `$(warning) Cannot connect to backend at ${backendUrl}`,
          5000
        );
        this.logger.error(`Backend connection failed: ${backendUrl}`);
        this.logger.info('To start backend: cd backend && npm start');
        return;
      }

      // Step 5: Send code for analysis with progress indicator
      const startTime = Date.now();
      const analysis = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing code with AI...',
        cancellable: false
      }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
        progress.report({ message: 'Sending code to AI...' });
        
        try {
          const result = await this.apiClient.reviewCode(code, language);
          progress.report({ message: 'Analysis complete!' });
          return result;
        } catch (error) {
          throw error;
        }
      });

      const duration = Date.now() - startTime;
      console.log('[Review Command] Analysis completed successfully');

      // Step 6: Universal fault-tolerant parser - NEVER crashes
      this.logger.info('===== RAW AI RESPONSE =====');
      this.logger.info(JSON.stringify(analysis, null, 2));
      this.logger.info('===========================');

      let parsed: ParsedReview;
      
      // Universal parser - handles ANY response format
      try {
        let normalizedData: any;
        
        // Try to parse string responses as JSON
        if (typeof analysis === 'string') {
          try {
            normalizedData = JSON.parse(analysis);
          } catch {
            // Not JSON, treat as text review
            normalizedData = { review: analysis };
          }
        } else {
          normalizedData = analysis || {};
        }

        // Normalize all fields with safe defaults
        const safeData = {
          score: Number(normalizedData.score) || (normalizedData.score === 0 ? 0 : 5),
          summary: normalizedData.summary || normalizedData.review || 'AI review completed with limited data',
          bugs: Array.isArray(normalizedData.bugs) ? normalizedData.bugs : [],
          security: Array.isArray(normalizedData.security) ? normalizedData.security : [],
          suggestions: Array.isArray(normalizedData.suggestions) ? normalizedData.suggestions : [],
          review: normalizedData.review
        };


        console.log('[Review Command] Normalized data:', safeData);
        this.logger.info(`Parsed: score=${safeData.score}, bugs=${safeData.bugs.length}, security=${safeData.security.length}, suggestions=${safeData.suggestions.length}`);
        // Parse with universal parser
        if (safeData.review) {
          parsed = parseReviewText(safeData.review);
        } else {
          parsed = parseReviewText(JSON.stringify(safeData));
        }

        // Final safety check - ensure all required fields exist
        parsed.score = parsed.score !== null ? parsed.score : safeData.score;
        parsed.summary = parsed.summary || safeData.summary;
        parsed.suggestions = Array.isArray(parsed.suggestions)
          ? parsed.suggestions.map((s: any) => typeof s === 'string' ? { suggestion: s } : s)
          : [];

      } catch (parseError) {
        // Absolute fallback - create empty but valid review
        console.warn('[Review Command] Parser failed, using fallback:', parseError);
        this.logger.warn('Parser failed, showing fallback review');
        
        parsed = {
          score: 5,
          summary: 'AI returned non-structured response. Check Output panel for raw data.',
          suggestions: [{ suggestion: 'Review the raw AI output in the Output panel for details' }],
          raw: JSON.stringify(analysis)
        };
      }

      this.reviewStore.set(document.uri, parsed);
      this.diagnostics.update(document, parsed);

      // Output channel display
      const outputChannel = vscode.window.createOutputChannel('AI Code Mentor');
      outputChannel.appendLine(`File: ${document.fileName}`);
      outputChannel.appendLine(`Score: ${parsed.score}/10`);
      outputChannel.appendLine(`Summary: ${parsed.summary}`);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        outputChannel.appendLine('Suggestions:');
        for (const s of parsed.suggestions) {
          outputChannel.appendLine(`  - ${s.suggestion}`);
        }
      }
      if (Array.isArray(parsed.security) && parsed.security.length > 0) {
        outputChannel.appendLine('Security Rating:');
        for (const sec of parsed.security) {
          outputChannel.appendLine(`  - ${sec.security}`);
        }
      }
      outputChannel.show(true);

      // Logging
      this.logger.logReviewScore(parsed.score);
      this.logger.logSuggestionCount(parsed.suggestions.length);
      this.logger.logReviewFinished(document.fileName);

      // Status bar
      if (this.statusBar) {
        this.statusBar.setReviewScore(parsed.score);
      }

      vscode.window.setStatusBarMessage('$(sparkle) AI Review Complete — Suggestions highlighted in editor.', 4000);

    } catch (error) {
      // Handle errors gracefully with subtle notifications
      console.error('Review command crashed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      this.logger.error('Code review failed', error as Error);
      vscode.window.setStatusBarMessage(
        `$(error) Review failed: ${errorMessage}`,
        5000
      );
      vscode.window.showErrorMessage('AI Reviewer crashed. See Output logs.');
    }
  }

  async executeWorkspaceReview(): Promise<void> {
    const workspaceStartTime = Date.now();
    try {
      this.logger.info('Starting workspace review...');
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
      }

      const includePattern = '**/*.{js,ts,jsx,tsx,py,java,cpp,cs,go,rs}';
      const excludePattern = '**/{node_modules,dist,build,out,.git,coverage,.venv,__pycache__}/**';
      const files = await vscode.workspace.findFiles(includePattern, excludePattern);

      const targetFiles = files.filter((file) => !isIgnoredPath(file.fsPath));
      if (targetFiles.length === 0) {
        vscode.window.showWarningMessage('No supported files found for AI review.');
        this.logger.warn('No supported files found in workspace');
        return;
      }

      this.logger.info(`Found ${targetFiles.length} files to review`);

      const results: Array<{
        uri: vscode.Uri;
        summary: string;
        counts: { errors: number; warnings: number; hints: number };
      }> = [];

      let skippedCount = 0;
      let scannedCount = 0;
      let totalIssues = 0;
      const CONCURRENCY_LIMIT = 3;

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '$(robot) Reviewing workspace with AI...',
          cancellable: true
        },
        async (progress, token) => {
          for (let index = 0; index < targetFiles.length; index += CONCURRENCY_LIMIT) {
            if (token.isCancellationRequested) {
              this.logger.info('Workspace review cancelled by user');
              break;
            }

            const batch = targetFiles.slice(index, index + CONCURRENCY_LIMIT);
            const batchPromises: Promise<{ uri: vscode.Uri, summary: string, counts: any } | null>[] = batch.map(async (file) => {
              const fileName = path.basename(file.fsPath);
              progress.report({
                message: `${scannedCount + 1}/${targetFiles.length} files • ${totalIssues} issues found • ${fileName}`
              });

              const document = await vscode.workspace.openTextDocument(file);
              if (isIgnoredFile(document)) {
                this.logger.logFileSkipped(file.fsPath, 'ignored file type');
                skippedCount++;
                return null;
              }

              const code = document.getText();
              if (!code || code.trim().length === 0) {
                this.logger.logFileSkipped(file.fsPath, 'empty file');
                skippedCount++;
                return null;
              }

              const cached: ParsedReview | undefined = this.fileCache.get(document.uri, code);
              if (cached) {
                this.logger.info(`Using cached review for ${file.fsPath}`);
                this.reviewStore.set(document.uri, cached);
                this.diagnostics.update(document, cached);
                if (this.decorationProvider) {
                  this.decorationProvider.refresh(document.uri);
                }
                skippedCount++;

                const counts = {
                  errors: 0,
                  warnings: 0,
                  hints: cached.suggestions.length
                };

                totalIssues += counts.hints;

                return {
                  uri: document.uri,
                  summary: cached.summary,
                  counts
                };
              }

              const startTime = Date.now();
              try {
                const analysis = await this.apiClient.reviewCode(code, document.languageId);
                
                // Universal fault-tolerant parsing
                let parsed: ParsedReview;
                
                try {
                  let normalizedData: any;
                  
                  if (typeof analysis === 'string') {
                    try {
                      normalizedData = JSON.parse(analysis);
                    } catch {
                      normalizedData = { review: analysis };
                    }
                  } else {
                    normalizedData = analysis || {};
                  }

                  const safeData = {
                    score: Number(normalizedData.score) || 5,
                    summary: normalizedData.summary || normalizedData.review || 'AI review completed',
                    bugs: Array.isArray(normalizedData.bugs) ? normalizedData.bugs : [],
                    security: Array.isArray(normalizedData.security) ? normalizedData.security : [],
                    suggestions: Array.isArray(normalizedData.suggestions) ? normalizedData.suggestions : [],
                    review: normalizedData.review
                  };

                  parsed = parseReviewText(safeData.review || JSON.stringify(safeData));
                  parsed.score = parsed.score !== null ? parsed.score : safeData.score;
                  parsed.summary = parsed.summary || safeData.summary;
                  parsed.suggestions = Array.isArray(parsed.suggestions)
                    ? parsed.suggestions.map((s: any) => typeof s === 'string' ? { suggestion: s } : s)
                    : [];
                  
                } catch (parseError) {
                  // Absolute fallback
                  parsed = {
                    score: 5,
                    summary: 'AI review completed with limited data',
                    suggestions: [],
                    raw: JSON.stringify(analysis)
                  };
                }
                
                const duration = Date.now() - startTime;

                this.reviewStore.set(document.uri, parsed);
                this.diagnostics.update(document, parsed);
                this.fileCache.set(document.uri, code, parsed);

                if (this.decorationProvider) {
                  this.decorationProvider.refresh(document.uri);
                }

                const counts = {
                  errors: 0,
                  warnings: 0,
                  hints: parsed.suggestions.length
                };

                const issueCount = counts.hints;
                totalIssues += issueCount;
                scannedCount++;
                this.logger.logFileScanned(file.fsPath, issueCount, duration);

                return {
                  uri: document.uri,
                  summary: (cached && typeof cached === 'object' && 'summary' in cached && typeof (cached as ParsedReview).summary === 'string') ? (cached as ParsedReview).summary : '',
                  counts
                };
              } catch (error) {
                console.error(`Review error for ${file.fsPath}:`, error);
                this.logger.error(`Failed to review ${file.fsPath}`, error as Error);
                return null;
              }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter((r): r is NonNullable<typeof r> => r !== null));
          }
        }
      );

      if (results.length === 0) {
        vscode.window.showWarningMessage('No files were reviewed.');
        this.logger.warn('Workspace review completed with no results');
        return;
      }

      const workspaceDuration = Date.now() - workspaceStartTime;
      this.logger.logWorkspaceReview(targetFiles.length, scannedCount, skippedCount, workspaceDuration);
      this.logger.success(`Workspace review complete: ${results.length} files reviewed, ${skippedCount} skipped`);

      const items = results.map((result) => {
        const icon = result.counts.errors > 0
          ? '$(alert)'
          : result.counts.warnings > 0
            ? '$(warning)'
            : '$(check)';
        const statusText = result.counts.errors === 0 && result.counts.warnings === 0
          ? 'clean'
          : result.counts.errors > 0
            ? 'security risk'
            : `${result.counts.errors + result.counts.warnings} issues`;

        return {
          label: `${icon} ${path.basename(result.uri.fsPath)} — ${statusText}`,
          description: result.uri.fsPath,
          detail: result.summary,
          uri: result.uri
        };
      });

      const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'AI Review Complete (select a file to open)',
        title: `Reviewed ${results.length} files • ${skippedCount} skipped`
      });

      if (selection) {
        const doc = await vscode.workspace.openTextDocument(selection.uri);
        await vscode.window.showTextDocument(doc, { preview: false });
      }

      vscode.window.setStatusBarMessage(
        `$(check) AI Review Complete — ${results.length} files reviewed, ${skippedCount} unchanged`,
        4000
      );
    } catch (error) {
      console.error('Workspace review crashed:', error);
      this.logger.error('Workspace review failed', error as Error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred';
      vscode.window.showErrorMessage(
        `Workspace review failed: ${errorMessage}`
      );
      vscode.window.showErrorMessage('AI Workspace Review crashed. See Output logs.');
    }
  }

  /**
   * Disposes of resources
   */
  dispose(): void {
    // Clean up if needed
  }
}

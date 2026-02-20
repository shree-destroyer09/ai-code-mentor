/**
 * API Client for Backend Communication
 * 
 * Handles HTTP requests to the backend server for code analysis.
 */

import * as vscode from 'vscode';
import axios, { AxiosError } from 'axios';
import { CodeAnalysis, ApiError } from '../types';

const OUTPUT_CHANNEL_NAME = 'AI Code Mentor';
let outputChannel: vscode.OutputChannel | undefined;
function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  }
  return outputChannel;
}

/**
 * Client for communicating with the AI Code Mentor backend
 */
export class ApiClient {
  private apiUrl: string;
    public getBackendUrl(): string {
      return this.apiUrl;
    }
  private timeout: number;
  private maxRetries: number;

  constructor() {
    // Get API URL from configuration
    const config = vscode.workspace.getConfiguration('aiCodeMentor');
    // Always use deployed backend unless overridden
    this.apiUrl = config.get<string>('apiUrl') || 'https://ai-code-mentor-p61w.onrender.com';
    if (!this.apiUrl) {
      throw new Error('API URL is not set. Please configure aiCodeMentor.apiUrl in your VS Code settings.');
    }
    this.timeout = config.get<number>('timeout') || 30000; // 30 seconds default
    this.maxRetries = 2;
  }

  /**
   * Sends code to the backend for analysis
   * 
   * @param code - The source code to analyze
   * @param language - Optional language identifier
   * @returns Promise resolving to code analysis result
   */
  async reviewCode(code: string, language?: string): Promise<CodeAnalysis> {
    const channel = getOutputChannel();
    let lastError: any = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Always POST to /review endpoint
        const url = this.apiUrl.endsWith('/review')
          ? this.apiUrl
          : this.apiUrl.replace(/\/$/, '') + '/review';
        channel.appendLine(`[API Client] Sending code to backend: ${url}`);
        const response = await axios.post<CodeAnalysis>(
          url,
          { code, language },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        channel.appendLine('[API Client] Successfully received analysis from backend');
        return response.data;
      } catch (error) {
        lastError = error;
        channel.appendLine(`[API Client] Error during code review (attempt ${attempt + 1}): ${error instanceof Error ? error.message : String(error)}`);
        vscode.window.showErrorMessage('AI Code Mentor: Backend request failed. Please check your internet connection or try again later.');
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiError>;
          if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
            if (attempt < this.maxRetries) {
              channel.appendLine(`[API Client] Retrying... (${attempt + 1}/${this.maxRetries})`);
              await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
              continue;
            } else {
              throw new Error(`Cannot connect to backend server at ${this.apiUrl}. Please ensure the backend server is running.`);
            }
          }
          if (axiosError.response) {
            const status = axiosError.response.status;
            const errorData = axiosError.response.data;
            if (status === 400) {
              throw new Error(`Bad request: ${errorData.message || 'Invalid code provided'}`);
            }
            if (status === 429) {
              throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            }
            if (status === 500) {
              throw new Error(`Server error: ${errorData.message || 'The backend encountered an error'}`);
            }
            throw new Error(errorData.message || `Server returned error status ${status}`);
          }
        }
        // For other errors, do not retry
        break;
      }
    }
    // Generic error
    throw new Error(
      lastError instanceof Error
        ? lastError.message
        : 'An unexpected error occurred during code analysis'
    );
  }

  /**
   * Checks if the backend server is running and responsive
   * 
   * @returns Promise resolving to true if backend is available
   */
  async checkBackendHealth(): Promise<boolean> {
    const channel = getOutputChannel();
    try {
      const response = await axios.get(this.apiUrl.replace(/\/api\/review$/, '/health'), {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      channel.appendLine(`[API Client] Backend health check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Gets the current backend URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Updates the backend URL (useful for settings changes)
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }
}

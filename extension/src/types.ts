/**
 * Type Definitions for AI Code Mentor Extension
 * 
 * Defines interfaces and types used throughout the extension.
 */

/**
 * Complete code analysis result from the backend
 * Backend now returns structured JSON or fallback text
 */
export interface CodeAnalysis {
  review?: string; // Legacy text-based review
  // Structured JSON format
  score?: number;
  summary?: string;
  bugs?: Array<{ line?: number; message: string; severity?: string }>;
  security?: Array<{ line?: number; risk: string; fix?: string }>;
  suggestions?: Array<{ line?: number; suggestion: string }>;
}

/**
 * Parsed review result derived from the AI response
 */
export interface ReviewIssue {
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number; // 1-based line number if detected
}

export interface ParsedReview {
  summary: string;
  suggestions: { suggestion: string; line?: number }[];
  score: number | null;
  issues?: { issue: string; line?: number }[];
  security?: { security: string; line?: number }[];
  raw: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  stack?: string;
}

/**
 * Configuration settings for the extension
 */
export interface ExtensionConfig {
  backendUrl: string;
  timeout: number;
}

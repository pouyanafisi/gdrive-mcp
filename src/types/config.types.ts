/**
 * Configuration types for GDrive MCP
 */

export interface AuthConfig {
  configDir?: string;
  oauthPath?: string;
  credentialsPath?: string;
  callbackUrl?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  shared?: boolean;
  trashed?: boolean;
}

export interface DriveFolder extends DriveFile {
  mimeType: 'application/vnd.google-apps.folder';
}

export interface SearchOptions {
  query?: string;
  mimeType?: string;
  folderId?: string;
  trashed?: boolean;
  maxResults?: number;
  orderBy?: string;
}

export interface CreateOptions {
  name: string;
  mimeType?: string;
  parents?: string[];
  description?: string;
}

export interface UpdateOptions {
  name?: string;
  description?: string;
  addParents?: string[];
  removeParents?: string[];
  trashed?: boolean;
}

export interface SpreadsheetData {
  range: string;
  values: string[][];
}

export interface DocumentContent {
  title: string;
  body: string;
}


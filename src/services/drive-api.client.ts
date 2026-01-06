/**
 * Google Drive API Client
 */

import { google, drive_v3, docs_v1, sheets_v4 } from 'googleapis';
import { AuthService } from './auth.service.js';
import { createAPIError } from '../utils/error.util.js';

/**
 * Client for interacting with Google Drive, Docs, and Sheets APIs
 */
export class DriveAPIClient {
  private drive: drive_v3.Drive;
  private docs: docs_v1.Docs;
  private sheets: sheets_v4.Sheets;

  constructor(private readonly authService: AuthService) {
    const auth = this.authService.getOAuth2Client();
    this.drive = google.drive({ version: 'v3', auth });
    this.docs = google.docs({ version: 'v1', auth });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  /**
   * Gets the Drive API instance
   */
  getDrive(): drive_v3.Drive {
    return this.drive;
  }

  /**
   * Gets the Docs API instance
   */
  getDocs(): docs_v1.Docs {
    return this.docs;
  }

  /**
   * Gets the Sheets API instance
   */
  getSheets(): sheets_v4.Sheets {
    return this.sheets;
  }

  /**
   * Lists files with optional query
   */
  async listFiles(options: {
    query?: string;
    pageSize?: number;
    pageToken?: string;
    fields?: string;
    orderBy?: string;
  } = {}): Promise<drive_v3.Schema$FileList> {
    try {
      const response = await this.drive.files.list({
        q: options.query,
        pageSize: options.pageSize || 100,
        pageToken: options.pageToken,
        fields: options.fields || 'nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, webContentLink, owners, shared, trashed)',
        orderBy: options.orderBy || 'modifiedTime desc',
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to list files: ${(error as Error).message}`, error);
    }
  }

  /**
   * Gets a file by ID
   */
  async getFile(fileId: string, fields?: string): Promise<drive_v3.Schema$File> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: fields || 'id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, webContentLink, owners, shared, trashed, description',
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to get file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Creates a file
   */
  async createFile(metadata: drive_v3.Schema$File, media?: { mimeType: string; body: string }): Promise<drive_v3.Schema$File> {
    try {
      const response = await this.drive.files.create({
        requestBody: metadata,
        media: media,
        fields: 'id, name, mimeType, parents, webViewLink',
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to create file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Updates a file
   */
  async updateFile(fileId: string, metadata: drive_v3.Schema$File): Promise<drive_v3.Schema$File> {
    try {
      const response = await this.drive.files.update({
        fileId,
        requestBody: metadata,
        fields: 'id, name, mimeType, parents, webViewLink',
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to update file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Deletes a file (permanently)
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId });
    } catch (error) {
      throw createAPIError(`Failed to delete file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Moves a file to trash
   */
  async trashFile(fileId: string): Promise<drive_v3.Schema$File> {
    try {
      const response = await this.drive.files.update({
        fileId,
        requestBody: { trashed: true },
        fields: 'id, name, trashed',
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to trash file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Copies a file
   */
  async copyFile(fileId: string, name: string, parents?: string[]): Promise<drive_v3.Schema$File> {
    try {
      const response = await this.drive.files.copy({
        fileId,
        requestBody: { name, parents },
        fields: 'id, name, mimeType, parents, webViewLink',
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to copy file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Downloads file content
   */
  async downloadFile(fileId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media',
      }, {
        responseType: 'text',
      });
      return response.data as string;
    } catch (error) {
      throw createAPIError(`Failed to download file: ${(error as Error).message}`, error);
    }
  }

  /**
   * Exports a Google Workspace file
   */
  async exportFile(fileId: string, mimeType: string): Promise<string> {
    try {
      const response = await this.drive.files.export({
        fileId,
        mimeType,
      }, {
        responseType: 'text',
      });
      return response.data as string;
    } catch (error) {
      throw createAPIError(`Failed to export file: ${(error as Error).message}`, error);
    }
  }

  // Google Docs operations

  /**
   * Gets a Google Doc
   */
  async getDocument(documentId: string): Promise<docs_v1.Schema$Document> {
    try {
      const response = await this.docs.documents.get({ documentId });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to get document: ${(error as Error).message}`, error);
    }
  }

  /**
   * Updates a Google Doc with batch updates
   */
  async batchUpdateDocument(documentId: string, requests: docs_v1.Schema$Request[]): Promise<docs_v1.Schema$BatchUpdateDocumentResponse> {
    try {
      const response = await this.docs.documents.batchUpdate({
        documentId,
        requestBody: { requests },
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to update document: ${(error as Error).message}`, error);
    }
  }

  // Google Sheets operations

  /**
   * Gets a Google Sheet
   */
  async getSpreadsheet(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
    try {
      const response = await this.sheets.spreadsheets.get({ spreadsheetId });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to get spreadsheet: ${(error as Error).message}`, error);
    }
  }

  /**
   * Gets values from a Google Sheet
   */
  async getSpreadsheetValues(spreadsheetId: string, range: string): Promise<sheets_v4.Schema$ValueRange> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to get spreadsheet values: ${(error as Error).message}`, error);
    }
  }

  /**
   * Updates values in a Google Sheet
   */
  async updateSpreadsheetValues(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$UpdateValuesResponse> {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption,
        requestBody: { values },
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to update spreadsheet values: ${(error as Error).message}`, error);
    }
  }

  /**
   * Appends values to a Google Sheet
   */
  async appendSpreadsheetValues(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        requestBody: { values },
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to append spreadsheet values: ${(error as Error).message}`, error);
    }
  }

  /**
   * Clears values in a Google Sheet
   */
  async clearSpreadsheetValues(spreadsheetId: string, range: string): Promise<sheets_v4.Schema$ClearValuesResponse> {
    try {
      const response = await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
        requestBody: {},
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to clear spreadsheet values: ${(error as Error).message}`, error);
    }
  }

  /**
   * Batch updates a Google Sheet
   */
  async batchUpdateSpreadsheet(
    spreadsheetId: string,
    requests: sheets_v4.Schema$Request[]
  ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
      return response.data;
    } catch (error) {
      throw createAPIError(`Failed to batch update spreadsheet: ${(error as Error).message}`, error);
    }
  }
}


/**
 * Spreadsheet service for Google Sheets operations
 */

import { sheets_v4 } from 'googleapis';
import { DriveAPIClient } from './drive-api.client.js';
import { DriveFile } from '../types/config.types.js';
import { createValidationError, createNotFoundError } from '../utils/error.util.js';

const SHEETS_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

/**
 * Service for managing Google Sheets
 */
export class SpreadsheetService {
  constructor(private readonly driveClient: DriveAPIClient) {}

  /**
   * Creates a new Google Sheet
   */
  async createSpreadsheet(title: string, parentId?: string): Promise<DriveFile> {
    if (!title) {
      throw createValidationError('Spreadsheet title is required');
    }

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: title,
      mimeType: SHEETS_MIME_TYPE,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const sheet = await this.driveClient.createFile(metadata);
    return sheet as DriveFile;
  }

  /**
   * Gets a Google Sheet
   */
  async getSpreadsheet(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
    const sheet = await this.driveClient.getSpreadsheet(spreadsheetId);
    if (!sheet.spreadsheetId) {
      throw createNotFoundError('Spreadsheet', spreadsheetId);
    }
    return sheet;
  }

  /**
   * Gets spreadsheet metadata
   */
  async getSpreadsheetInfo(spreadsheetId: string): Promise<{
    title: string;
    sheets: Array<{ id: number; title: string; rowCount: number; columnCount: number }>;
    locale: string;
    webViewLink: string;
  }> {
    const spreadsheet = await this.getSpreadsheet(spreadsheetId);

    const sheets = (spreadsheet.sheets || []).map(sheet => ({
      id: sheet.properties?.sheetId || 0,
      title: sheet.properties?.title || 'Untitled',
      rowCount: sheet.properties?.gridProperties?.rowCount || 0,
      columnCount: sheet.properties?.gridProperties?.columnCount || 0,
    }));

    return {
      title: spreadsheet.properties?.title || 'Untitled',
      sheets,
      locale: spreadsheet.properties?.locale || 'en_US',
      webViewLink: spreadsheet.spreadsheetUrl || '',
    };
  }

  /**
   * Reads values from a spreadsheet range
   */
  async readValues(spreadsheetId: string, range: string): Promise<string[][]> {
    const response = await this.driveClient.getSpreadsheetValues(spreadsheetId, range);
    return (response.values || []) as string[][];
  }

  /**
   * Reads an entire sheet
   */
  async readSheet(spreadsheetId: string, sheetName?: string): Promise<{
    sheetName: string;
    values: string[][];
    rowCount: number;
    columnCount: number;
  }> {
    const info = await this.getSpreadsheetInfo(spreadsheetId);
    const targetSheet = sheetName 
      ? info.sheets.find(s => s.title === sheetName)
      : info.sheets[0];

    if (!targetSheet) {
      throw createNotFoundError('Sheet', sheetName || 'default');
    }

    const range = `'${targetSheet.title}'`;
    const values = await this.readValues(spreadsheetId, range);

    return {
      sheetName: targetSheet.title,
      values,
      rowCount: values.length,
      columnCount: values[0]?.length || 0,
    };
  }

  /**
   * Writes values to a spreadsheet range
   */
  async writeValues(
    spreadsheetId: string,
    range: string,
    values: string[][],
    inputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<{ updatedCells: number; updatedRows: number; updatedColumns: number }> {
    const response = await this.driveClient.updateSpreadsheetValues(
      spreadsheetId,
      range,
      values,
      inputOption
    );

    return {
      updatedCells: response.updatedCells || 0,
      updatedRows: response.updatedRows || 0,
      updatedColumns: response.updatedColumns || 0,
    };
  }

  /**
   * Appends values to a spreadsheet
   */
  async appendValues(
    spreadsheetId: string,
    range: string,
    values: string[][],
    inputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<{ updatedCells: number; updatedRange: string }> {
    const response = await this.driveClient.appendSpreadsheetValues(
      spreadsheetId,
      range,
      values,
      inputOption
    );

    return {
      updatedCells: response.updates?.updatedCells || 0,
      updatedRange: response.updates?.updatedRange || '',
    };
  }

  /**
   * Clears values from a spreadsheet range
   */
  async clearValues(spreadsheetId: string, range: string): Promise<void> {
    await this.driveClient.clearSpreadsheetValues(spreadsheetId, range);
  }

  /**
   * Adds a new sheet to a spreadsheet
   */
  async addSheet(spreadsheetId: string, title: string): Promise<{ sheetId: number; title: string }> {
    const response = await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        addSheet: {
          properties: {
            title,
          },
        },
      },
    ]);

    const reply = response.replies?.[0]?.addSheet;
    return {
      sheetId: reply?.properties?.sheetId || 0,
      title: reply?.properties?.title || title,
    };
  }

  /**
   * Deletes a sheet from a spreadsheet
   */
  async deleteSheet(spreadsheetId: string, sheetId: number): Promise<void> {
    await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        deleteSheet: {
          sheetId,
        },
      },
    ]);
  }

  /**
   * Renames a sheet
   */
  async renameSheet(spreadsheetId: string, sheetId: number, newTitle: string): Promise<void> {
    await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            title: newTitle,
          },
          fields: 'title',
        },
      },
    ]);
  }

  /**
   * Inserts rows into a sheet
   */
  async insertRows(
    spreadsheetId: string,
    sheetId: number,
    startIndex: number,
    numRows: number
  ): Promise<void> {
    await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        insertDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex,
            endIndex: startIndex + numRows,
          },
          inheritFromBefore: startIndex > 0,
        },
      },
    ]);
  }

  /**
   * Inserts columns into a sheet
   */
  async insertColumns(
    spreadsheetId: string,
    sheetId: number,
    startIndex: number,
    numColumns: number
  ): Promise<void> {
    await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        insertDimension: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex,
            endIndex: startIndex + numColumns,
          },
          inheritFromBefore: startIndex > 0,
        },
      },
    ]);
  }

  /**
   * Deletes rows from a sheet
   */
  async deleteRows(
    spreadsheetId: string,
    sheetId: number,
    startIndex: number,
    numRows: number
  ): Promise<void> {
    await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex,
            endIndex: startIndex + numRows,
          },
        },
      },
    ]);
  }

  /**
   * Deletes columns from a sheet
   */
  async deleteColumns(
    spreadsheetId: string,
    sheetId: number,
    startIndex: number,
    numColumns: number
  ): Promise<void> {
    await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex,
            endIndex: startIndex + numColumns,
          },
        },
      },
    ]);
  }

  /**
   * Finds and replaces text in a spreadsheet
   */
  async findReplace(
    spreadsheetId: string,
    find: string,
    replace: string,
    matchCase: boolean = false,
    matchEntireCell: boolean = false
  ): Promise<{ occurrencesChanged: number }> {
    const response = await this.driveClient.batchUpdateSpreadsheet(spreadsheetId, [
      {
        findReplace: {
          find,
          replacement: replace,
          matchCase,
          matchEntireCell,
          allSheets: true,
        },
      },
    ]);

    return {
      occurrencesChanged: response.replies?.[0]?.findReplace?.occurrencesChanged || 0,
    };
  }

  /**
   * Lists all Google Sheets
   */
  async listSpreadsheets(maxResults: number = 50): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      query: `mimeType = '${SHEETS_MIME_TYPE}' and trashed = false`,
      pageSize: maxResults,
      orderBy: 'modifiedTime desc',
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Searches for Google Sheets by name
   */
  async searchSpreadsheets(name: string, maxResults: number = 50): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      query: `name contains '${name}' and mimeType = '${SHEETS_MIME_TYPE}' and trashed = false`,
      pageSize: maxResults,
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Exports a Google Sheet to a specific format
   */
  async exportSpreadsheet(spreadsheetId: string, format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'): Promise<string> {
    const mimeTypes = {
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      pdf: 'application/pdf',
    };

    return this.driveClient.exportFile(spreadsheetId, mimeTypes[format]);
  }

  /**
   * Creates a spreadsheet from CSV data
   */
  async createFromCSV(title: string, csvData: string, parentId?: string): Promise<DriveFile> {
    // First create the spreadsheet
    const spreadsheet = await this.createSpreadsheet(title, parentId);

    // Parse CSV and write values
    const rows = csvData.split('\n').map(row => {
      // Simple CSV parsing (handles basic cases)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of row) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });

    if (rows.length > 0 && spreadsheet.id) {
      await this.writeValues(spreadsheet.id, 'A1', rows);
    }

    return spreadsheet;
  }
}


/**
 * Zod schemas for tool input validation
 */

import { z } from 'zod';

// ============= File Operations =============

export const SearchFilesSchema = z.object({
  query: z.string().optional().describe('Search query for file content'),
  mimeType: z.string().optional().describe('Filter by MIME type (e.g., "application/pdf")'),
  folderId: z.string().optional().describe('Search within a specific folder'),
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results to return'),
}).describe('Search for files in Google Drive');

export const GetFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the file to retrieve'),
}).describe('Get file metadata');

export const CreateFileSchema = z.object({
  name: z.string().min(1).describe('Name of the file (extension determines type: .md, .json, .txt, .csv, .js, .py, etc.)'),
  mimeType: z.string().optional().describe('MIME type (auto-detected from extension if not provided)'),
  content: z.string().optional().describe('File content'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a new file with automatic type detection');

export const UploadFileSchema = z.object({
  name: z.string().min(1).describe('File name with extension (.md, .json, .txt, .csv, .js, .py, .html, .css, etc.)'),
  content: z.string().min(1).describe('File content'),
  parentId: z.string().optional().describe('Parent folder ID'),
  mimeType: z.string().optional().describe('Override MIME type (auto-detected from extension if not provided)'),
}).describe('Upload a file with automatic MIME type detection based on extension');

export const CreateGoogleDocSchema = z.object({
  title: z.string().min(1).describe('Document title'),
  content: z.string().optional().describe('Initial text content'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a new Google Doc');

export const CreateGoogleSheetSchema = z.object({
  title: z.string().min(1).describe('Spreadsheet title'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a new Google Sheet');

export const CreateGoogleSlidesSchema = z.object({
  title: z.string().min(1).describe('Presentation title'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a new Google Slides presentation');

export const UpdateFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the file to update'),
  name: z.string().optional().describe('New file name'),
  description: z.string().optional().describe('New file description'),
}).describe('Update file metadata');

export const DeleteFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the file to delete'),
  permanent: z.boolean().optional().default(false).describe('Permanently delete (true) or move to trash (false)'),
}).describe('Delete a file');

export const MoveFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the file to move'),
  newParentId: z.string().min(1).describe('ID of the destination folder'),
}).describe('Move a file to a different folder');

export const CopyFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the file to copy'),
  name: z.string().min(1).describe('Name for the copy'),
  parentId: z.string().optional().describe('Parent folder for the copy'),
}).describe('Copy a file');

export const DownloadFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the file to download'),
}).describe('Download file content');

export const ExportFileSchema = z.object({
  fileId: z.string().min(1).describe('ID of the Google Workspace file to export'),
  format: z.enum(['pdf', 'docx', 'xlsx', 'csv', 'txt', 'html']).describe('Export format'),
}).describe('Export a Google Workspace file');

export const ListRecentFilesSchema = z.object({
  maxResults: z.number().int().positive().max(100).optional().default(20).describe('Maximum results'),
}).describe('List recently viewed files');

export const ListSharedFilesSchema = z.object({
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('List files shared with me');

export const ListTrashedFilesSchema = z.object({
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('List files in trash');

// ============= Folder Operations =============

export const CreateFolderSchema = z.object({
  name: z.string().min(1).describe('Name of the folder'),
  parentId: z.string().optional().describe('Parent folder ID (defaults to root)'),
}).describe('Create a new folder');

export const GetFolderSchema = z.object({
  folderId: z.string().min(1).describe('ID of the folder'),
}).describe('Get folder metadata');

export const ListFoldersSchema = z.object({
  parentId: z.string().optional().describe('Parent folder ID to list from'),
  maxResults: z.number().int().positive().max(100).optional().default(100).describe('Maximum results'),
}).describe('List folders');

export const ListFolderContentsSchema = z.object({
  folderId: z.string().min(1).describe('ID of the folder'),
  maxResults: z.number().int().positive().max(100).optional().default(100).describe('Maximum results'),
}).describe('List contents of a folder');

export const UpdateFolderSchema = z.object({
  folderId: z.string().min(1).describe('ID of the folder to update'),
  name: z.string().optional().describe('New folder name'),
}).describe('Update folder metadata');

export const MoveFolderSchema = z.object({
  folderId: z.string().min(1).describe('ID of the folder to move'),
  newParentId: z.string().min(1).describe('ID of the destination folder'),
}).describe('Move a folder');

export const DeleteFolderSchema = z.object({
  folderId: z.string().min(1).describe('ID of the folder to delete'),
  permanent: z.boolean().optional().default(false).describe('Permanently delete (true) or move to trash (false)'),
}).describe('Delete a folder');

export const CreateFolderPathSchema = z.object({
  path: z.string().min(1).describe('Folder path (e.g., "Projects/2024/Reports")'),
}).describe('Create folders from a path (creates intermediate folders if needed)');

export const SearchFoldersSchema = z.object({
  name: z.string().min(1).describe('Folder name to search for'),
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('Search for folders by name');

// ============= Document Operations =============

export const CreateDocumentSchema = z.object({
  title: z.string().min(1).describe('Title of the document'),
  content: z.string().optional().describe('Initial text content'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a new Google Doc');

export const ReadDocumentSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
}).describe('Read content from a Google Doc');

export const UpdateDocumentSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
  content: z.string().describe('New content (replaces all existing content)'),
}).describe('Update a Google Doc with new content');

export const AppendToDocumentSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
  text: z.string().min(1).describe('Text to append'),
}).describe('Append text to a Google Doc');

export const ReplaceInDocumentSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
  searchText: z.string().min(1).describe('Text to find'),
  replaceText: z.string().describe('Replacement text'),
}).describe('Find and replace text in a Google Doc');

export const AddHeadingSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
  text: z.string().min(1).describe('Heading text'),
  level: z.enum(['HEADING_1', 'HEADING_2', 'HEADING_3', 'HEADING_4', 'HEADING_5', 'HEADING_6']).optional().default('HEADING_1').describe('Heading level'),
}).describe('Add a heading to a Google Doc');

export const AddBulletListSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
  items: z.array(z.string()).min(1).describe('List items'),
}).describe('Add a bullet list to a Google Doc');

export const ListDocumentsSchema = z.object({
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('List all Google Docs');

export const SearchDocumentsSchema = z.object({
  name: z.string().min(1).describe('Document name to search for'),
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('Search for Google Docs by name');

export const ExportDocumentSchema = z.object({
  documentId: z.string().min(1).describe('ID of the document'),
  format: z.enum(['pdf', 'docx', 'txt', 'html']).optional().default('pdf').describe('Export format'),
}).describe('Export a Google Doc');

// ============= Spreadsheet Operations =============

export const CreateSpreadsheetSchema = z.object({
  title: z.string().min(1).describe('Title of the spreadsheet'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a new Google Sheet');

export const GetSpreadsheetInfoSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
}).describe('Get spreadsheet metadata');

export const ReadSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  range: z.string().min(1).describe('Range to read (e.g., "Sheet1!A1:D10")'),
}).describe('Read values from a Google Sheet');

export const ReadSheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  sheetName: z.string().optional().describe('Sheet name (defaults to first sheet)'),
}).describe('Read an entire sheet');

export const WriteSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  range: z.string().min(1).describe('Range to write to (e.g., "Sheet1!A1")'),
  values: z.array(z.array(z.string())).min(1).describe('2D array of values'),
  inputOption: z.enum(['RAW', 'USER_ENTERED']).optional().default('USER_ENTERED').describe('How to interpret values'),
}).describe('Write values to a Google Sheet');

export const AppendToSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  range: z.string().min(1).describe('Range to append to (e.g., "Sheet1!A:A")'),
  values: z.array(z.array(z.string())).min(1).describe('2D array of values to append'),
  inputOption: z.enum(['RAW', 'USER_ENTERED']).optional().default('USER_ENTERED').describe('How to interpret values'),
}).describe('Append values to a Google Sheet');

export const ClearSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  range: z.string().min(1).describe('Range to clear (e.g., "Sheet1!A1:D10")'),
}).describe('Clear values from a Google Sheet');

export const AddSheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  title: z.string().min(1).describe('Title for the new sheet'),
}).describe('Add a new sheet to a spreadsheet');

export const DeleteSheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  sheetId: z.number().int().describe('ID of the sheet to delete'),
}).describe('Delete a sheet from a spreadsheet');

export const RenameSheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  sheetId: z.number().int().describe('ID of the sheet to rename'),
  newTitle: z.string().min(1).describe('New title for the sheet'),
}).describe('Rename a sheet');

export const FindReplaceInSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  find: z.string().min(1).describe('Text to find'),
  replace: z.string().describe('Replacement text'),
  matchCase: z.boolean().optional().default(false).describe('Match case'),
  matchEntireCell: z.boolean().optional().default(false).describe('Match entire cell'),
}).describe('Find and replace in a spreadsheet');

export const ListSpreadsheetsSchema = z.object({
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('List all Google Sheets');

export const SearchSpreadsheetsSchema = z.object({
  name: z.string().min(1).describe('Spreadsheet name to search for'),
  maxResults: z.number().int().positive().max(100).optional().default(50).describe('Maximum results'),
}).describe('Search for Google Sheets by name');

export const ExportSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1).describe('ID of the spreadsheet'),
  format: z.enum(['xlsx', 'csv', 'pdf']).optional().default('xlsx').describe('Export format'),
}).describe('Export a Google Sheet');

export const CreateSpreadsheetFromCSVSchema = z.object({
  title: z.string().min(1).describe('Title of the spreadsheet'),
  csvData: z.string().min(1).describe('CSV data to import'),
  parentId: z.string().optional().describe('Parent folder ID'),
}).describe('Create a spreadsheet from CSV data');


/**
 * MCP tool handlers for Google Drive
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FileService } from '../services/file.service.js';
import { FolderService } from '../services/folder.service.js';
import { DocumentService } from '../services/document.service.js';
import { SpreadsheetService } from '../services/spreadsheet.service.js';
import { GDriveMCPError } from '../utils/error.util.js';
import * as schemas from '../schemas/tool.schemas.js';

/**
 * Tool handler dependencies
 */
export interface ToolHandlerDependencies {
  fileService: FileService;
  folderService: FolderService;
  documentService: DocumentService;
  spreadsheetService: SpreadsheetService;
}

/**
 * Tool definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
}

/**
 * Gets all tool definitions
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    // File operations
    { name: 'search_files', description: 'Search for files in Google Drive', inputSchema: schemas.SearchFilesSchema },
    { name: 'get_file', description: 'Get file metadata', inputSchema: schemas.GetFileSchema },
    { name: 'create_file', description: 'Create a new file with auto type detection', inputSchema: schemas.CreateFileSchema },
    { name: 'upload_file', description: 'Upload file with auto MIME type from extension (.md, .json, .txt, .csv, etc.)', inputSchema: schemas.UploadFileSchema },
    { name: 'create_google_doc', description: 'Create a new Google Doc', inputSchema: schemas.CreateGoogleDocSchema },
    { name: 'create_google_sheet', description: 'Create a new Google Sheet', inputSchema: schemas.CreateGoogleSheetSchema },
    { name: 'create_google_slides', description: 'Create a new Google Slides presentation', inputSchema: schemas.CreateGoogleSlidesSchema },
    { name: 'update_file', description: 'Update file metadata', inputSchema: schemas.UpdateFileSchema },
    { name: 'delete_file', description: 'Delete a file', inputSchema: schemas.DeleteFileSchema },
    { name: 'move_file', description: 'Move a file to a different folder', inputSchema: schemas.MoveFileSchema },
    { name: 'copy_file', description: 'Copy a file', inputSchema: schemas.CopyFileSchema },
    { name: 'download_file', description: 'Download file content', inputSchema: schemas.DownloadFileSchema },
    { name: 'export_file', description: 'Export a Google Workspace file', inputSchema: schemas.ExportFileSchema },
    { name: 'list_recent_files', description: 'List recently viewed files', inputSchema: schemas.ListRecentFilesSchema },
    { name: 'list_shared_files', description: 'List files shared with me', inputSchema: schemas.ListSharedFilesSchema },
    { name: 'list_trashed_files', description: 'List files in trash', inputSchema: schemas.ListTrashedFilesSchema },

    // Folder operations
    { name: 'create_folder', description: 'Create a new folder', inputSchema: schemas.CreateFolderSchema },
    { name: 'get_folder', description: 'Get folder metadata', inputSchema: schemas.GetFolderSchema },
    { name: 'list_folders', description: 'List folders', inputSchema: schemas.ListFoldersSchema },
    { name: 'list_folder_contents', description: 'List contents of a folder', inputSchema: schemas.ListFolderContentsSchema },
    { name: 'update_folder', description: 'Update folder metadata', inputSchema: schemas.UpdateFolderSchema },
    { name: 'move_folder', description: 'Move a folder', inputSchema: schemas.MoveFolderSchema },
    { name: 'delete_folder', description: 'Delete a folder', inputSchema: schemas.DeleteFolderSchema },
    { name: 'create_folder_path', description: 'Create folders from a path', inputSchema: schemas.CreateFolderPathSchema },
    { name: 'search_folders', description: 'Search for folders by name', inputSchema: schemas.SearchFoldersSchema },

    // Document operations
    { name: 'create_document', description: 'Create a new Google Doc', inputSchema: schemas.CreateDocumentSchema },
    { name: 'read_document', description: 'Read content from a Google Doc', inputSchema: schemas.ReadDocumentSchema },
    { name: 'update_document', description: 'Update a Google Doc with new content', inputSchema: schemas.UpdateDocumentSchema },
    { name: 'append_to_document', description: 'Append text to a Google Doc', inputSchema: schemas.AppendToDocumentSchema },
    { name: 'replace_in_document', description: 'Find and replace text in a Google Doc', inputSchema: schemas.ReplaceInDocumentSchema },
    { name: 'add_heading', description: 'Add a heading to a Google Doc', inputSchema: schemas.AddHeadingSchema },
    { name: 'add_bullet_list', description: 'Add a bullet list to a Google Doc', inputSchema: schemas.AddBulletListSchema },
    { name: 'list_documents', description: 'List all Google Docs', inputSchema: schemas.ListDocumentsSchema },
    { name: 'search_documents', description: 'Search for Google Docs by name', inputSchema: schemas.SearchDocumentsSchema },
    { name: 'export_document', description: 'Export a Google Doc', inputSchema: schemas.ExportDocumentSchema },

    // Spreadsheet operations
    { name: 'create_spreadsheet', description: 'Create a new Google Sheet', inputSchema: schemas.CreateSpreadsheetSchema },
    { name: 'get_spreadsheet_info', description: 'Get spreadsheet metadata', inputSchema: schemas.GetSpreadsheetInfoSchema },
    { name: 'read_spreadsheet', description: 'Read values from a Google Sheet', inputSchema: schemas.ReadSpreadsheetSchema },
    { name: 'read_sheet', description: 'Read an entire sheet', inputSchema: schemas.ReadSheetSchema },
    { name: 'write_spreadsheet', description: 'Write values to a Google Sheet', inputSchema: schemas.WriteSpreadsheetSchema },
    { name: 'append_to_spreadsheet', description: 'Append values to a Google Sheet', inputSchema: schemas.AppendToSpreadsheetSchema },
    { name: 'clear_spreadsheet', description: 'Clear values from a Google Sheet', inputSchema: schemas.ClearSpreadsheetSchema },
    { name: 'add_sheet', description: 'Add a new sheet to a spreadsheet', inputSchema: schemas.AddSheetSchema },
    { name: 'delete_sheet', description: 'Delete a sheet from a spreadsheet', inputSchema: schemas.DeleteSheetSchema },
    { name: 'rename_sheet', description: 'Rename a sheet', inputSchema: schemas.RenameSheetSchema },
    { name: 'find_replace_in_spreadsheet', description: 'Find and replace in a spreadsheet', inputSchema: schemas.FindReplaceInSpreadsheetSchema },
    { name: 'list_spreadsheets', description: 'List all Google Sheets', inputSchema: schemas.ListSpreadsheetsSchema },
    { name: 'search_spreadsheets', description: 'Search for Google Sheets by name', inputSchema: schemas.SearchSpreadsheetsSchema },
    { name: 'export_spreadsheet', description: 'Export a Google Sheet', inputSchema: schemas.ExportSpreadsheetSchema },
    { name: 'create_spreadsheet_from_csv', description: 'Create a spreadsheet from CSV data', inputSchema: schemas.CreateSpreadsheetFromCSVSchema },
  ];
}

/**
 * Converts tool definitions to MCP tool format
 */
export function toolsToMCPFormat(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.inputSchema),
  }));
}

/**
 * Formats a file for display
 */
function formatFile(file: { id?: string; name?: string; mimeType?: string; webViewLink?: string; modifiedTime?: string; size?: string }) {
  return `ID: ${file.id}\nName: ${file.name}\nType: ${file.mimeType}\nLink: ${file.webViewLink || 'N/A'}\nModified: ${file.modifiedTime || 'N/A'}\nSize: ${file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'N/A'}`;
}

/**
 * Handles tool execution
 */
export async function handleTool(
  toolName: string,
  args: unknown,
  deps: ToolHandlerDependencies
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { fileService, folderService, documentService, spreadsheetService } = deps;

  try {
    switch (toolName) {
      // ============= File Operations =============
      case 'search_files': {
        const { query, mimeType, folderId, maxResults } = schemas.SearchFilesSchema.parse(args);
        const files = await fileService.searchFiles({ query, mimeType, folderId, maxResults });
        const text = files.length > 0
          ? `Found ${files.length} files:\n\n${files.map(formatFile).join('\n\n')}`
          : 'No files found.';
        return { content: [{ type: 'text', text }] };
      }

      case 'get_file': {
        const { fileId } = schemas.GetFileSchema.parse(args);
        const file = await fileService.getFile(fileId);
        return { content: [{ type: 'text', text: formatFile(file) }] };
      }

      case 'create_file': {
        const { name, mimeType, content, parentId } = schemas.CreateFileSchema.parse(args);
        const file = await fileService.createFile(name, mimeType, content, parentId);
        return { content: [{ type: 'text', text: `File created:\n${formatFile(file)}` }] };
      }

      case 'upload_file': {
        const { name, content, parentId, mimeType } = schemas.UploadFileSchema.parse(args);
        const file = await fileService.uploadFile(name, content, parentId, mimeType);
        return { content: [{ type: 'text', text: `File uploaded:\n${formatFile(file)}` }] };
      }

      case 'create_google_doc': {
        const { title, content, parentId } = schemas.CreateGoogleDocSchema.parse(args);
        const doc = await documentService.createDocument(title, content, parentId);
        return { content: [{ type: 'text', text: `Google Doc created:\n${formatFile(doc)}` }] };
      }

      case 'create_google_sheet': {
        const { title, parentId } = schemas.CreateGoogleSheetSchema.parse(args);
        const sheet = await spreadsheetService.createSpreadsheet(title, parentId);
        return { content: [{ type: 'text', text: `Google Sheet created:\n${formatFile(sheet)}` }] };
      }

      case 'create_google_slides': {
        const { title, parentId } = schemas.CreateGoogleSlidesSchema.parse(args);
        const file = await fileService.createFile(title + '.gslides', 'application/vnd.google-apps.presentation', undefined, parentId);
        return { content: [{ type: 'text', text: `Google Slides created:\n${formatFile(file)}` }] };
      }

      case 'update_file': {
        const { fileId, name, description } = schemas.UpdateFileSchema.parse(args);
        const file = await fileService.updateFile(fileId, { name, description });
        return { content: [{ type: 'text', text: `File updated:\n${formatFile(file)}` }] };
      }

      case 'delete_file': {
        const { fileId, permanent } = schemas.DeleteFileSchema.parse(args);
        if (permanent) {
          await fileService.deleteFile(fileId);
          return { content: [{ type: 'text', text: `File ${fileId} permanently deleted.` }] };
        } else {
          await fileService.trashFile(fileId);
          return { content: [{ type: 'text', text: `File ${fileId} moved to trash.` }] };
        }
      }

      case 'move_file': {
        const { fileId, newParentId } = schemas.MoveFileSchema.parse(args);
        const file = await fileService.moveFile(fileId, newParentId);
        return { content: [{ type: 'text', text: `File moved:\n${formatFile(file)}` }] };
      }

      case 'copy_file': {
        const { fileId, name, parentId } = schemas.CopyFileSchema.parse(args);
        const file = await fileService.copyFile(fileId, name, parentId);
        return { content: [{ type: 'text', text: `File copied:\n${formatFile(file)}` }] };
      }

      case 'download_file': {
        const { fileId } = schemas.DownloadFileSchema.parse(args);
        const content = await fileService.downloadFile(fileId);
        return { content: [{ type: 'text', text: content }] };
      }

      case 'export_file': {
        const { fileId, format } = schemas.ExportFileSchema.parse(args);
        const mimeTypes: Record<string, string> = {
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          csv: 'text/csv',
          txt: 'text/plain',
          html: 'text/html',
        };
        const content = await fileService.exportFile(fileId, mimeTypes[format]);
        return { content: [{ type: 'text', text: content }] };
      }

      case 'list_recent_files': {
        const { maxResults } = schemas.ListRecentFilesSchema.parse(args);
        const files = await fileService.listRecentFiles(maxResults);
        const text = files.length > 0
          ? `Recent files (${files.length}):\n\n${files.map(formatFile).join('\n\n')}`
          : 'No recent files.';
        return { content: [{ type: 'text', text }] };
      }

      case 'list_shared_files': {
        const { maxResults } = schemas.ListSharedFilesSchema.parse(args);
        const files = await fileService.listSharedWithMe(maxResults);
        const text = files.length > 0
          ? `Shared files (${files.length}):\n\n${files.map(formatFile).join('\n\n')}`
          : 'No shared files.';
        return { content: [{ type: 'text', text }] };
      }

      case 'list_trashed_files': {
        const { maxResults } = schemas.ListTrashedFilesSchema.parse(args);
        const files = await fileService.listTrashedFiles(maxResults);
        const text = files.length > 0
          ? `Trashed files (${files.length}):\n\n${files.map(formatFile).join('\n\n')}`
          : 'No trashed files.';
        return { content: [{ type: 'text', text }] };
      }

      // ============= Folder Operations =============
      case 'create_folder': {
        const { name, parentId } = schemas.CreateFolderSchema.parse(args);
        const folder = await folderService.createFolder(name, parentId);
        return { content: [{ type: 'text', text: `Folder created:\n${formatFile(folder)}` }] };
      }

      case 'get_folder': {
        const { folderId } = schemas.GetFolderSchema.parse(args);
        const folder = await folderService.getFolder(folderId);
        return { content: [{ type: 'text', text: formatFile(folder) }] };
      }

      case 'list_folders': {
        const { parentId, maxResults } = schemas.ListFoldersSchema.parse(args);
        const folders = await folderService.listFolders(parentId, maxResults);
        const text = folders.length > 0
          ? `Folders (${folders.length}):\n\n${folders.map(f => `ID: ${f.id}\nName: ${f.name}`).join('\n\n')}`
          : 'No folders found.';
        return { content: [{ type: 'text', text }] };
      }

      case 'list_folder_contents': {
        const { folderId, maxResults } = schemas.ListFolderContentsSchema.parse(args);
        const contents = await folderService.listFolderContents(folderId, maxResults);
        const text = contents.length > 0
          ? `Folder contents (${contents.length}):\n\n${contents.map(formatFile).join('\n\n')}`
          : 'Folder is empty.';
        return { content: [{ type: 'text', text }] };
      }

      case 'update_folder': {
        const { folderId, name } = schemas.UpdateFolderSchema.parse(args);
        const folder = await folderService.updateFolder(folderId, name);
        return { content: [{ type: 'text', text: `Folder updated:\n${formatFile(folder)}` }] };
      }

      case 'move_folder': {
        const { folderId, newParentId } = schemas.MoveFolderSchema.parse(args);
        const folder = await folderService.moveFolder(folderId, newParentId);
        return { content: [{ type: 'text', text: `Folder moved:\n${formatFile(folder)}` }] };
      }

      case 'delete_folder': {
        const { folderId, permanent } = schemas.DeleteFolderSchema.parse(args);
        if (permanent) {
          await folderService.deleteFolder(folderId);
          return { content: [{ type: 'text', text: `Folder ${folderId} permanently deleted.` }] };
        } else {
          await folderService.trashFolder(folderId);
          return { content: [{ type: 'text', text: `Folder ${folderId} moved to trash.` }] };
        }
      }

      case 'create_folder_path': {
        const { path } = schemas.CreateFolderPathSchema.parse(args);
        const folder = await folderService.getOrCreateFolderPath(path);
        return { content: [{ type: 'text', text: `Folder path created:\n${formatFile(folder)}` }] };
      }

      case 'search_folders': {
        const { name, maxResults } = schemas.SearchFoldersSchema.parse(args);
        const folders = await folderService.searchFolders(name, maxResults);
        const text = folders.length > 0
          ? `Found ${folders.length} folders:\n\n${folders.map(f => `ID: ${f.id}\nName: ${f.name}`).join('\n\n')}`
          : 'No folders found.';
        return { content: [{ type: 'text', text }] };
      }

      // ============= Document Operations =============
      case 'create_document': {
        const { title, content, parentId } = schemas.CreateDocumentSchema.parse(args);
        const doc = await documentService.createDocument(title, content, parentId);
        return { content: [{ type: 'text', text: `Document created:\n${formatFile(doc)}` }] };
      }

      case 'read_document': {
        const { documentId } = schemas.ReadDocumentSchema.parse(args);
        const { title, content } = await documentService.readDocument(documentId);
        return { content: [{ type: 'text', text: `Title: ${title}\n\nContent:\n${content}` }] };
      }

      case 'update_document': {
        const { documentId, content } = schemas.UpdateDocumentSchema.parse(args);
        await documentService.updateDocument(documentId, content);
        return { content: [{ type: 'text', text: `Document ${documentId} updated successfully.` }] };
      }

      case 'append_to_document': {
        const { documentId, text } = schemas.AppendToDocumentSchema.parse(args);
        await documentService.appendText(documentId, text);
        return { content: [{ type: 'text', text: `Text appended to document ${documentId}.` }] };
      }

      case 'replace_in_document': {
        const { documentId, searchText, replaceText } = schemas.ReplaceInDocumentSchema.parse(args);
        const count = await documentService.replaceText(documentId, searchText, replaceText);
        return { content: [{ type: 'text', text: `Replaced ${count} occurrences in document ${documentId}.` }] };
      }

      case 'add_heading': {
        const { documentId, text, level } = schemas.AddHeadingSchema.parse(args);
        await documentService.addHeading(documentId, text, level);
        return { content: [{ type: 'text', text: `Heading added to document ${documentId}.` }] };
      }

      case 'add_bullet_list': {
        const { documentId, items } = schemas.AddBulletListSchema.parse(args);
        await documentService.addBulletList(documentId, items);
        return { content: [{ type: 'text', text: `Bullet list added to document ${documentId}.` }] };
      }

      case 'list_documents': {
        const { maxResults } = schemas.ListDocumentsSchema.parse(args);
        const docs = await documentService.listDocuments(maxResults);
        const text = docs.length > 0
          ? `Documents (${docs.length}):\n\n${docs.map(formatFile).join('\n\n')}`
          : 'No documents found.';
        return { content: [{ type: 'text', text }] };
      }

      case 'search_documents': {
        const { name, maxResults } = schemas.SearchDocumentsSchema.parse(args);
        const docs = await documentService.searchDocuments(name, maxResults);
        const text = docs.length > 0
          ? `Found ${docs.length} documents:\n\n${docs.map(formatFile).join('\n\n')}`
          : 'No documents found.';
        return { content: [{ type: 'text', text }] };
      }

      case 'export_document': {
        const { documentId, format } = schemas.ExportDocumentSchema.parse(args);
        const content = await documentService.exportDocument(documentId, format);
        return { content: [{ type: 'text', text: content }] };
      }

      // ============= Spreadsheet Operations =============
      case 'create_spreadsheet': {
        const { title, parentId } = schemas.CreateSpreadsheetSchema.parse(args);
        const sheet = await spreadsheetService.createSpreadsheet(title, parentId);
        return { content: [{ type: 'text', text: `Spreadsheet created:\n${formatFile(sheet)}` }] };
      }

      case 'get_spreadsheet_info': {
        const { spreadsheetId } = schemas.GetSpreadsheetInfoSchema.parse(args);
        const info = await spreadsheetService.getSpreadsheetInfo(spreadsheetId);
        const sheetsText = info.sheets.map(s => `  - ${s.title} (${s.rowCount}x${s.columnCount})`).join('\n');
        return { content: [{ type: 'text', text: `Title: ${info.title}\nLink: ${info.webViewLink}\nSheets:\n${sheetsText}` }] };
      }

      case 'read_spreadsheet': {
        const { spreadsheetId, range } = schemas.ReadSpreadsheetSchema.parse(args);
        const values = await spreadsheetService.readValues(spreadsheetId, range);
        const text = values.length > 0
          ? `Values (${values.length} rows):\n\n${values.map(row => row.join('\t')).join('\n')}`
          : 'No values in range.';
        return { content: [{ type: 'text', text }] };
      }

      case 'read_sheet': {
        const { spreadsheetId, sheetName } = schemas.ReadSheetSchema.parse(args);
        const { sheetName: name, values, rowCount, columnCount } = await spreadsheetService.readSheet(spreadsheetId, sheetName);
        const text = values.length > 0
          ? `Sheet: ${name} (${rowCount}x${columnCount})\n\n${values.map(row => row.join('\t')).join('\n')}`
          : `Sheet: ${name} is empty.`;
        return { content: [{ type: 'text', text }] };
      }

      case 'write_spreadsheet': {
        const { spreadsheetId, range, values, inputOption } = schemas.WriteSpreadsheetSchema.parse(args);
        const result = await spreadsheetService.writeValues(spreadsheetId, range, values, inputOption);
        return { content: [{ type: 'text', text: `Updated ${result.updatedCells} cells (${result.updatedRows} rows, ${result.updatedColumns} columns).` }] };
      }

      case 'append_to_spreadsheet': {
        const { spreadsheetId, range, values, inputOption } = schemas.AppendToSpreadsheetSchema.parse(args);
        const result = await spreadsheetService.appendValues(spreadsheetId, range, values, inputOption);
        return { content: [{ type: 'text', text: `Appended ${result.updatedCells} cells to ${result.updatedRange}.` }] };
      }

      case 'clear_spreadsheet': {
        const { spreadsheetId, range } = schemas.ClearSpreadsheetSchema.parse(args);
        await spreadsheetService.clearValues(spreadsheetId, range);
        return { content: [{ type: 'text', text: `Cleared range ${range} in spreadsheet ${spreadsheetId}.` }] };
      }

      case 'add_sheet': {
        const { spreadsheetId, title } = schemas.AddSheetSchema.parse(args);
        const result = await spreadsheetService.addSheet(spreadsheetId, title);
        return { content: [{ type: 'text', text: `Sheet added: "${result.title}" (ID: ${result.sheetId})` }] };
      }

      case 'delete_sheet': {
        const { spreadsheetId, sheetId } = schemas.DeleteSheetSchema.parse(args);
        await spreadsheetService.deleteSheet(spreadsheetId, sheetId);
        return { content: [{ type: 'text', text: `Sheet ${sheetId} deleted from spreadsheet ${spreadsheetId}.` }] };
      }

      case 'rename_sheet': {
        const { spreadsheetId, sheetId, newTitle } = schemas.RenameSheetSchema.parse(args);
        await spreadsheetService.renameSheet(spreadsheetId, sheetId, newTitle);
        return { content: [{ type: 'text', text: `Sheet renamed to "${newTitle}".` }] };
      }

      case 'find_replace_in_spreadsheet': {
        const { spreadsheetId, find, replace, matchCase, matchEntireCell } = schemas.FindReplaceInSpreadsheetSchema.parse(args);
        const result = await spreadsheetService.findReplace(spreadsheetId, find, replace, matchCase, matchEntireCell);
        return { content: [{ type: 'text', text: `Replaced ${result.occurrencesChanged} occurrences.` }] };
      }

      case 'list_spreadsheets': {
        const { maxResults } = schemas.ListSpreadsheetsSchema.parse(args);
        const sheets = await spreadsheetService.listSpreadsheets(maxResults);
        const text = sheets.length > 0
          ? `Spreadsheets (${sheets.length}):\n\n${sheets.map(formatFile).join('\n\n')}`
          : 'No spreadsheets found.';
        return { content: [{ type: 'text', text }] };
      }

      case 'search_spreadsheets': {
        const { name, maxResults } = schemas.SearchSpreadsheetsSchema.parse(args);
        const sheets = await spreadsheetService.searchSpreadsheets(name, maxResults);
        const text = sheets.length > 0
          ? `Found ${sheets.length} spreadsheets:\n\n${sheets.map(formatFile).join('\n\n')}`
          : 'No spreadsheets found.';
        return { content: [{ type: 'text', text }] };
      }

      case 'export_spreadsheet': {
        const { spreadsheetId, format } = schemas.ExportSpreadsheetSchema.parse(args);
        const content = await spreadsheetService.exportSpreadsheet(spreadsheetId, format);
        return { content: [{ type: 'text', text: content }] };
      }

      case 'create_spreadsheet_from_csv': {
        const { title, csvData, parentId } = schemas.CreateSpreadsheetFromCSVSchema.parse(args);
        const sheet = await spreadsheetService.createFromCSV(title, csvData, parentId);
        return { content: [{ type: 'text', text: `Spreadsheet created from CSV:\n${formatFile(sheet)}` }] };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [{
          type: 'text',
          text: `Validation error: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        }],
      };
    }

    if (error instanceof GDriveMCPError) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
    };
  }
}


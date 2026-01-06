/**
 * File service for Google Drive operations
 */

import { DriveAPIClient } from './drive-api.client.js';
import { DriveFile, SearchOptions, UpdateOptions } from '../types/config.types.js';
import { createValidationError, createNotFoundError } from '../utils/error.util.js';
import { getMimeType, isGoogleWorkspaceType, GOOGLE_MIME_TYPES, getFileTypeDescription } from '../utils/mime.util.js';

/**
 * Service for managing files in Google Drive
 */
export class FileService {
  constructor(private readonly driveClient: DriveAPIClient) {}

  /**
   * Searches for files
   */
  async searchFiles(options: SearchOptions = {}): Promise<DriveFile[]> {
    const queryParts: string[] = [];

    if (options.query) {
      queryParts.push(`fullText contains '${options.query}'`);
    }

    if (options.mimeType) {
      queryParts.push(`mimeType = '${options.mimeType}'`);
    }

    if (options.folderId) {
      queryParts.push(`'${options.folderId}' in parents`);
    }

    if (options.trashed !== undefined) {
      queryParts.push(`trashed = ${options.trashed}`);
    } else {
      queryParts.push('trashed = false');
    }

    const query = queryParts.join(' and ');

    const response = await this.driveClient.listFiles({
      query: query || undefined,
      pageSize: options.maxResults || 50,
      orderBy: options.orderBy,
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Gets a file by ID
   */
  async getFile(fileId: string): Promise<DriveFile> {
    const file = await this.driveClient.getFile(fileId);
    if (!file.id) {
      throw createNotFoundError('File', fileId);
    }
    return file as DriveFile;
  }

  /**
   * Creates a new file with automatic MIME type detection
   * @param name - File name (with extension for auto-detection)
   * @param mimeTypeOrContent - Either explicit MIME type or file content (if content, MIME type is auto-detected)
   * @param contentOrParentId - Either file content or parent folder ID
   * @param parentId - Parent folder ID (if content provided in previous param)
   */
  async createFile(
    name: string,
    mimeTypeOrContent?: string,
    contentOrParentId?: string,
    parentId?: string
  ): Promise<DriveFile> {
    if (!name) {
      throw createValidationError('File name is required');
    }

    // Determine if second param is MIME type or content
    let mimeType: string;
    let content: string | undefined;
    let finalParentId: string | undefined;

    // Check if mimeTypeOrContent looks like a MIME type
    const isMimeType = mimeTypeOrContent && (
      mimeTypeOrContent.includes('/') && 
      !mimeTypeOrContent.includes('\n') &&
      mimeTypeOrContent.length < 100
    );

    if (isMimeType) {
      mimeType = mimeTypeOrContent;
      content = contentOrParentId;
      finalParentId = parentId;
    } else {
      // Auto-detect MIME type from filename
      mimeType = getMimeType(name);
      content = mimeTypeOrContent;
      finalParentId = contentOrParentId;
    }

    // Handle Google Workspace types - they need special handling
    if (isGoogleWorkspaceType(mimeType)) {
      return this.createGoogleWorkspaceFile(name, mimeType, content, finalParentId);
    }

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType,
    };

    if (finalParentId) {
      metadata.parents = [finalParentId];
    }

    const media = content ? { mimeType, body: content } : undefined;
    const file = await this.driveClient.createFile(metadata, media);

    return file as DriveFile;
  }

  /**
   * Creates a Google Workspace file (Doc, Sheet, Slides, etc.)
   */
  private async createGoogleWorkspaceFile(
    name: string,
    mimeType: string,
    content?: string,
    parentId?: string
  ): Promise<DriveFile> {
    // Remove Google-specific extension from name if present
    const cleanName = name.replace(/\.(gdoc|gsheet|gslides?|gform|gdraw)$/i, '');

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: cleanName,
      mimeType,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    // Google Workspace files can't have content uploaded directly
    // They need to be created empty first, then content added via their respective APIs
    const file = await this.driveClient.createFile(metadata);

    return file as DriveFile;
  }

  /**
   * Smart upload - detects file type and uploads appropriately
   */
  async uploadFile(
    name: string,
    content: string,
    parentId?: string,
    explicitMimeType?: string
  ): Promise<DriveFile> {
    const mimeType = explicitMimeType || getMimeType(name);
    
    console.log(`Uploading ${name} as ${getFileTypeDescription(mimeType)} (${mimeType})`);
    
    return this.createFile(name, mimeType, content, parentId);
  }

  /**
   * Updates a file's metadata
   */
  async updateFile(fileId: string, options: UpdateOptions): Promise<DriveFile> {
    const metadata: {
      name?: string;
      description?: string;
      trashed?: boolean;
      addParents?: string;
      removeParents?: string;
    } = {};

    if (options.name) metadata.name = options.name;
    if (options.description !== undefined) metadata.description = options.description;
    if (options.trashed !== undefined) metadata.trashed = options.trashed;

    // Handle parent changes through separate call if needed
    if (options.addParents || options.removeParents) {
      const drive = this.driveClient.getDrive();
      const response = await drive.files.update({
        fileId,
        addParents: options.addParents?.join(','),
        removeParents: options.removeParents?.join(','),
        requestBody: {
          name: options.name,
          description: options.description,
          trashed: options.trashed,
        },
        fields: 'id, name, mimeType, parents, webViewLink',
      });
      return response.data as DriveFile;
    }

    const file = await this.driveClient.updateFile(fileId, metadata);
    return file as DriveFile;
  }

  /**
   * Deletes a file permanently
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.driveClient.deleteFile(fileId);
  }

  /**
   * Moves a file to trash
   */
  async trashFile(fileId: string): Promise<DriveFile> {
    const file = await this.driveClient.trashFile(fileId);
    return file as DriveFile;
  }

  /**
   * Copies a file
   */
  async copyFile(fileId: string, name: string, parentId?: string): Promise<DriveFile> {
    const parents = parentId ? [parentId] : undefined;
    const file = await this.driveClient.copyFile(fileId, name, parents);
    return file as DriveFile;
  }

  /**
   * Moves a file to a different folder
   */
  async moveFile(fileId: string, newParentId: string): Promise<DriveFile> {
    // Get current parents
    const currentFile = await this.getFile(fileId);
    const currentParents = currentFile.parents?.join(',') || '';

    const drive = this.driveClient.getDrive();
    const response = await drive.files.update({
      fileId,
      addParents: newParentId,
      removeParents: currentParents,
      fields: 'id, name, mimeType, parents, webViewLink',
    });

    return response.data as DriveFile;
  }

  /**
   * Downloads file content
   */
  async downloadFile(fileId: string): Promise<string> {
    return this.driveClient.downloadFile(fileId);
  }

  /**
   * Exports a Google Workspace file to a specified format
   */
  async exportFile(fileId: string, mimeType: string): Promise<string> {
    return this.driveClient.exportFile(fileId, mimeType);
  }

  /**
   * Lists recent files
   */
  async listRecentFiles(maxResults: number = 20): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      pageSize: maxResults,
      orderBy: 'viewedByMeTime desc',
      query: 'trashed = false',
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Lists files shared with me
   */
  async listSharedWithMe(maxResults: number = 50): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      query: "sharedWithMe = true and trashed = false",
      pageSize: maxResults,
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Lists files in trash
   */
  async listTrashedFiles(maxResults: number = 50): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      query: "trashed = true",
      pageSize: maxResults,
    });

    return (response.files || []) as DriveFile[];
  }
}


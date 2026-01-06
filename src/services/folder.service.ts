/**
 * Folder service for Google Drive operations
 */

import { DriveAPIClient } from './drive-api.client.js';
import { DriveFile, DriveFolder } from '../types/config.types.js';
import { createValidationError, createNotFoundError } from '../utils/error.util.js';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

/**
 * Service for managing folders in Google Drive
 */
export class FolderService {
  constructor(private readonly driveClient: DriveAPIClient) {}

  /**
   * Creates a new folder
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFolder> {
    if (!name) {
      throw createValidationError('Folder name is required');
    }

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType: FOLDER_MIME_TYPE,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const folder = await this.driveClient.createFile(metadata);
    return folder as DriveFolder;
  }

  /**
   * Gets a folder by ID
   */
  async getFolder(folderId: string): Promise<DriveFolder> {
    const folder = await this.driveClient.getFile(folderId);
    if (!folder.id) {
      throw createNotFoundError('Folder', folderId);
    }
    if (folder.mimeType !== FOLDER_MIME_TYPE) {
      throw createValidationError(`ID ${folderId} is not a folder`);
    }
    return folder as DriveFolder;
  }

  /**
   * Lists all folders
   */
  async listFolders(parentId?: string, maxResults: number = 100): Promise<DriveFolder[]> {
    let query = `mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`;
    
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const response = await this.driveClient.listFiles({
      query,
      pageSize: maxResults,
      orderBy: 'name',
    });

    return (response.files || []) as DriveFolder[];
  }

  /**
   * Lists contents of a folder
   */
  async listFolderContents(folderId: string, maxResults: number = 100): Promise<DriveFile[]> {
    const query = `'${folderId}' in parents and trashed = false`;

    const response = await this.driveClient.listFiles({
      query,
      pageSize: maxResults,
      orderBy: 'folder,name',
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Updates a folder's metadata
   */
  async updateFolder(folderId: string, name?: string, newParentId?: string): Promise<DriveFolder> {
    // First verify it's a folder
    const folder = await this.getFolder(folderId);

    if (newParentId) {
      const currentParents = folder.parents?.join(',') || '';
      const drive = this.driveClient.getDrive();
      const response = await drive.files.update({
        fileId: folderId,
        addParents: newParentId,
        removeParents: currentParents,
        requestBody: name ? { name } : {},
        fields: 'id, name, mimeType, parents, webViewLink',
      });
      return response.data as DriveFolder;
    }

    if (name) {
      const updated = await this.driveClient.updateFile(folderId, { name });
      return updated as DriveFolder;
    }

    return folder;
  }

  /**
   * Moves a folder
   */
  async moveFolder(folderId: string, newParentId: string): Promise<DriveFolder> {
    return this.updateFolder(folderId, undefined, newParentId);
  }

  /**
   * Renames a folder
   */
  async renameFolder(folderId: string, newName: string): Promise<DriveFolder> {
    if (!newName) {
      throw createValidationError('New folder name is required');
    }
    return this.updateFolder(folderId, newName);
  }

  /**
   * Deletes a folder permanently
   */
  async deleteFolder(folderId: string): Promise<void> {
    // Verify it's a folder first
    await this.getFolder(folderId);
    await this.driveClient.deleteFile(folderId);
  }

  /**
   * Moves a folder to trash
   */
  async trashFolder(folderId: string): Promise<DriveFolder> {
    // Verify it's a folder first
    await this.getFolder(folderId);
    const trashed = await this.driveClient.trashFile(folderId);
    return trashed as DriveFolder;
  }

  /**
   * Gets or creates a folder by path
   */
  async getOrCreateFolderPath(folderPath: string): Promise<DriveFolder> {
    const parts = folderPath.split('/').filter(p => p.trim());
    
    if (parts.length === 0) {
      throw createValidationError('Folder path cannot be empty');
    }

    let currentParentId = 'root';
    let currentFolder: DriveFolder | null = null;

    for (const part of parts) {
      // Search for existing folder
      const query = `name = '${part}' and mimeType = '${FOLDER_MIME_TYPE}' and '${currentParentId}' in parents and trashed = false`;
      const response = await this.driveClient.listFiles({
        query,
        pageSize: 1,
      });

      if (response.files && response.files.length > 0) {
        currentFolder = response.files[0] as DriveFolder;
        currentParentId = currentFolder.id!;
      } else {
        // Create the folder
        currentFolder = await this.createFolder(part, currentParentId);
        currentParentId = currentFolder.id!;
      }
    }

    return currentFolder!;
  }

  /**
   * Searches for folders by name
   */
  async searchFolders(name: string, maxResults: number = 50): Promise<DriveFolder[]> {
    const query = `name contains '${name}' and mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`;

    const response = await this.driveClient.listFiles({
      query,
      pageSize: maxResults,
    });

    return (response.files || []) as DriveFolder[];
  }

  /**
   * Gets the root folder
   */
  async getRootFolder(): Promise<DriveFolder> {
    const folder = await this.driveClient.getFile('root');
    return folder as DriveFolder;
  }

  /**
   * Gets folder hierarchy (path from root)
   */
  async getFolderPath(folderId: string): Promise<string[]> {
    const path: string[] = [];
    let currentId: string | undefined = folderId;

    while (currentId && currentId !== 'root') {
      const folder = await this.driveClient.getFile(currentId);
      if (folder.name) {
        path.unshift(folder.name);
      }
      currentId = folder.parents?.[0];
    }

    return path;
  }
}


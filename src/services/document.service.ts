/**
 * Document service for Google Docs operations
 */

import { docs_v1 } from 'googleapis';
import { DriveAPIClient } from './drive-api.client.js';
import { DriveFile } from '../types/config.types.js';
import { createValidationError, createNotFoundError, createAPIError } from '../utils/error.util.js';

const DOCS_MIME_TYPE = 'application/vnd.google-apps.document';

/**
 * Service for managing Google Docs
 */
export class DocumentService {
  constructor(private readonly driveClient: DriveAPIClient) {}

  /**
   * Creates a new Google Doc
   */
  async createDocument(title: string, content?: string, parentId?: string): Promise<DriveFile> {
    if (!title) {
      throw createValidationError('Document title is required');
    }

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: title,
      mimeType: DOCS_MIME_TYPE,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const doc = await this.driveClient.createFile(metadata);

    // If content provided, add it to the document
    if (content && doc.id) {
      await this.appendText(doc.id, content);
    }

    return doc as DriveFile;
  }

  /**
   * Gets a Google Doc
   */
  async getDocument(documentId: string): Promise<docs_v1.Schema$Document> {
    const doc = await this.driveClient.getDocument(documentId);
    if (!doc.documentId) {
      throw createNotFoundError('Document', documentId);
    }
    return doc;
  }

  /**
   * Reads the text content of a Google Doc
   */
  async readDocument(documentId: string): Promise<{ title: string; content: string }> {
    const doc = await this.getDocument(documentId);
    
    let content = '';
    
    if (doc.body?.content) {
      for (const element of doc.body.content) {
        if (element.paragraph?.elements) {
          for (const textRun of element.paragraph.elements) {
            if (textRun.textRun?.content) {
              content += textRun.textRun.content;
            }
          }
        }
        if (element.table) {
          content += '[TABLE]\n';
          for (const row of element.table.tableRows || []) {
            const cells: string[] = [];
            for (const cell of row.tableCells || []) {
              let cellText = '';
              for (const cellContent of cell.content || []) {
                if (cellContent.paragraph?.elements) {
                  for (const textRun of cellContent.paragraph.elements) {
                    if (textRun.textRun?.content) {
                      cellText += textRun.textRun.content.trim();
                    }
                  }
                }
              }
              cells.push(cellText);
            }
            content += cells.join(' | ') + '\n';
          }
          content += '[/TABLE]\n';
        }
      }
    }

    return {
      title: doc.title || 'Untitled',
      content: content.trim(),
    };
  }

  /**
   * Appends text to the end of a document
   */
  async appendText(documentId: string, text: string): Promise<void> {
    if (!text) {
      return;
    }

    const doc = await this.getDocument(documentId);
    const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 1;

    await this.driveClient.batchUpdateDocument(documentId, [
      {
        insertText: {
          location: { index: endIndex - 1 },
          text: text,
        },
      },
    ]);
  }

  /**
   * Inserts text at a specific index
   */
  async insertText(documentId: string, text: string, index: number): Promise<void> {
    if (!text) {
      return;
    }

    await this.driveClient.batchUpdateDocument(documentId, [
      {
        insertText: {
          location: { index },
          text: text,
        },
      },
    ]);
  }

  /**
   * Replaces all occurrences of text in a document
   */
  async replaceText(documentId: string, searchText: string, replaceText: string): Promise<number> {
    const response = await this.driveClient.batchUpdateDocument(documentId, [
      {
        replaceAllText: {
          containsText: {
            text: searchText,
            matchCase: true,
          },
          replaceText: replaceText,
        },
      },
    ]);

    const replaceResult = response.replies?.[0]?.replaceAllText;
    return replaceResult?.occurrencesChanged || 0;
  }

  /**
   * Deletes content from a document
   */
  async deleteContent(documentId: string, startIndex: number, endIndex: number): Promise<void> {
    await this.driveClient.batchUpdateDocument(documentId, [
      {
        deleteContentRange: {
          range: {
            startIndex,
            endIndex,
          },
        },
      },
    ]);
  }

  /**
   * Clears all content from a document
   */
  async clearDocument(documentId: string): Promise<void> {
    const doc = await this.getDocument(documentId);
    const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 1;

    if (endIndex > 1) {
      await this.deleteContent(documentId, 1, endIndex - 1);
    }
  }

  /**
   * Updates document with new content (replaces all)
   */
  async updateDocument(documentId: string, content: string): Promise<void> {
    await this.clearDocument(documentId);
    if (content) {
      await this.appendText(documentId, content);
    }
  }

  /**
   * Adds a heading to the document
   */
  async addHeading(
    documentId: string,
    text: string,
    headingLevel: 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'HEADING_4' | 'HEADING_5' | 'HEADING_6' = 'HEADING_1'
  ): Promise<void> {
    const doc = await this.getDocument(documentId);
    const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 1;
    const insertIndex = endIndex - 1;
    const textWithNewline = text + '\n';

    await this.driveClient.batchUpdateDocument(documentId, [
      {
        insertText: {
          location: { index: insertIndex },
          text: textWithNewline,
        },
      },
      {
        updateParagraphStyle: {
          range: {
            startIndex: insertIndex,
            endIndex: insertIndex + textWithNewline.length,
          },
          paragraphStyle: {
            namedStyleType: headingLevel,
          },
          fields: 'namedStyleType',
        },
      },
    ]);
  }

  /**
   * Creates a bullet list in the document
   */
  async addBulletList(documentId: string, items: string[]): Promise<void> {
    if (items.length === 0) return;

    const doc = await this.getDocument(documentId);
    const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 1;
    const insertIndex = endIndex - 1;

    const text = items.join('\n') + '\n';

    await this.driveClient.batchUpdateDocument(documentId, [
      {
        insertText: {
          location: { index: insertIndex },
          text: text,
        },
      },
      {
        createParagraphBullets: {
          range: {
            startIndex: insertIndex,
            endIndex: insertIndex + text.length,
          },
          bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
        },
      },
    ]);
  }

  /**
   * Lists all Google Docs
   */
  async listDocuments(maxResults: number = 50): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      query: `mimeType = '${DOCS_MIME_TYPE}' and trashed = false`,
      pageSize: maxResults,
      orderBy: 'modifiedTime desc',
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Searches for Google Docs by name
   */
  async searchDocuments(name: string, maxResults: number = 50): Promise<DriveFile[]> {
    const response = await this.driveClient.listFiles({
      query: `name contains '${name}' and mimeType = '${DOCS_MIME_TYPE}' and trashed = false`,
      pageSize: maxResults,
    });

    return (response.files || []) as DriveFile[];
  }

  /**
   * Exports a Google Doc to a specific format
   */
  async exportDocument(documentId: string, format: 'pdf' | 'docx' | 'txt' | 'html' = 'pdf'): Promise<string> {
    const mimeTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      html: 'text/html',
    };

    return this.driveClient.exportFile(documentId, mimeTypes[format]);
  }
}


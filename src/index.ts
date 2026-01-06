#!/usr/bin/env node

/**
 * GDrive MCP Server Entry Point
 */

import { AuthService } from './services/auth.service.js';
import { DriveAPIClient } from './services/drive-api.client.js';
import { FileService } from './services/file.service.js';
import { FolderService } from './services/folder.service.js';
import { DocumentService } from './services/document.service.js';
import { SpreadsheetService } from './services/spreadsheet.service.js';
import { createMCPServer, startMCPServer } from './server/mcp-server.js';

/**
 * Main function
 */
async function main() {
  // Handle authentication command
  if (process.argv[2] === 'auth') {
    const callbackUrl = process.argv[3];
    const authService = new AuthService({ callbackUrl });
    
    try {
      await authService.loadCredentials();
      await authService.authenticate(callbackUrl);
      console.log('Authentication completed successfully');
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Authentication failed:', errorMessage);
      process.exit(1);
    }
  }

  // Initialize services
  const authService = new AuthService({
    oauthPath: process.env.GDRIVE_OAUTH_PATH,
    credentialsPath: process.env.GDRIVE_CREDENTIALS_PATH,
  });

  try {
    await authService.loadCredentials();

    if (!authService.isAuthenticated()) {
      console.error('Not authenticated. Please run: npm run auth');
      process.exit(1);
    }

    const driveClient = new DriveAPIClient(authService);
    const fileService = new FileService(driveClient);
    const folderService = new FolderService(driveClient);
    const documentService = new DocumentService(driveClient);
    const spreadsheetService = new SpreadsheetService(driveClient);

    // Create MCP server
    const server = createMCPServer({
      fileService,
      folderService,
      documentService,
      spreadsheetService,
    });

    // Start server
    await startMCPServer(server);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Server error:', errorMessage);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


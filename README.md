# GDrive MCP Server

A comprehensive Model Context Protocol (MCP) server for Google Drive, Google Docs, and Google Sheets with full tool support across all Google Drive functions.

## Features

- **50+ MCP Tools** for complete Google Drive management
- **Automatic MIME type detection** for 80+ file extensions
- **Native Google Workspace support** - Docs, Sheets, Slides, Forms
- **Full CRUD operations** - Create, Read, Update, Delete for all file types
- **Folder management** - Create hierarchies, move, search
- **OAuth2 authentication** - Secure Google API access

## Installation

```bash
git clone https://github.com/pouyanafisi/gdrive-mcp.git
cd gdrive-mcp
npm install
```

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs:
   - **Google Drive API**
   - **Google Docs API**
   - **Google Sheets API**

### 2. Create OAuth Credentials

1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Desktop app)
3. Download the JSON file
4. Rename to `gcp-oauth.keys.json`
5. Place in project root or `~/.gdrive-mcp/`

### 3. Authenticate

```bash
npm run auth
```

This opens a browser for OAuth authentication.

## Usage

### MCP Client Configuration

Add to your MCP client (Claude, etc.):

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "node",
      "args": ["/path/to/gdrive-mcp-server/dist/index.js"]
    }
  }
}
```

---

## Tools Reference

### File Operations (16 tools)

| Tool | Description |
|------|-------------|
| `search_files` | Search for files in Google Drive using queries |
| `get_file` | Get file metadata by ID |
| `create_file` | Create a new file with auto type detection |
| `upload_file` | Upload file with automatic MIME type from extension |
| `create_google_doc` | Create a new Google Doc |
| `create_google_sheet` | Create a new Google Sheet |
| `create_google_slides` | Create a new Google Slides presentation |
| `update_file` | Update file metadata (name, description) |
| `delete_file` | Delete a file (trash or permanent) |
| `move_file` | Move a file to a different folder |
| `copy_file` | Copy a file |
| `download_file` | Download file content |
| `export_file` | Export Google Workspace file (PDF, DOCX, XLSX, etc.) |
| `list_recent_files` | List recently viewed files |
| `list_shared_files` | List files shared with me |
| `list_trashed_files` | List files in trash |

### Folder Operations (9 tools)

| Tool | Description |
|------|-------------|
| `create_folder` | Create a new folder |
| `get_folder` | Get folder metadata |
| `list_folders` | List all folders or within a parent |
| `list_folder_contents` | List all files and folders in a folder |
| `update_folder` | Rename a folder |
| `move_folder` | Move a folder to a new location |
| `delete_folder` | Delete a folder (trash or permanent) |
| `create_folder_path` | Create nested folder structure (e.g., "Projects/2024/Reports") |
| `search_folders` | Search folders by name |

### Google Docs Operations (10 tools)

| Tool | Description |
|------|-------------|
| `create_document` | Create a new Google Doc with optional content |
| `read_document` | Read text content from a Google Doc |
| `update_document` | Replace all content in a Google Doc |
| `append_to_document` | Append text to end of document |
| `replace_in_document` | Find and replace text |
| `add_heading` | Add a formatted heading (H1-H6) |
| `add_bullet_list` | Add a bullet list |
| `list_documents` | List all Google Docs |
| `search_documents` | Search Google Docs by name |
| `export_document` | Export to PDF, DOCX, TXT, or HTML |

### Google Sheets Operations (15 tools)

| Tool | Description |
|------|-------------|
| `create_spreadsheet` | Create a new Google Sheet |
| `get_spreadsheet_info` | Get spreadsheet metadata and sheet list |
| `read_spreadsheet` | Read values from a range (e.g., "A1:D10") |
| `read_sheet` | Read an entire sheet |
| `write_spreadsheet` | Write values to a range |
| `append_to_spreadsheet` | Append rows to a sheet |
| `clear_spreadsheet` | Clear values from a range |
| `add_sheet` | Add a new sheet tab |
| `delete_sheet` | Delete a sheet tab |
| `rename_sheet` | Rename a sheet tab |
| `find_replace_in_spreadsheet` | Find and replace across all sheets |
| `list_spreadsheets` | List all Google Sheets |
| `search_spreadsheets` | Search Google Sheets by name |
| `export_spreadsheet` | Export to XLSX, CSV, or PDF |
| `create_spreadsheet_from_csv` | Create spreadsheet from CSV data |

---

## Supported File Types

### Automatic MIME Type Detection

The server automatically detects file types from extensions. Just use the correct extension and the file will be created with the proper MIME type.

#### Text & Markup
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.txt` | text/plain | Plain text |
| `.md`, `.markdown` | text/markdown | Markdown |
| `.csv` | text/csv | CSV data |
| `.tsv` | text/tab-separated-values | Tab-separated |
| `.xml` | application/xml | XML |
| `.yaml`, `.yml` | text/yaml | YAML |
| `.html`, `.htm` | text/html | HTML |
| `.css` | text/css | CSS |
| `.json` | application/json | JSON |

#### Programming Languages
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.js`, `.mjs` | text/javascript | JavaScript |
| `.ts` | text/typescript | TypeScript |
| `.jsx`, `.tsx` | text/javascript | React |
| `.py` | text/x-python | Python |
| `.rb` | text/x-ruby | Ruby |
| `.php` | text/x-php | PHP |
| `.java` | text/x-java | Java |
| `.c`, `.h` | text/x-c | C |
| `.cpp`, `.hpp` | text/x-c++ | C++ |
| `.cs` | text/x-csharp | C# |
| `.go` | text/x-go | Go |
| `.rs` | text/x-rust | Rust |
| `.swift` | text/x-swift | Swift |
| `.kt` | text/x-kotlin | Kotlin |
| `.scala` | text/x-scala | Scala |
| `.sql` | text/x-sql | SQL |
| `.sh`, `.bash`, `.zsh` | text/x-shellscript | Shell |
| `.ps1` | text/x-powershell | PowerShell |
| `.r` | text/x-r | R |
| `.lua` | text/x-lua | Lua |
| `.pl`, `.pm` | text/x-perl | Perl |

#### Documents
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.pdf` | application/pdf | PDF |
| `.doc` | application/msword | Word (legacy) |
| `.docx` | application/vnd.openxmlformats-officedocument.wordprocessingml.document | Word |
| `.rtf` | application/rtf | Rich Text |
| `.odt` | application/vnd.oasis.opendocument.text | OpenDocument |

#### Spreadsheets
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.xls` | application/vnd.ms-excel | Excel (legacy) |
| `.xlsx` | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | Excel |
| `.ods` | application/vnd.oasis.opendocument.spreadsheet | OpenDocument |

#### Presentations
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.ppt` | application/vnd.ms-powerpoint | PowerPoint (legacy) |
| `.pptx` | application/vnd.openxmlformats-officedocument.presentationml.presentation | PowerPoint |
| `.odp` | application/vnd.oasis.opendocument.presentation | OpenDocument |

#### Images
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.jpg`, `.jpeg` | image/jpeg | JPEG |
| `.png` | image/png | PNG |
| `.gif` | image/gif | GIF |
| `.webp` | image/webp | WebP |
| `.svg` | image/svg+xml | SVG |
| `.bmp` | image/bmp | Bitmap |
| `.tiff`, `.tif` | image/tiff | TIFF |
| `.ico` | image/x-icon | Icon |

#### Audio
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.mp3` | audio/mpeg | MP3 |
| `.wav` | audio/wav | WAV |
| `.ogg` | audio/ogg | OGG |
| `.flac` | audio/flac | FLAC |
| `.aac` | audio/aac | AAC |
| `.m4a` | audio/mp4 | M4A |

#### Video
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.mp4` | video/mp4 | MP4 |
| `.webm` | video/webm | WebM |
| `.avi` | video/x-msvideo | AVI |
| `.mov` | video/quicktime | QuickTime |
| `.wmv` | video/x-ms-wmv | WMV |
| `.mkv` | video/x-matroska | Matroska |

#### Archives
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.zip` | application/zip | ZIP |
| `.tar` | application/x-tar | TAR |
| `.gz` | application/gzip | GZIP |
| `.rar` | application/vnd.rar | RAR |
| `.7z` | application/x-7z-compressed | 7-Zip |

#### Google Workspace
| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.gdoc` | application/vnd.google-apps.document | Google Doc |
| `.gsheet` | application/vnd.google-apps.spreadsheet | Google Sheet |
| `.gslides` | application/vnd.google-apps.presentation | Google Slides |
| `.gform` | application/vnd.google-apps.form | Google Form |
| `.gdraw` | application/vnd.google-apps.drawing | Google Drawing |

---

## Examples

### Upload files with auto type detection

```javascript
// These automatically get the correct MIME type
await fileService.uploadFile('readme.md', markdownContent, folderId);
await fileService.uploadFile('config.json', jsonContent, folderId);
await fileService.uploadFile('data.csv', csvContent, folderId);
await fileService.uploadFile('script.py', pythonCode, folderId);
```

### Create Google Workspace files

```javascript
// Create native Google files
await documentService.createDocument('Meeting Notes', 'Initial content');
await spreadsheetService.createSpreadsheet('Budget 2024');
await fileService.createFile('Presentation.gslides');
```

### Folder operations

```javascript
// Create nested folder structure
const folder = await folderService.getOrCreateFolderPath('Projects/2024/Q1');

// List folder contents
const files = await folderService.listFolderContents(folderId);
```

---

## Configuration

| Environment Variable | Description |
|---------------------|-------------|
| `GDRIVE_OAUTH_PATH` | Path to OAuth keys file |
| `GDRIVE_CREDENTIALS_PATH` | Path to credentials file |

## Development

```bash
npm run build      # Build TypeScript
npm run dev        # Watch mode
npm run type-check # Type checking
npm test           # Run tests
```

## License

MIT © Pouya Nafisi

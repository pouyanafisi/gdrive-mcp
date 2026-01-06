/**
 * MIME type utilities for file handling
 */

/**
 * File extension to MIME type mapping
 */
export const MIME_TYPES: Record<string, string> = {
  // Text files
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.csv': 'text/csv',
  '.tsv': 'text/tab-separated-values',
  '.log': 'text/plain',
  '.ini': 'text/plain',
  '.cfg': 'text/plain',
  '.conf': 'text/plain',
  '.env': 'text/plain',
  
  // Code files
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.ts': 'text/typescript',
  '.jsx': 'text/javascript',
  '.tsx': 'text/typescript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.scss': 'text/x-scss',
  '.sass': 'text/x-sass',
  '.less': 'text/x-less',
  '.py': 'text/x-python',
  '.rb': 'text/x-ruby',
  '.php': 'text/x-php',
  '.java': 'text/x-java',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.h': 'text/x-c',
  '.hpp': 'text/x-c++',
  '.cs': 'text/x-csharp',
  '.go': 'text/x-go',
  '.rs': 'text/x-rust',
  '.swift': 'text/x-swift',
  '.kt': 'text/x-kotlin',
  '.scala': 'text/x-scala',
  '.sh': 'text/x-shellscript',
  '.bash': 'text/x-shellscript',
  '.zsh': 'text/x-shellscript',
  '.ps1': 'text/x-powershell',
  '.sql': 'text/x-sql',
  '.r': 'text/x-r',
  '.lua': 'text/x-lua',
  '.pl': 'text/x-perl',
  '.pm': 'text/x-perl',
  
  // Document files
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  
  // Spreadsheet files
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  
  // Presentation files
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  
  // Image files
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  
  // Audio files
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
  
  // Video files
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.mkv': 'video/x-matroska',
  
  // Archive files
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.bz2': 'application/x-bzip2',
  
  // Other
  '.bin': 'application/octet-stream',
  '.exe': 'application/x-msdownload',
  '.dll': 'application/x-msdownload',
  '.dmg': 'application/x-apple-diskimage',
  '.iso': 'application/x-iso9660-image',
};

/**
 * Google Workspace MIME types
 */
export const GOOGLE_MIME_TYPES = {
  document: 'application/vnd.google-apps.document',
  spreadsheet: 'application/vnd.google-apps.spreadsheet',
  presentation: 'application/vnd.google-apps.presentation',
  folder: 'application/vnd.google-apps.folder',
  form: 'application/vnd.google-apps.form',
  drawing: 'application/vnd.google-apps.drawing',
  site: 'application/vnd.google-apps.site',
  script: 'application/vnd.google-apps.script',
};

/**
 * Extension aliases for Google Workspace types
 */
export const GOOGLE_EXTENSIONS: Record<string, string> = {
  '.gdoc': GOOGLE_MIME_TYPES.document,
  '.gsheet': GOOGLE_MIME_TYPES.spreadsheet,
  '.gslide': GOOGLE_MIME_TYPES.presentation,
  '.gslides': GOOGLE_MIME_TYPES.presentation,
  '.gform': GOOGLE_MIME_TYPES.form,
  '.gdraw': GOOGLE_MIME_TYPES.drawing,
};

/**
 * Gets the MIME type for a file based on its extension
 */
export function getMimeType(filename: string): string {
  const ext = getExtension(filename).toLowerCase();
  
  // Check Google Workspace extensions first
  if (GOOGLE_EXTENSIONS[ext]) {
    return GOOGLE_EXTENSIONS[ext];
  }
  
  // Check regular MIME types
  if (MIME_TYPES[ext]) {
    return MIME_TYPES[ext];
  }
  
  // Default to octet-stream for unknown types
  return 'application/octet-stream';
}

/**
 * Gets the file extension from a filename
 */
export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) {
    return '';
  }
  return filename.substring(lastDot);
}

/**
 * Checks if a MIME type is a Google Workspace type
 */
export function isGoogleWorkspaceType(mimeType: string): boolean {
  return mimeType.startsWith('application/vnd.google-apps.');
}

/**
 * Gets the appropriate export MIME type for a Google Workspace file
 */
export function getExportMimeType(googleMimeType: string, format: string): string {
  const exportFormats: Record<string, Record<string, string>> = {
    [GOOGLE_MIME_TYPES.document]: {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      html: 'text/html',
      rtf: 'application/rtf',
      odt: 'application/vnd.oasis.opendocument.text',
      epub: 'application/epub+zip',
    },
    [GOOGLE_MIME_TYPES.spreadsheet]: {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      tsv: 'text/tab-separated-values',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',
    },
    [GOOGLE_MIME_TYPES.presentation]: {
      pdf: 'application/pdf',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      odp: 'application/vnd.oasis.opendocument.presentation',
    },
    [GOOGLE_MIME_TYPES.drawing]: {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      svg: 'image/svg+xml',
    },
  };

  return exportFormats[googleMimeType]?.[format] || 'application/pdf';
}

/**
 * Gets a user-friendly file type description
 */
export function getFileTypeDescription(mimeType: string): string {
  const descriptions: Record<string, string> = {
    'text/plain': 'Text File',
    'text/markdown': 'Markdown Document',
    'text/csv': 'CSV Spreadsheet',
    'application/json': 'JSON File',
    'text/javascript': 'JavaScript File',
    'text/typescript': 'TypeScript File',
    'text/html': 'HTML Document',
    'text/css': 'CSS Stylesheet',
    'application/pdf': 'PDF Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/svg+xml': 'SVG Image',
    'video/mp4': 'MP4 Video',
    'audio/mpeg': 'MP3 Audio',
    'application/zip': 'ZIP Archive',
    [GOOGLE_MIME_TYPES.document]: 'Google Doc',
    [GOOGLE_MIME_TYPES.spreadsheet]: 'Google Sheet',
    [GOOGLE_MIME_TYPES.presentation]: 'Google Slides',
    [GOOGLE_MIME_TYPES.folder]: 'Folder',
    [GOOGLE_MIME_TYPES.form]: 'Google Form',
    [GOOGLE_MIME_TYPES.drawing]: 'Google Drawing',
  };

  return descriptions[mimeType] || 'File';
}


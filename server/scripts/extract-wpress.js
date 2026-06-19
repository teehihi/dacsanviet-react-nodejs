import fs from 'node:fs';
import path from 'node:path';

const BLOCK_SIZE = 4377;

function readString(buffer, start, length) {
  return buffer.subarray(start, start + length).toString('utf8').replace(/\0/g, '').trim();
}

export function listWpressFiles(archivePath) {
  const fd = fs.openSync(archivePath, 'r');
  const files = [];
  try {
    let offset = 0;
    const header = Buffer.alloc(BLOCK_SIZE);
    while (fs.readSync(fd, header, 0, BLOCK_SIZE, offset) === BLOCK_SIZE) {
      if (header.every((byte) => byte === 0)) break;
      const name = readString(header, 0, 255);
      const size = Number(readString(header, 255, 14) || 0);
      const mtime = Number(readString(header, 269, 12) || 0);
      const prefix = readString(header, 281, 4096);
      const filename = prefix && prefix !== '.' ? `${prefix}/${name}` : name;
      files.push({ filename, size, mtime, offset: offset + BLOCK_SIZE });
      offset += BLOCK_SIZE + size;
    }
  } finally {
    fs.closeSync(fd);
  }
  return files;
}

export function extractWpressFile(archivePath, wantedName, targetPath) {
  const fd = fs.openSync(archivePath, 'r');
  try {
    for (const file of listWpressFiles(archivePath)) {
      if (file.filename === wantedName || path.basename(file.filename) === wantedName) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        const out = fs.openSync(targetPath, 'w');
        try {
          const buffer = Buffer.alloc(1024 * 1024);
          let read = 0;
          while (read < file.size) {
            const chunk = Math.min(buffer.length, file.size - read);
            const bytes = fs.readSync(fd, buffer, 0, chunk, file.offset + read);
            if (!bytes) break;
            fs.writeSync(out, buffer, 0, bytes);
            read += bytes;
          }
        } finally {
          fs.closeSync(out);
        }
        return targetPath;
      }
    }
  } finally {
    fs.closeSync(fd);
  }
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const archive = process.argv[2];
  const target = process.argv[3] || path.resolve('tmp/wp/database.sql');
  if (!archive) throw new Error('Usage: node scripts/extract-wpress.js <backup.wpress> [target.sql]');
  const extracted = extractWpressFile(archive, 'database.sql', target);
  console.log(extracted ? `Extracted ${extracted}` : 'database.sql not found');
}

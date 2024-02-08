import fs from 'fs';

export async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
}

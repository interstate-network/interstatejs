import fs from 'fs';
import path from 'path';
import { compileHypervisor } from '../src/lib/compile';

const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);

const output = compileHypervisor();
fs.writeFileSync(
  path.join(distPath, 'build.json'),
  JSON.stringify(output, null, 2)
);
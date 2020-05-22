import poetryChuExtras from '../poetryChuExtras';
import fs from 'fs';
const extras = [];
const names: string[] = [];
for (let item of poetryChuExtras) {
  if (names.includes(item['name'])) {
    console.info(`name ${item['name']} already exists, skip it.`);
    continue;
  }
  extras.push(item);
  names.push(item['name']);

}

fs.writeFileSync('poetryChuExtras.json', JSON.stringify({ names, extras }, null, 2));
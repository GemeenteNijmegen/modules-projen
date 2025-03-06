import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';


export function bundleTemplates() {
  console.log('Bundeling default code into project...');
  const templates = readdirSync('./templates').filter(file => file.endsWith('.ts'));
  const text = [
    '// Note this file is auto-generated',
  ];
  for (const template of templates) {
    let content = readFileSync(join('./templates', template)).toString('utf-8');
    content = content.replace(/`/g, '\\`');
    content = content.replace(/\$\{/g, '\\${');
    const name = template.replace('.ts', '');
    text.push(`export const ${name} = \`${content}\``);
  }
  writeFileSync('./src/sample/TemplateText.ts', text.join('\n'), {
    flag: 'w',
  });
}
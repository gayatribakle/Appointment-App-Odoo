const fs = require('fs');
const path = require('path');

const dir1 = 'e:\\Odoo_Hackathon_Cus\\customer-view\\frontend\\src\\pages';
const dir2 = 'e:\\Odoo_Hackathon_Cus\\customer-view\\frontend\\src\\components';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      const p = path.join(dir, file);
      let content = fs.readFileSync(p, 'utf8');
      
      content = content.replace(/'#111827'/gi, "'var(--text)'");
      content = content.replace(/'#6b7280'/gi, "'var(--text-secondary)'");
      content = content.replace(/'#9ca3af'/gi, "'var(--text-secondary)'");
      content = content.replace(/'#fff'/gi, "'var(--white)'");
      content = content.replace(/'#ffffff'/gi, "'var(--white)'");
      content = content.replace(/'#f9fafb'/gi, "'var(--bg)'");
      content = content.replace(/'#f3f4f6'/gi, "'var(--bg)'");
      content = content.replace(/'#e5e7eb'/gi, "'var(--border)'");
      content = content.replace(/'#d1d5db'/gi, "'var(--border)'");
      content = content.replace(/'#4f46e5'/gi, "'var(--primary)'");
      content = content.replace(/'#eef2ff'/gi, "'var(--primary-bg)'");
      content = content.replace(/'#e0e7ff'/gi, "'var(--primary-bg)'");
      content = content.replace(/'#c7d2fe'/gi, "'var(--primary-light)'");
      
      fs.writeFileSync(p, content);
    }
  });
}

replaceInDir(dir1);
replaceInDir(dir2);
console.log('Colors replaced.');

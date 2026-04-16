const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = {
  '#0A0B0D': 'var(--bg-main)',
  '#15171B': 'var(--bg-card)',
  '#E0E0E0': 'var(--text-main)',
  '#7F8C8D': 'var(--text-muted)',
  '#2C3E50': 'var(--border-main)',
  '#2E86DE': 'var(--accent-primary)',
  '#27AE60': 'var(--accent-success)',
  '#c0392b': 'var(--accent-danger)',
  '#e74c3c': 'var(--accent-danger-hover)'
};

for (const [hex, cssVar] of Object.entries(replacements)) {
  const regex = new RegExp(hex, 'gi');
  content = content.replace(regex, cssVar);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Colors replaced successfully.');

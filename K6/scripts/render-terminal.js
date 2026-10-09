// Renders a saved k6 console log (reports/<run>/run-output.txt) as a terminal-styled HTML page,
// so it can be screenshotted for the README. ANSI colours from the summary are kept.
// Usage: node scripts/render-terminal.js <run-output.txt> <out.html> [header|summary|thresholds]
const fs = require('fs');

const [input, output, part = 'summary'] = process.argv.slice(2);
const lines = fs.readFileSync(input, 'utf8').split(/\r?\n/);

const COLORS = { 31: '#ff6b6b', 32: '#5af78e', 33: '#f3f99d', 36: '#57c7ff', 90: '#8a8f98' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function ansiToHtml(line) {
  let out = '';
  let open = 0;
  for (const piece of line.split(/(\x1b\[[0-9;]*m)/)) {
    const m = piece.match(/^\x1b\[([0-9;]*)m$/);
    if (!m) { out += esc(piece); continue; }
    for (const code of m[1].split(';').map(Number)) {
      if (code === 0) { out += '</span>'.repeat(open); open = 0; }
      else if (COLORS[code]) { out += `<span style="color:${COLORS[code]}">`; open++; }
      else if (code === 2) { out += '<span style="opacity:.6">'; open++; }
      else if (code === 1) { out += '<span style="font-weight:700">'; open++; }
    }
  }
  return out + '</span>'.repeat(open);
}

// The run uses --no-color, so the only ANSI-coloured lines are the end-of-test summary from handleSummary.
const firstProgress = lines.findIndex((l) => /running \(/.test(l));
const summaryStart = lines.findIndex((l) => l.includes('\x1b['));
const summaryEnd = lines.reduce((idx, l, i) => (i > summaryStart && /running \(/.test(l) ? i : idx), lines.length);
let selected;
if (part === 'header') {
  selected = lines.slice(0, firstProgress).filter((l) => !/level=/.test(l));
} else {
  const summary = [
    ...lines.slice(summaryStart, summaryEnd),
    ...lines.slice(summaryEnd).filter((l) => /level=error/.test(l)),
  ];
  // collapse runs of blank lines
  selected = summary.filter((l, i, a) => !(l.trim() === '' && (a[i - 1] || '').trim() === ''));
  if (part === 'thresholds') {
    selected = selected.filter((l) => /checks|_success|_duration|http_req_failed|http_req_duration|\{ (api|type)|level=error|level=warning/.test(l));
  }
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#1e1f29;}
.win{margin:0;padding:0 0 18px;background:#1e1f29;}
.bar{background:#2b2d3a;padding:10px 14px;display:flex;gap:8px;align-items:center;font:13px system-ui;color:#aab}
.dot{width:12px;height:12px;border-radius:50%}
pre{margin:0;padding:14px 18px;color:#e6e6e6;font:13px/1.45 Consolas,'Cascadia Mono',monospace;white-space:pre-wrap;word-break:break-all}
</style></head><body><div class="win"><div class="bar"><span class="dot" style="background:#ff5f56"></span><span class="dot" style="background:#ffbd2e"></span><span class="dot" style="background:#27c93f"></span>&nbsp; PowerShell — npm run test:dashboard</div>
<pre>${selected.map(ansiToHtml).join('\n')}</pre></div></body></html>`;
fs.writeFileSync(output, html);
console.log(`Wrote ${output} (${selected.length} lines)`);

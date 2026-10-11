export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderLayout(pageTitle: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)} - Arkham XP Tracker</title>
  <link rel="stylesheet" href="/styles/arkham.css">
</head>
<body>
  <header class="page-header">
    <h1>Arkham XP Tracker</h1>
    <p>The night is dark, and experience points are precious.</p>
  </header>
  <main>
    ${content}
  </main>
</body>
</html>`;
}

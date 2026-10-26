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
  <meta name="description" content="Track investigator experience across Arkham Horror: The Card Game campaigns.">
  <meta name="theme-color" content="#0b1410">
  <link rel="manifest" href="/pwa/manifest.webmanifest">
  <link rel="icon" type="image/png" sizes="32x32" href="/pwa/icons/favicon-32.png">
  <link rel="apple-touch-icon" href="/pwa/icons/apple-touch-icon.png">
  <link rel="stylesheet" href="/styles/arkham.css">
</head>
<body>
  <header class="page-header">
    <h1>Arkham XP Tracker<span class="title-subtitle">The Card Game Campaign Log</span></h1>
    <p>The night is dark, and experience points are precious.</p>
    <form method="post" action="/auth/sign-out">
      <button class="sign-out-button" type="submit">Sign out</button>
    </form>
  </header>
  <main>
    ${content}
  </main>
  <script>
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/pwa/sw.js", { scope: "/" }).catch(function (error) {
          console.warn("Service worker registration failed:", error);
        });
      });
    }
  </script>
</body>
</html>`;
}

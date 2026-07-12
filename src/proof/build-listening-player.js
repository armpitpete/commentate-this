function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function buildListeningPlayer({ title, sourceText, disclosure, segments }) {
  const plan = segments.map((segment) => ({
    filename: segment.filename,
    label: `${segment.speaker}: ${segment.role}`,
    pauseBeforeMs: segment.pauseBeforeMs,
    pauseAfterMs: segment.pauseAfterMs
  }));

  const transcript = segments
    .map(
      (segment) =>
        `<li><strong>${escapeHtml(segment.speaker)} — ${escapeHtml(segment.role)}</strong><br>${escapeHtml(segment.text ?? "See script.json")}</li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — listening proof</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 52rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    button { min-height: 3rem; padding: 0.7rem 1rem; margin: 0 0.5rem 0.75rem 0; font: inherit; }
    .status { min-height: 1.6rem; font-weight: 700; }
    .notice { border-left: 0.3rem solid currentColor; padding-left: 1rem; }
    li { margin-bottom: 0.8rem; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p><strong>Source:</strong> ${escapeHtml(sourceText)}</p>
    <p class="notice"><strong>Disclosure:</strong> ${escapeHtml(disclosure)}</p>
    <p>This proof player performs the generated WAV segments in order and preserves the scripted pauses. No crowd audio is included.</p>
    <button id="play" type="button">Play complete commentary</button>
    <button id="stop" type="button">Stop</button>
    <p id="status" class="status" role="status" aria-live="polite">Ready.</p>
    <h2>Segment order</h2>
    <ol>${transcript}</ol>
  </main>
  <script>
    const plan = ${safeJson(plan)};
    const playButton = document.getElementById("play");
    const stopButton = document.getElementById("stop");
    const status = document.getElementById("status");
    let stopped = false;
    let currentAudio = null;

    const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

    async function playFile(item) {
      currentAudio = new Audio(item.filename);
      currentAudio.preload = "auto";
      await new Promise((resolve, reject) => {
        currentAudio.addEventListener("ended", resolve, { once: true });
        currentAudio.addEventListener("error", () => reject(new Error("Could not play " + item.filename)), { once: true });
        currentAudio.play().catch(reject);
      });
      currentAudio = null;
    }

    async function playAll() {
      stopped = false;
      playButton.disabled = true;
      try {
        for (const item of plan) {
          if (stopped) break;
          status.textContent = "Preparing " + item.label + "…";
          await wait(item.pauseBeforeMs);
          if (stopped) break;
          status.textContent = "Playing " + item.label + "…";
          await playFile(item);
          if (stopped) break;
          await wait(item.pauseAfterMs);
        }
        status.textContent = stopped ? "Stopped." : "Complete.";
      } catch (error) {
        status.textContent = error.message;
      } finally {
        playButton.disabled = false;
      }
    }

    playButton.addEventListener("click", playAll);
    stopButton.addEventListener("click", () => {
      stopped = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      status.textContent = "Stopped.";
      playButton.disabled = false;
    });
  </script>
</body>
</html>
`;
}

export function buildProofSetIndex({ title, disclosure, cases }) {
  const links = cases
    .map(
      (item) =>
        `<li><a href="${encodeURIComponent(item.id)}/listen.html">${escapeHtml(item.id)}</a> — ${escapeHtml(item.text)}</li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 52rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    li { margin-bottom: 0.9rem; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p><strong>Disclosure:</strong> ${escapeHtml(disclosure)}</p>
    <p>Open each proof, play the complete commentary, then record the scores in <code>listening-results.csv</code>.</p>
    <ol>${links}</ol>
  </main>
</body>
</html>
`;
}

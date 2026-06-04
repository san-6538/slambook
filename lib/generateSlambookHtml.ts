// Builds a single, fully self-contained HTML keepsake of a filled slambook.
// All photos are embedded inline as base64 data URLs, all CSS is inlined, and
// no external network requests are made — so the file opens offline anywhere
// and the photos never have to live on a server.

export interface SlambookHtmlData {
  creatorName: string;
  friendName: string;
  relationshipTitle: string;
  answers: { question: string; answer: string }[];
  media: { bestPhoto?: string; chaoticMemory?: string; neverDelete?: string };
  summary: { text: string; keywords: string[] };
}

function esc(value: string): string {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateSlambookHtml(data: SlambookHtmlData): string {
  const half = Math.ceil(data.answers.length / 2);
  const leftAnswers = data.answers.slice(0, half);
  const rightAnswers = data.answers.slice(half);

  const qa = (a: { question: string; answer: string }) => `
        <div class="qa">
          <h4>${esc(a.question)}</h4>
          <p>&ldquo;${esc(a.answer)}&rdquo;</p>
        </div>`;

  const photo = (src: string | undefined, label: string, cls: string) =>
    src
      ? `
          <figure class="photo ${cls}">
            <img src="${src}" alt="${esc(label)}" />
            <figcaption>${esc(label)}</figcaption>
          </figure>`
      : '';

  const keywords = (data.summary?.keywords || [])
    .map((k) => `<span class="tag">#${esc(k)}</span>`)
    .join('');

  // Machine-readable copy of the whole slambook (including embedded photos), so the
  // creator can re-import this file later and recover the photos reliably. We escape
  // "<" to "<" so the JSON can never break out of the <script> tag.
  const embeddedJson = JSON.stringify({
    creatorName: data.creatorName,
    friendName: data.friendName,
    relationshipTitle: data.relationshipTitle,
    answers: data.answers,
    media: data.media,
    summary: data.summary,
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Slambook — ${esc(data.creatorName)} &amp; ${esc(data.friendName)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #e2e8f0;
    color: #1e293b;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 32px 16px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .wrap { max-width: 1100px; margin: 0 auto; }
  .banner {
    background: #fff; border-radius: 16px; padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
  }
  .banner h1 { font-size: 18px; margin: 0; }
  .banner button {
    border: 0; background: #0f172a; color: #fff; padding: 10px 18px;
    border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .book { display: flex; gap: 16px; flex-wrap: wrap; }
  .page {
    flex: 1 1 380px; background: #fcfbf4; border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0,0,0,.18); padding: 40px; position: relative;
    overflow: hidden; min-width: 300px; display: flex; flex-direction: column;
  }
  .title { text-align: center; margin-bottom: 28px; }
  .title h2 {
    font-size: 34px; margin: 0 0 12px; transform: rotate(-2deg);
    font-weight: 800;
  }
  .pill {
    display: inline-block; background: #fce7f3; color: #be185d;
    padding: 5px 14px; border-radius: 999px; font-size: 14px; font-weight: 700;
    transform: rotate(1deg);
  }
  .qa {
    background: rgba(255,255,255,.6); border: 1px solid #e2e8f0;
    border-radius: 12px; padding: 16px; margin-bottom: 18px;
  }
  .qa h4 { margin: 0 0 8px; font-size: 15px; color: #334155; }
  .qa p { margin: 0; font-style: italic; color: #475569; }
  .summary { margin-top: auto; padding-top: 24px; border-top: 1px solid #cbd5e1; }
  .summary .label { text-align: center; font-weight: 700; color: #475569; font-size: 14px; }
  .summary .text { text-align: center; font-style: italic; color: #64748b; font-size: 13px; margin: 8px 0 0; }
  .tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 16px; }
  .tag {
    font-size: 10px; text-transform: uppercase; font-weight: 700;
    background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px;
  }
  .photos { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .photo { margin: 0; background: #f1f5f9; border-radius: 12px; overflow: hidden;
    border: 5px solid #fff; box-shadow: 0 6px 14px rgba(0,0,0,.12); position: relative; }
  .photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .photo.best { grid-column: span 2; aspect-ratio: 16/9; transform: rotate(1deg); }
  .photo.chaotic { aspect-ratio: 1/1; transform: rotate(-2deg); }
  .photo.keeper { aspect-ratio: 1/1; transform: rotate(2deg); }
  .photo figcaption {
    position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.5);
    color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
  }
  .heart { text-align: center; margin-top: auto; padding-top: 24px; color: #f472b6; font-size: 22px; }
  @media print {
    body { background: #fff; padding: 0; }
    .banner { display: none; }
    .page { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="banner">
      <h1>A Slambook for ${esc(data.creatorName)} 💞</h1>
      <button onclick="window.print()">Save as PDF / Print</button>
    </div>
    <div class="book">
      <div class="page">
        <div class="title">
          <h2>${esc(data.creatorName)} &amp; ${esc(data.friendName)}</h2>
          <span class="pill">${esc(data.relationshipTitle)}</span>
        </div>
        ${leftAnswers.map(qa).join('')}
        <div class="summary">
          <div class="label">Summary of Us</div>
          <p class="text">${esc(data.summary?.text || '')}</p>
          <div class="tags">${keywords}</div>
        </div>
      </div>
      <div class="page">
        <div class="photos">
          ${photo(data.media?.bestPhoto, 'Best Photo', 'best')}
          ${photo(data.media?.chaoticMemory, 'Chaotic', 'chaotic')}
          ${photo(data.media?.neverDelete, 'Keeper', 'keeper')}
        </div>
        ${rightAnswers.map(qa).join('')}
        <div class="heart">&#10084;</div>
      </div>
    </div>
  </div>
  <script type="application/json" id="slambook-data">${embeddedJson}</script>
</body>
</html>`;
}

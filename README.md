# Radmila G. — portfolio

Vite + TypeScript, HTML and CSS. Run `npm install`, then `npm run dev`.
`npm run build` runs the TypeScript check and creates `dist/`.
`npm run preview` serves that build locally.

## Project content

`src/projects.ts` contains the RU/EN project descriptions, verified technology
tags, covers and explicit video imports. AutoProfi, AI Roadmap Generator,
Yandex Mail and AI Quote Assistant form the primary 2×2 AI project grid;
Smart Downloads Sorter and AI Page Assistant form a compact secondary row.
Art Detective and five web projects remain in separate secondary groups. The
hero, identity, services, about and contact retain the original visual system.

Descriptions use the supplied brief and the visible demonstration scenarios.
Roadmap's technology list is present in the original portfolio data and the
existing long-form video cover. Other backend stacks have not been inferred.

## Demo assets

These exact source files must be present in `Video/` when building:

- `AutoProfi_Voice_Agent_GR.mp4`
- `Yandex_Mail_Agent_PRIVATE_GR.mp4`
- `AI_Quote_Assistant_GR.mp4`
- `Smart_Downloads_Sorter_CLEAN_GR.mp4`
- `AI_Roadmap_Generator_FINAL_GR.mp4`
- `AI_Page_Assistant_GR.mp4`

The existing `.gitignore` excludes MP4 files. A fresh Git checkout therefore
needs these local assets before it can build; the current local `dist/` includes
all six. No remote deployment was performed. The alternate Roadmap video and
DocSend video remain untouched and are not bundled.

`Video/posters/` contains lightweight WebP derivatives of existing covers and
video title frames. Original images and videos are retained. Images load lazily;
the single native dialog receives a video URL only after an explicit demo click.
Closing it pauses playback and releases the source. Playback errors show a
localized message with a direct-file fallback. Native controls, inline playback,
Escape, focus restoration and reduced-motion behavior are supported.

## Information still needed

- Verified stacks for AutoProfi, Mail, Quote, Sorter and Page Assistant.
- Verified URLs, screenshots, project briefs and stacks for the web projects.
- A more detailed Art Detective brief and a verified demo URL.
- Reviewed captions/transcripts for videos; none were supplied. Descriptions
  summarize the scenario but are not full transcripts.

## Verification — 2026-09-16

- `npm run build`: TypeScript and Vite pass.
- Browser checks against the production preview in Microsoft Edge / Playwright:
  RU and EN at 320, 390, 768, 1024 and 1440 px; no horizontal overflow.
- All images load; six AI cases, one creative case and five web cases render.
- No MP4 requests before a demo click; all six videos decode and play.
- Keyboard opening, Escape, focus return, mobile menu and mobile player checked.
- Failed-video fallback checked by blocking the video request.
- No console/page errors or HTTP resource errors in normal operation.
- SHA-256 checks: all eight original MP4 files unchanged.

Local screenshots, browser checks and results are in the ignored
`visual-checks/` directory. These checks do not constitute testing on physical
iOS/Android devices or a complete accessibility audit.

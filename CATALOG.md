# Cherri catalog import

Snapshot: October 6, 2026 (Pacific).

Includes public browser catalogs and public Cloud catalog. Game code is not copied; browser entries embed their source URLs in a sandbox. Cloud entries link to Cherri and are labeled separately. Cherri emulator catalog returned HTTP 401; private ROM uploads and runtime Lumin SDK catalogs are not included.

- Seraph: 501 entries, https://cherrion.top/assets/json/seraph.json
- GN Math: 818 entries, https://cherrion.top/assets/json/gn-math.json
- Truffled: 505 entries, https://cherrion.top/assets/json/truffled.json
- UGS: 1512 entries, https://cherrion.top/assets/json/ugs.json
- CKV: 821 entries, https://cherrion.top/assets/json/ckv.json
- Cloud: 209 entries, https://cherrion.top/api/cloud/games

2931 distinct names; duplicates are alternate versions. External availability and access requirements are controlled by the source.

## Player repair

- Desktop games now use a fitted 960 x 640 canvas area (portrait games use 480 x 800), with an optional responsive-window mode.
- Full-screen mode expands the whole player; frame focus, reload, and source switching have explicit controls.
- Drive Mad Truffled source disabled: four referenced scripts returned HTTP 404. CKV alternative also disabled after its required CDN scripts returned HTTP 403. The official Poki page is provided as a clearly labeled external link.
- Cross-origin iframe load events confirm navigation only, never successful gameplay. The player does not falsely mark an entry as working from an HTTP 200 response.
- Local real-time games wait for Start game instead of running while instructions are being read.

## CrazyGames directory and AI (2026-10-07)

Imported all 4,444 unique `/game/` links in the official English public sitemap:
https://www.crazygames.com/en/sitemap . Titles are readable URL slugs (Basket
Random uses verified page metadata); they are not guaranteed official display
names. The import is a snapshot, not a live sync. Cover URLs are supplied by
the sitemap. Games open the official CrazyGames player. No CrazyGames game
code is copied or hosted; this does not defeat site locks or network filters.

Browser sources now live in `web/`; `scripts/build.mjs` bundles them into the
Worker alongside `/api/chat` and `/api/chat/status`. All original games and
Cherri versions remain available. `scripts/dev.mjs` serves the built Worker
locally with AI disconnected (no credentials read from the developer machine).

AI uses the AI SDK and OpenAI Responses API with `gpt-5.4-nano`, server-only
`OPENAI_API_KEY`, `store:false`, bounded message history, 600 output tokens,
a 25-second timeout, and no automatic retries. It remains disabled without
both the secret and D1 binding. Provision the secret through the OpenAI
Developers plugin with its required owner approval, then set it as a Sites
secret. Never place a key in browser code or source control.

D1 stores only the date and a shared usage count: an atomic hard maximum of
100 provider attempts per UTC day for the entire site. Failed provider calls
still count. No chat content or visitor identifiers are saved by this app.
This is a request cap, not a provider billing-dollar cap. OpenAI processing
and retention policies still apply. The chat clears on page reload. No tools,
web browsing, or game-screen access are granted to the AI.

Validation: node tests exercise the real chat handler with mocked model output,
no-key state, validation, origin check, error redaction, and quota SQL using
SQLite. A live provider response cannot be verified until the owner connects
AI. External game availability is not guaranteed; school policies are not
changed by this site.

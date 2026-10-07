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

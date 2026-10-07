"""Import public directory links, not third-party game code."""
import json, xml.etree.ElementTree as ET, urllib.request, sys, re
from pathlib import Path
source='https://www.crazygames.com/en/sitemap'
xml=Path(sys.argv[1]).read_bytes() if len(sys.argv)>1 else urllib.request.urlopen(source,timeout=30).read()
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','im':'http://www.google.com/schemas/sitemap-image/1.1'}
entries=[];seen=set()
for item in ET.fromstring(xml).findall('s:url',ns):
 url=item.findtext('s:loc','',ns)
 if not url.startswith('https://www.crazygames.com/game/') or url in seen:continue
 seen.add(url);slug=url.rsplit('/',1)[-1]
 name=slug.replace('-',' ').title()
 image=item.findtext('im:image/im:loc','',ns)
 entries.append({'name':name,'image':image,'versions':[{'collection':'CrazyGames','mode':'link','provider':'CrazyGames','url':url,'description':'Play the full game on CrazyGames in a new tab. It uses the official player, including any ads or sign-in options.'}]})
# Published page metadata supplies verified names for these popular games.
basket=Path('/tmp/crazy-basket-data.json')
if basket.exists():
 g=json.loads(basket.read_text())['props']['pageProps']['game']
 for e in entries:
  if e['versions'][0]['url'].endswith('/'+g['slug']):e['name']=g['name']
Path('web/crazygames.json').write_text(json.dumps({'source':source,'importedAt':'2026-10-07','games':entries},separators=(',',':')))
print(f'Imported {len(entries)} unique CrazyGames links')

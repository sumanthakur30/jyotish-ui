#!/bin/bash
set -euo pipefail
sudo mkdir -p /var/www/astro-ui /tmp/astro-ui-new
sudo python3 - <<'PY'
import zipfile, shutil, os
dest = "/tmp/astro-ui-new"
if os.path.isdir(dest):
    shutil.rmtree(dest)
os.makedirs(dest)
with zipfile.ZipFile("/tmp/astro-ui.zip") as z:
    z.extractall(dest)
print("extracted")
PY
sudo rsync -a --delete /tmp/astro-ui-new/ /var/www/astro-ui/
sudo chown -R nginx:nginx /var/www/astro-ui
sudo cp /tmp/astro-ui.conf /etc/nginx/conf.d/astro-ui.conf
sudo cp /tmp/astro-ui-port.conf /etc/nginx/conf.d/astro-ui-port.conf
sudo nginx -t
sudo systemctl reload nginx
rm -rf /tmp/astro-ui-new
echo "OK files=$(ls /var/www/astro-ui | wc -l)"
curl -s -o /dev/null -w "host80:%{http_code} " -H "Host: astro.sugamflow.com" http://127.0.0.1/
curl -s -o /dev/null -w "p4600:%{http_code} " http://127.0.0.1:4600/
curl -s -o /dev/null -w "status:%{http_code}\n" http://127.0.0.1:4600/api/v1/jyotish/status

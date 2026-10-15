"""Gera o site a partir de src/index.template.html.

- index.html: página completa para o GitHub Pages, com as imagens em img/.
- dist/artifact.html: versão autocontida (imagens embutidas) para o link de teste.
"""
import base64
import pathlib

root = pathlib.Path(__file__).parent
tpl = (root / "src" / "index.template.html").read_text(encoding="utf-8")
images = {"HERO": "hero.jpg", "ELVIRA": "elvira.jpg", "PRISCILA": "priscila.jpg"}


def fill(html, inline):
    for key, name in images.items():
        if inline:
            data = base64.b64encode((root / "img" / name).read_bytes()).decode()
            src = "data:image/jpeg;base64," + data
        else:
            src = "img/" + name
        html = html.replace("{{%s}}" % key, src)
    return html


# Tudo antes do <header> vai no <head>.
marker = '<header class="site-header">'
head, body = tpl.split(marker, 1)
page = (
    '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + head.strip()
    + "\n</head>\n<body>\n"
    + marker
    + body.rstrip()
    + "\n</body>\n</html>\n"
)
(root / "index.html").write_text(fill(page, inline=False), encoding="utf-8")
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(fill(tpl, inline=True), encoding="utf-8")
print("ok")

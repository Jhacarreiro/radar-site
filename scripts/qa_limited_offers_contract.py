#!/usr/bin/env python3
"""Static contract checks for /whipit/limited-offers.

These tests encode the documented public contract in
openclaw-wiki/Projects/lidl-finds/architecture.md:
- Browser sends product_code to /api/lidl/availability.
- Public products JSON must not expose store_stock_id, global_availability or image_source.
- Static project pages should redirect http://getrad.ar to https://getrad.ar.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

INTERNAL_FIELDS = {"store_stock_id", "global_availability", "image_source"}
REAL_INDICATORS = {"AVAILABLE", "HIGH_STOCK", "LOW_STOCK", "SOLD_OUT", "NOT_IN_THIS_STORE"}
HTTPS_JS_REDIRECT_MARKER = 'location.protocol==="http:"&&location.hostname==="getrad.ar"'


def fail(message: str) -> None:
    raise AssertionError(message)


def load_text(path: Path) -> str:
    if not path.exists():
        fail(f"missing file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    if not path.exists():
        fail(f"missing file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def parse_attrs(tag: str) -> dict[str, str]:
    return {m.group(1): html.unescape(m.group(2)) for m in re.finditer(r'([\w:-]+)="([^"]*)"', tag)}


def article_attrs(index_html: str) -> list[dict[str, str]]:
    return [parse_attrs(m.group(0)) for m in re.finditer(r'<article\b[^>]*\bdata-card\b[^>]*>', index_html)]



def validate_404_about(root: Path) -> None:
    page = root / "static" / "404.html"
    text = load_text(page)
    if "About me — João Carreiro" not in text:
        fail("404.html is not based on the About page")
    if "/whipit/about/assets/style.css" not in text:
        fail("404.html is missing About page stylesheet")

def validate_no_per_page_https_redirect(root: Path) -> list[str]:
    """HTTPS is enforced by GitHub Pages settings, not by per-page JS."""
    checked: list[str] = []
    paths = sorted((root / "static").rglob("*.html"))
    baseof = root / "layouts" / "_default" / "baseof.html"
    if baseof.exists():
        paths.append(baseof)
    for path in paths:
        text = load_text(path)
        if HTTPS_JS_REDIRECT_MARKER in text:
            fail(f"per-page HTTPS JavaScript redirect should not be present in {path}")
        checked.append(str(path.relative_to(root)))
    return checked


def validate_public_json(base: Path) -> None:
    for rel in ["data/products.json", "data/offers.json", "pl/data/products.json", "pl/data/offers.json"]:
        path = base / rel
        payload = load_json(path)
        rows = payload.get("products") or payload.get("offers") or []
        if not isinstance(rows, list):
            fail(f"{path} has no products/offers list")
        for i, row in enumerate(rows):
            leaked = sorted(INTERNAL_FIELDS.intersection(row))
            if leaked:
                fail(f"{path}:{i} exposes internal fields: {', '.join(leaked)}")


def validate_lidl_availability_ids(base: Path) -> None:
    index_html = load_text(base / "index.html")
    cards = article_attrs(index_html)
    lidl_cards = [c for c in cards if c.get("data-retailer") == "LIDL"]
    if not lidl_cards:
        fail("no Lidl cards found in index.html")
    checked = 0
    for card in lidl_cards:
        aid = card.get("data-availability-id", "")
        url = card.get("data-product-url", "")
        title = card.get("data-product-title", "<unknown>")
        match = re.search(r"/p(\d{5,12})(?:[/?#]|$)", url)
        if not match:
            continue
        product_code = match.group(1)
        if aid != product_code:
            fail(f"Lidl card {title!r} uses availability id {aid!r}, expected product_code {product_code!r}")
        if aid.startswith("0"):
            fail(f"Lidl card {title!r} availability id looks like store_stock_id: {aid!r}")
        checked += 1
    if checked == 0:
        fail("no Lidl cards with product URL product_code were checked")


def validate_ui_regressions(base: Path) -> None:
    index_html = load_text(base / "index.html")
    app_js = load_text(base / "assets" / "app.js")
    style_css = load_text(base / "assets" / "style.css")
    if 'class="price-date"' in index_html:
        fail("duplicate price-date block is present in index.html")
    if "Lidl: dados em tempo real" in index_html or "Lidl: dados em tempo real" in app_js:
        fail("old Lidl availability note is still present")
    if "Lidl: dados em tempo real quando possível. Aldi" in index_html:
        fail("combined Lidl/Aldi note is present")
    if "Dados fornecidos pelo Lidl." not in app_js and "Dados fornecidos pelo Lidl." not in index_html:
        fail("new Lidl availability note is missing")
    if "function setSourceNote" not in app_js:
        fail("dynamic retailer-specific source note is missing")
    if "Modal geolocation v6" not in style_css:
        fail("geolocation modal CSS guard is missing")


def validate_live_api(base: Path) -> None:
    index_html = load_text(base / "index.html")
    cards = article_attrs(index_html)
    card = next((c for c in cards if c.get("data-retailer") == "LIDL" and c.get("data-availability-id")), None)
    if not card:
        fail("no Lidl card with data-availability-id for live test")
    product_code = card["data-availability-id"]
    stores_payload = load_json(base / "data" / "stores.json")
    stores = [s.get("id") for s in stores_payload.get("stores", []) if (s.get("retailer") or "LIDL") == "LIDL"][:3]
    if not stores:
        fail("no Lidl stores for live test")
    body = json.dumps({"country": "PT", "product_code": product_code, "store_ids": stores}).encode("utf-8")
    req = Request(
        "https://webhook.gallivanter.biz/api/lidl/availability",
        data=body,
        headers={"Content-Type": "application/json", "Origin": "https://getrad.ar", "User-Agent": "Mozilla/5.0 limited-offers-qa/1.0"},
        method="POST",
    )
    try:
        with urlopen(req, timeout=15) as res:
            payload = json.loads(res.read().decode("utf-8", "replace"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:200]
        fail(f"live API HTTP {exc.code}: {detail}")
    except URLError as exc:
        fail(f"live API network error: {exc}")
    indicators = [str(x.get("indicator", "UNKNOWN")).upper() for x in payload.get("stores", [])]
    if not indicators:
        fail("live API returned no stores")
    if all(x == "UNKNOWN" for x in indicators):
        fail(f"live API returned only UNKNOWN for product_code={product_code}, stores={stores}")
    if not any(x in REAL_INDICATORS for x in indicators):
        fail(f"live API returned no real indicators: {indicators}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="radar-site repository root")
    parser.add_argument("--live", action="store_true", help="also call the public availability proxy")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    base = root / "static" / "whipit" / "limited-offers"
    if not base.exists():
        fail(f"limited-offers static directory not found: {base}")
    validate_no_per_page_https_redirect(root)
    validate_404_about(root)
    validate_public_json(base)
    validate_lidl_availability_ids(base)
    validate_ui_regressions(base)
    if args.live:
        validate_live_api(base)
    print("OK limited-offers static contract checks passed" + (" + live API" if args.live else ""))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        raise SystemExit(1)

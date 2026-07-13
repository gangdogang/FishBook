#!/usr/bin/env python3
"""Collect Noryangjin auction prices into a CSV file.

The Noryangjin Fisheries Wholesale Market pages return server-rendered HTML
tables. This script posts the same form fields as the site and parses the
result with only Python standard-library modules.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


BASE_URL = "https://www.susansijang.co.kr"
TODAY_PRICE_PATH = "/nsis/miw/ko/info/miw3110"
SPECIES_LIST_PATH = "/nsis/miw/ko/info/todayKdfsh"
SOURCE = "noryangjin"
MARKET = "노량진수산물도매시장"
USER_AGENT = "FishNote data collector/0.1 (+https://www.fishnote.kr)"


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._in_table = False
        self._in_row = False
        self._in_cell = False
        self._cell_parts: List[str] = []
        self._row: List[str] = []
        self.rows: List[List[str]] = []

    def handle_starttag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        if tag == "table":
            self._in_table = True
        elif self._in_table and tag == "tr":
            self._in_row = True
            self._row = []
        elif self._in_table and self._in_row and tag in {"td", "th"}:
            self._in_cell = True
            self._cell_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self._in_cell:
            text = normalize_space("".join(self._cell_parts))
            self._row.append(text)
            self._cell_parts = []
            self._in_cell = False
        elif tag == "tr" and self._in_row:
            if self._row:
                self.rows.append(self._row)
            self._row = []
            self._in_row = False
        elif tag == "table":
            self._in_table = False

    def handle_data(self, data: str) -> None:
        if self._in_cell:
            self._cell_parts.append(data)


@dataclass(frozen=True)
class PriceRow:
    observed_date: str
    source: str
    market: str
    canonical_fish_name: str
    noryangjin_species_name: str
    source_species_name: str
    trade_state: str
    origin: str
    spec: str
    package_unit: str
    quantity: str
    weight: str
    high_price_krw: str
    low_price_krw: str
    avg_price_krw: str
    source_url: str


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_date(value: str) -> str:
    value = value.strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return value
    if re.fullmatch(r"\d{4}\.\d{2}\.\d{2}", value):
        return value.replace(".", "-")
    raise ValueError("date must be YYYY-MM-DD or YYYY.MM.DD")


def dot_date(value: str) -> str:
    return value.replace("-", ".")


def compact_date(value: str) -> str:
    return value.replace("-", "")


def default_date() -> str:
    try:
        from zoneinfo import ZoneInfo

        return dt.datetime.now(ZoneInfo("Asia/Seoul")).date().isoformat()
    except Exception:
        return dt.date.today().isoformat()


def parse_number(value: str) -> str:
    cleaned = value.replace(",", "").strip()
    if cleaned in {"", "-"}:
        return ""
    try:
        number = Decimal(cleaned)
    except InvalidOperation:
        return cleaned
    if number == number.to_integral():
        return str(int(number))
    return format(number.normalize(), "f")


def split_species(value: str) -> Tuple[str, str]:
    match = re.match(r"^\(([^)]+)\)(.+)$", value)
    if not match:
        return "", value.strip()
    return match.group(1).strip(), match.group(2).strip()


def load_aliases(path: Path) -> Dict[str, str]:
    aliases: Dict[str, str] = {}
    if not path.exists():
        return aliases
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            canonical = (row.get("canonical_fish_name") or "").strip()
            noryangjin = (row.get("noryangjin_species_name") or "").strip()
            if canonical and noryangjin:
                aliases[noryangjin] = canonical
    return aliases


def post(path: str, params: Dict[str, str], timeout: int) -> bytes:
    data = urllib.parse.urlencode(params).encode("utf-8")
    request = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers={
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def fetch_species(date: str, timeout: int) -> List[str]:
    payload = post(SPECIES_LIST_PATH, {"aucDe": compact_date(date)}, timeout)
    data = json.loads(payload.decode("utf-8"))
    if data.get("header", {}).get("returnCode") != "0200":
        return []
    return [item["kdfshNm"] for item in data.get("body", []) if item.get("kdfshNm")]


def fetch_price_page(date: str, species: str, page_index: int, timeout: int) -> str:
    payload = post(
        TODAY_PRICE_PATH,
        {
            "pageIndex": str(page_index),
            "pageUnit": "10",
            "pageSize": "10",
            "searchDe": dot_date(date),
            "kdfshNm": species,
        },
        timeout,
    )
    return payload.decode("utf-8", errors="replace")


def parse_price_rows(html: str, date: str, aliases: Dict[str, str]) -> List[PriceRow]:
    parser = TableParser()
    parser.feed(html)

    rows: List[PriceRow] = []
    for cells in parser.rows:
        if not cells or cells[0] == "어종" or "조회된 경락시세가 없습니다" in cells[0]:
            continue
        if len(cells) == 8:
            species, origin, spec, package_unit, quantity, high, low, avg = cells
            weight = ""
        elif len(cells) == 9:
            species, origin, spec, package_unit, quantity, weight, high, low, avg = cells
        else:
            continue

        trade_state, clean_species = split_species(species)
        canonical = aliases.get(clean_species, "")
        rows.append(
            PriceRow(
                observed_date=date,
                source=SOURCE,
                market=MARKET,
                canonical_fish_name=canonical,
                noryangjin_species_name=clean_species,
                source_species_name=species,
                trade_state=trade_state,
                origin=origin,
                spec=spec,
                package_unit=package_unit,
                quantity=parse_number(quantity),
                weight=parse_number(weight),
                high_price_krw=parse_number(high),
                low_price_krw=parse_number(low),
                avg_price_krw=parse_number(avg),
                source_url=BASE_URL + TODAY_PRICE_PATH,
            )
        )
    return rows


def collect_prices(
    date: str,
    species_names: Iterable[str],
    aliases: Dict[str, str],
    max_pages: int,
    timeout: int,
    sleep_seconds: float,
) -> List[PriceRow]:
    collected: List[PriceRow] = []
    seen: set[Tuple[str, ...]] = set()

    for species in species_names:
        empty_pages = 0
        for page_index in range(1, max_pages + 1):
            html = fetch_price_page(date, species, page_index, timeout)
            rows = parse_price_rows(html, date, aliases)
            if not rows:
                empty_pages += 1
                if empty_pages >= 1:
                    break
                continue

            new_count = 0
            for row in rows:
                key = tuple(getattr(row, field) for field in row.__dataclass_fields__)
                if key not in seen:
                    seen.add(key)
                    collected.append(row)
                    new_count += 1
            if new_count == 0:
                break
            if sleep_seconds:
                time.sleep(sleep_seconds)
    return collected


def write_csv(path: Path, rows: Sequence[PriceRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(PriceRow.__dataclass_fields__.keys())
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: getattr(row, field) for field in fieldnames})


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Collect Noryangjin auction prices.")
    parser.add_argument("--date", default=default_date(), help="Auction date, YYYY-MM-DD. Defaults to today in Asia/Seoul.")
    parser.add_argument("--species", action="append", help="Noryangjin species name to collect. Repeatable. Defaults to all species for the date.")
    parser.add_argument("--aliases", default="config/noryangjin_species_aliases.csv", help="CSV mapping Noryangjin species names to FishNote names.")
    parser.add_argument("--out", help="Output CSV path. Defaults to data/noryangjin/YYYY-MM-DD.csv.")
    parser.add_argument("--max-pages", type=int, default=80, help="Safety limit per species/date.")
    parser.add_argument("--timeout", type=int, default=15, help="HTTP timeout in seconds.")
    parser.add_argument("--sleep", type=float, default=0.15, help="Delay between page requests.")
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    date = normalize_date(args.date)
    out = Path(args.out) if args.out else Path("data") / "noryangjin" / f"{date}.csv"
    aliases = load_aliases(Path(args.aliases))

    if args.species:
        species_names = args.species
    else:
        species_names = fetch_species(date, args.timeout)
        if not species_names:
            print(f"No species list returned for {date}.", file=sys.stderr)
            return 2

    rows = collect_prices(
        date=date,
        species_names=species_names,
        aliases=aliases,
        max_pages=args.max_pages,
        timeout=args.timeout,
        sleep_seconds=args.sleep,
    )
    write_csv(out, rows)
    print(f"Wrote {len(rows)} rows to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

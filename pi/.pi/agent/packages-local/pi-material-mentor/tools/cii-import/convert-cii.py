#!/usr/bin/env python3
"""Convert the CII ebook PDF into chapter-oriented Markdown materials.

The converter is intentionally deterministic: it follows the PDF outline,
uses embedded font metadata to distinguish prose, headings, and code, removes
the repeated ebook footer, and preserves a source-page anchor for every page.
"""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


@dataclass(frozen=True)
class Material:
    outline_title: str
    filename: str
    markdown_title: str
    code_paths: tuple[str, ...] = ()


MATERIALS = (
    Material("Preface", "00-preface.md", "Preface"),
    Material("Introduction", "01-introduction.md", "Chapter 1 - Introduction", ("examples/double.c",)),
    Material(
        "Interfaces and Implementations",
        "02-interfaces-and-implementations.md",
        "Chapter 2 - Interfaces and Implementations",
        ("include/arith.h", "src/arith.c"),
    ),
    Material("Atoms", "03-atoms.md", "Chapter 3 - Atoms", ("include/atom.h", "src/atom.c")),
    Material(
        "Exceptions and Assertions",
        "04-exceptions-and-assertions.md",
        "Chapter 4 - Exceptions and Assertions",
        ("include/except.h", "src/except.c", "include/assert.h"),
    ),
    Material(
        "Memory Management",
        "05-memory-management.md",
        "Chapter 5 - Memory Management",
        ("include/mem.h", "src/mem.c", "src/memchk.c"),
    ),
    Material(
        "More Memory Management",
        "06-more-memory-management.md",
        "Chapter 6 - More Memory Management",
        ("include/arena.h", "src/arena.c"),
    ),
    Material("Lists", "07-lists.md", "Chapter 7 - Lists", ("include/list.h", "src/list.c")),
    Material(
        "Tables",
        "08-tables.md",
        "Chapter 8 - Tables",
        ("include/table.h", "src/table.c", "examples/wf.c", "examples/getword.h", "examples/getword.c"),
    ),
    Material(
        "Sets",
        "09-sets.md",
        "Chapter 9 - Sets",
        ("include/set.h", "src/set.c", "examples/xref.c", "examples/getword.h", "examples/getword.c"),
    ),
    Material(
        "Dynamic Arrays",
        "10-dynamic-arrays.md",
        "Chapter 10 - Dynamic Arrays",
        ("include/array.h", "include/arrayrep.h", "src/array.c"),
    ),
    Material("Sequences", "11-sequences.md", "Chapter 11 - Sequences", ("include/seq.h", "src/seq.c")),
    Material("Rings", "12-rings.md", "Chapter 12 - Rings", ("include/ring.h", "src/ring.c")),
    Material("Bit Vectors", "13-bit-vectors.md", "Chapter 13 - Bit Vectors", ("include/bit.h", "src/bit.c")),
    Material("Formatting", "14-formatting.md", "Chapter 14 - Formatting", ("include/fmt.h", "src/fmt.c")),
    Material(
        "Low-Level Strings",
        "15-low-level-strings.md",
        "Chapter 15 - Low-Level Strings",
        ("include/str.h", "src/str.c", "examples/ids.c"),
    ),
    Material("High-Level Strings", "16-high-level-strings.md", "Chapter 16 - High-Level Strings", ("include/text.h", "src/text.c")),
    Material(
        "Extended-Precision Arithmetic",
        "17-extended-precision-arithmetic.md",
        "Chapter 17 - Extended-Precision Arithmetic",
        ("include/xp.h", "src/xp.c"),
    ),
    Material(
        "Arbitrary-Precision Arithmetic",
        "18-arbitrary-precision-arithmetic.md",
        "Chapter 18 - Arbitrary-Precision Arithmetic",
        ("include/ap.h", "src/ap.c", "examples/calc.c"),
    ),
    Material(
        "Multiple-Precision Arithmetic",
        "19-multiple-precision-arithmetic.md",
        "Chapter 19 - Multiple-Precision Arithmetic",
        ("include/mp.h", "src/mp.c", "examples/mpcalc.c"),
    ),
    Material(
        "Threads",
        "20-threads.md",
        "Chapter 20 - Threads",
        (
            "include/thread.h",
            "include/sem.h",
            "include/chan.h",
            "src/thread.c",
            "src/chan.c",
            "examples/sort.c",
            "examples/spin.c",
            "examples/sieve.c",
        ),
    ),
    Material("Interface Summary", "90-interface-summary.md", "Interface Summary"),
    Material("Bibliography", "91-bibliography.md", "Bibliography"),
)


FOOTER_MARKERS = (
    "C Interfaces and Implementations: Techniques for Creating Reusable Software",
    "Prepared for ",
    "Copyright © 1997 by David R. Hanson",
    "Unauthorized use, reproduction and/or distribution",
)

# A handful of decorated initials are missing from this ebook's character map.
# The continuations below were verified against the rendered source pages.
MISSING_OPENERS = {
    186: "A sequence holds N values associated with the integer indices zero ",
    198: "A ring is much like a sequence: It holds N values associated with ",
    214: "The sets described in Chapter 9 can hold arbitrary elements ",
    284: "The functions exported by the Str interface described in the previ",
}


@dataclass
class Line:
    text: str
    x0: float
    top: float
    bottom: float
    max_size: float
    mono_ratio: float
    demi_ratio: float
    kind: str = "prose"
    dropcap_bottom: float | None = None


def normalize_text(text: str) -> str:
    replacements = {
        "(cid:2)": "<",
        "(cid:3)": ">",
        "(cid:162)": "<",
        "(cid:178)": ">",
        "(cid:4)": "",
        "(cid:5)": "",
        "(cid:6)": "",
        "¢": "<",
        "²": ">",
        "\u00a0": " ",
        "\ufb01": "fi",
        "\ufb02": "fl",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = text.replace("memory-manageobjects", "memory-managed objects")
    text = text.replace("nontrival", "nontrivial")
    text = text.replace("two’scomplement", "two’s-complement")
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text


def top_level_outline(reader: PdfReader) -> list[tuple[str, int]]:
    result: list[tuple[str, int]] = []
    for item in reader.outline:
        if isinstance(item, list):
            continue
        title = str(getattr(item, "title", item)).strip()
        page = reader.get_destination_page_number(item) + 1
        result.append((title, page))
    return result


def material_ranges(reader: PdfReader) -> dict[str, tuple[int, int]]:
    outline = top_level_outline(reader)
    starts = {title: page for title, page in outline}
    ranges: dict[str, tuple[int, int]] = {}
    for material in MATERIALS:
        if material.outline_title not in starts:
            raise ValueError(f"Outline entry not found: {material.outline_title}")
        start = starts[material.outline_title]
        later_pages = [page for _, page in outline if page > start]
        end = min(later_pages) - 1 if later_pages else len(reader.pages)
        ranges[material.outline_title] = (start, end)
    return ranges


def is_running_header(text: str, top: float) -> bool:
    if top > 95:
        return False
    if text == text.upper() and any(char.isalpha() for char in text):
        return True
    upper = text.upper()
    return bool(
        re.fullmatch(r"\d{1,3}\s+[A-Z][A-Z -]+", upper)
        or re.fullmatch(r"[A-Z][A-Z -]+\s+\d{1,3}", upper)
    )


def printed_page_number(lines: list[Line]) -> str | None:
    for line in lines:
        match = re.fullmatch(r"(\d{1,3})\s+[A-Z][A-Z -]+", line.text.upper())
        if line.top < 95 and match:
            return match.group(1)
        match = re.fullmatch(r"[A-Z][A-Z -]+\s+(\d{1,3})", line.text.upper())
        if line.top < 95 and match:
            return match.group(1)
    bottom_numbers = [line.text for line in lines if line.top > 660 and re.fullmatch(r"\d{1,3}", line.text)]
    return bottom_numbers[-1] if bottom_numbers else None


def classify_line(raw: dict) -> Line:
    text = normalize_text(raw.get("text", ""))
    chars = [char for char in raw.get("chars", []) if not char.get("text", "").isspace()]
    count = max(1, len(chars))
    mono = sum("Typewriter" in char.get("fontname", "") for char in chars) / count
    demi = sum("Demi" in char.get("fontname", "") for char in chars) / count
    max_size = max((float(char.get("size", 0)) for char in chars), default=0.0)

    line = Line(
        text=text,
        x0=float(raw.get("x0", 0)),
        top=float(raw.get("top", 0)),
        bottom=float(raw.get("bottom", 0)),
        max_size=max_size,
        mono_ratio=mono,
        demi_ratio=demi,
    )

    if max_size >= 40 and len(text) == 1 and text.isalpha():
        line.kind = "dropcap"
        line.dropcap_bottom = line.bottom
    elif "≡" in text and (text.startswith("<") or text.endswith("≡")):
        line.kind = "fragment"
    elif mono >= 0.55 and not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*\.", text):
        line.kind = "code"
    elif max_size >= 14 or demi >= 0.65:
        line.kind = "heading"
    return line


def extract_lines(page: pdfplumber.page.Page) -> tuple[list[Line], str | None]:
    raw_lines = page.extract_text_lines(layout=False, return_chars=True)
    lines = [classify_line(raw) for raw in raw_lines]
    printed = printed_page_number(lines)

    cleaned: list[Line] = []
    footer_started = False
    for line in lines:
        if any(marker in line.text for marker in FOOTER_MARKERS):
            footer_started = True
        if footer_started or not line.text:
            continue
        if is_running_header(line.text, line.top):
            continue
        if re.fullmatch(r"\d{1,3}", line.text) and (line.top < 90 or line.top > 650):
            continue
        if line.max_size >= 26 and line.kind != "dropcap":
            # Chapter title decoration; the converter supplies one stable H1.
            continue
        cleaned.append(line)
    return cleaned, printed


def join_prose(lines: list[Line]) -> str:
    result = ""
    for line in lines:
        text = line.text
        if not result:
            result = text
        elif result.endswith("-") and text and text[0].islower():
            prefix_match = re.search(r"([A-Za-z]+)-$", result)
            lexical_prefixes = {
                "application",
                "fixed",
                "high",
                "kernel",
                "low",
                "multi",
                "multiple",
                "non",
                "one",
                "pointer",
                "single",
                "thread",
                "two",
                "user",
                "variable",
            }
            if prefix_match and prefix_match.group(1).lower() in lexical_prefixes:
                result += text
            else:
                result = result[:-1] + text
        else:
            result += " " + text
    return normalize_text(result)


def fragment_markdown(text: str) -> str:
    match = re.fullmatch(r"<([^>]+)>\s*≡", text)
    if match:
        return f"**Literate fragment: `{match.group(1)}`**"
    return f"**Literate fragment:** {text}"


def page_to_markdown(page: pdfplumber.page.Page, pdf_page: int) -> str:
    lines, printed = extract_lines(page)
    if pdf_page in MISSING_OPENERS:
        first_prose = next((line for line in lines if line.kind == "prose"), None)
        if first_prose:
            first_prose.text = MISSING_OPENERS[pdf_page] + first_prose.text
    anchor = f"<!-- source-page: pdf={pdf_page}"
    if printed:
        anchor += f", book={printed}"
    anchor += " -->"

    output: list[str] = [anchor, ""]
    prose: list[Line] = []
    code: list[Line] = []
    pending_dropcap = ""
    dropcap_bottom = -1.0

    prose_x = min((line.x0 for line in lines if line.kind == "prose"), default=0.0)

    def flush_prose() -> None:
        nonlocal prose
        if prose:
            text = join_prose(prose)
            if text:
                output.extend((text, ""))
        prose = []

    def flush_code() -> None:
        nonlocal code
        if not code:
            return
        base_x = min(line.x0 for line in code)
        output.append("```c")
        previous_bottom: float | None = None
        for line in code:
            if previous_bottom is not None and line.top - previous_bottom > 10:
                output.append("")
            indent = max(0, round((line.x0 - base_x) / 6.7))
            output.append(" " * indent + line.text)
            previous_bottom = line.bottom
        output.extend(("```", ""))
        code = []

    previous_prose: Line | None = None
    for line in lines:
        if line.kind == "dropcap":
            pending_dropcap = line.text
            dropcap_bottom = line.bottom
            continue

        if pending_dropcap and line.kind == "prose":
            separator = ""
            if pending_dropcap == "A" and not re.match(r"(?:n|ll)\s", line.text):
                separator = " "
            elif pending_dropcap == "C" and line.text.startswith("is "):
                separator = " "
            line.text = pending_dropcap + separator + line.text
            pending_dropcap = ""

        if line.kind == "code":
            flush_prose()
            code.append(line)
            previous_prose = None
            continue

        flush_code()

        if line.kind == "heading":
            flush_prose()
            heading = line.text
            if re.match(r"^\d+\.\d+(?:\.\d+)*\s+", heading) or heading in {"Further Reading", "Exercises"}:
                output.extend((f"## {heading}", ""))
            else:
                output.extend((f"### {heading}", ""))
            previous_prose = None
            continue

        if line.kind == "fragment":
            flush_prose()
            output.extend((fragment_markdown(line.text), ""))
            previous_prose = None
            continue

        starts_new_paragraph = bool(
            prose
            and previous_prose
            and line.top > dropcap_bottom
            and line.x0 > prose_x + 8
            and re.search(r"[.!?][\"')\]]?$", previous_prose.text)
        )
        if starts_new_paragraph:
            flush_prose()
        prose.append(line)
        previous_prose = line

    flush_prose()
    flush_code()
    return "\n".join(output).rstrip() + "\n"


def yaml_string(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def write_material(
    material: Material,
    page_range: tuple[int, int],
    pdf: pdfplumber.PDF,
    pdf_path: Path,
    book_dir: Path,
) -> None:
    start, end = page_range
    relative_pdf = Path("../..") / pdf_path.name
    frontmatter = [
        "---",
        f"title: {yaml_string(material.markdown_title)}",
        f"source_pdf: {yaml_string(str(relative_pdf))}",
        f"pdf_pages: {yaml_string(f'{start}-{end}')}",
    ]
    if material.code_paths:
        frontmatter.append("canonical_code:")
        frontmatter.extend(f"  - {yaml_string('../code/' + path)}" for path in material.code_paths)
    frontmatter.extend(("---", "", f"# {material.markdown_title}", ""))

    content = ["\n".join(frontmatter)]
    for page_number in range(start, end + 1):
        content.append(page_to_markdown(pdf.pages[page_number - 1], page_number))
    output = "\n".join(content).rstrip() + "\n"
    (book_dir / material.filename).write_text(output, encoding="utf-8")


def write_manifest(output_dir: Path, ranges: dict[str, tuple[int, int]], pdf_path: Path) -> None:
    lines = [
        "# CII Material Manifest",
        "",
        "The human-written book remains the curriculum anchor. Markdown under `book/` is a private,",
        "deterministic extraction of the local PDF; code under `code/` is the author's canonical source tree.",
        "",
        "| Material | PDF pages | Canonical code |",
        "|---|---:|---|",
    ]
    for material in MATERIALS:
        start, end = ranges[material.outline_title]
        book_link = f"[[book/{material.filename[:-3]}|{material.markdown_title}]]"
        code = ", ".join(f"`code/{path}`" for path in material.code_paths) or "-"
        lines.append(f"| {book_link} | {start}-{end} | {code} |")
    lines.extend(
        (
            "",
            "## Source",
            "",
            f"- Original PDF: `{pdf_path.name}`",
            "- Official source repository: <https://github.com/drh/cii>",
            "- Author's chapter/source map: <https://drh.github.io/cii/toc.html>",
            "",
            "## Scope",
            "",
            "The copyright/series pages, acknowledgments, and index are intentionally omitted from the",
            "learning corpus. The preface, all 20 chapters, interface summary, and bibliography are included.",
        )
    )
    (output_dir / "MANIFEST.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_readme(output_dir: Path, pdf_path: Path) -> None:
    today = dt.date.today().isoformat()
    text = f"""# CII Materials

Generated on {today} from `{pdf_path.name}` for private study.

## Source policy

- `book/` preserves the author's explanations and sequence. Treat it as the canonical curriculum.
- `code/` is copied from <https://github.com/drh/cii>. Treat it as canonical when an extracted code snippet differs.
- The original PDF remains the final reference for typography, page layout, and ambiguous extraction.
- Do not publish the extracted book Markdown or commit it to a public repository.

## Conversion policy

- One Markdown file per chapter or appendix.
- PDF outline entries determine page ranges.
- Embedded font metadata distinguishes headings, prose, and monospaced code.
- Repeated ebook footers and running headers are removed.
- Wrapped lowercase words are dehyphenated.
- Every source page is retained as an HTML comment anchor.

See `MANIFEST.md` for the complete chapter and source-code map.
"""
    (output_dir / "README.md").write_text(text, encoding="utf-8")


def validate(output_dir: Path, ranges: dict[str, tuple[int, int]]) -> None:
    book_dir = output_dir / "book"
    expected = {material.filename for material in MATERIALS}
    actual = {path.name for path in book_dir.glob("*.md")}
    if actual != expected:
        raise ValueError(f"Chapter set mismatch: missing={sorted(expected-actual)}, extra={sorted(actual-expected)}")

    footer_hits: list[str] = []
    for material in MATERIALS:
        path = book_dir / material.filename
        text = path.read_text(encoding="utf-8")
        start, end = ranges[material.outline_title]
        expected_anchors = end - start + 1
        if text.count("<!-- source-page:") != expected_anchors:
            raise ValueError(f"Page anchor mismatch in {path.name}")
        if text.count("```c") != text.count("\n```\n"):
            raise ValueError(f"Unbalanced code fences in {path.name}")
        if len(text) < 500:
            raise ValueError(f"Suspiciously short material: {path.name}")
        if any(marker in text for marker in FOOTER_MARKERS):
            footer_hits.append(path.name)
    if footer_hits:
        raise ValueError(f"Repeated footer survived in: {footer_hits}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    pdf_path = args.pdf.expanduser().resolve()
    output_dir = args.output.expanduser().resolve()
    if not pdf_path.is_file():
        raise FileNotFoundError(pdf_path)

    output_dir.mkdir(parents=True, exist_ok=True)
    book_dir = output_dir / "book"
    book_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(pdf_path)
    ranges = material_ranges(reader)
    with pdfplumber.open(pdf_path) as pdf:
        for index, material in enumerate(MATERIALS, start=1):
            print(f"[{index:02d}/{len(MATERIALS)}] {material.markdown_title}", file=sys.stderr)
            write_material(material, ranges[material.outline_title], pdf, pdf_path, book_dir)

    write_manifest(output_dir, ranges, pdf_path)
    write_readme(output_dir, pdf_path)
    validate(output_dir, ranges)
    print(f"Created {len(MATERIALS)} materials in {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

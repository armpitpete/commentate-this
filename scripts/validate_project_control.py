#!/usr/bin/env python3
"""Validate Commentate This repository-level project control."""

from __future__ import annotations

import argparse
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_REPOSITORY = "armpitpete/commentate-this"
VALID_STATUSES = {
    "UNASSESSED",
    "DIAGNOSTIC",
    "DESIGN",
    "AUTHORISED",
    "IMPLEMENTING",
    "VALIDATING",
    "REVIEW",
    "READY",
    "AUTHORITATIVE",
    "BLOCKED",
    "SUPERSEDED",
    "CLOSED",
}
REQUIRED_FILES = (
    "AGENTS.md",
    "STATUS.md",
    "docs/authority/AUTHORITY.md",
    "scripts/validate_project_control.py",
    ".github/workflows/project-control.yml",
)
REQUIRED_STATUS_HEADINGS = (
    "Current authority",
    "Current lane",
    "Allowed scope",
    "Forbidden changes",
    "Validation",
    "Done",
    "To do",
    "Next bounded gate",
    "Stop point",
)
REQUIRED_AUTHORITY_HEADINGS = (
    "Source authority",
    "Active authority",
    "Decision authority",
    "Completion authority",
    "Governing constraints",
)
IGNORED_DIRECTORIES = {
    ".git",
    ".venv",
    "node_modules",
    "vendor",
    "dist",
    "build",
    "archive",
    "archives",
}


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--repository",
        default=os.environ.get("GITHUB_REPOSITORY", ""),
        help="Expected OWNER/REPOSITORY identity.",
    )
    return parser.parse_args()


def front_matter(text: str) -> dict[str, str]:
    if not text.startswith("---\n"):
        raise ValueError("missing YAML front matter")
    end = text.find("\n---\n", 4)
    if end == -1:
        raise ValueError("unterminated YAML front matter")

    result: dict[str, str] = {}
    for line in text[4:end].splitlines():
        if not line or line.startswith(" ") or line.lstrip().startswith("-"):
            continue
        if ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip()
    return result


def markdown_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.md")
        if not any(part in IGNORED_DIRECTORIES for part in path.parts)
    )


def heading_count(text: str, heading: str) -> int:
    return len(re.findall(rf"(?m)^## {re.escape(heading)}\s*$", text))


def main() -> int:
    args = arguments()
    failures: list[str] = []

    if args.repository != EXPECTED_REPOSITORY:
        failures.append(
            f"repository identity must be {EXPECTED_REPOSITORY}; "
            f"found {args.repository!r}"
        )

    for relative in REQUIRED_FILES:
        if not (ROOT / relative).is_file():
            failures.append(f"missing required file: {relative}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    agents_text = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    status_text = (ROOT / "STATUS.md").read_text(encoding="utf-8")
    authority_text = (ROOT / "docs/authority/AUTHORITY.md").read_text(
        encoding="utf-8"
    )
    workflow_text = (ROOT / ".github/workflows/project-control.yml").read_text(
        encoding="utf-8"
    )

    try:
        agents_meta = front_matter(agents_text)
    except ValueError as exc:
        failures.append(f"AGENTS.md {exc}")
        agents_meta = {}

    try:
        status_meta = front_matter(status_text)
    except ValueError as exc:
        failures.append(f"STATUS.md {exc}")
        status_meta = {}

    try:
        authority_meta = front_matter(authority_text)
    except ValueError as exc:
        failures.append(f"docs/authority/AUTHORITY.md {exc}")
        authority_meta = {}

    if agents_meta.get("entry_authority") != "true":
        failures.append("AGENTS.md must declare entry_authority: true")
    if agents_meta.get("standard") != "Recursive Project Improvement Standard v1.0":
        failures.append("AGENTS.md must name Recursive Project Improvement Standard v1.0")
    if "## Fixed new-chat bootstrap" not in agents_text:
        failures.append("AGENTS.md must contain the exact fixed-bootstrap heading")
    if "Continue work on `armpitpete/commentate-this`." not in agents_text:
        failures.append("AGENTS.md fixed bootstrap has the wrong repository identity")

    if status_meta.get("completion_authority") != "true":
        failures.append("STATUS.md must declare completion_authority: true")
    if status_meta.get("standard") != "Recursive Project Improvement Standard v1.0":
        failures.append("STATUS.md must name Recursive Project Improvement Standard v1.0")
    if status_meta.get("project_slug") != "commentate-this":
        failures.append("STATUS.md project_slug must be commentate-this")
    if status_meta.get("project_name") != "Commentate This":
        failures.append("STATUS.md project_name must be Commentate This")
    if status_meta.get("project_type") != "application":
        failures.append("STATUS.md project_type must be application")
    if status_meta.get("template_mode") != "false":
        failures.append("STATUS.md template_mode must be false")
    if status_meta.get("status") not in VALID_STATUSES:
        failures.append(f"invalid STATUS.md status: {status_meta.get('status')!r}")
    if "  - docs/authority/AUTHORITY.md" not in status_text:
        failures.append("STATUS.md must name docs/authority/AUTHORITY.md")

    if authority_meta.get("authority_record") != "true":
        failures.append(
            "docs/authority/AUTHORITY.md must declare authority_record: true"
        )
    if authority_meta.get("standard") != "Recursive Project Improvement Standard v1.0":
        failures.append(
            "docs/authority/AUTHORITY.md must name the parent standard"
        )

    for heading in REQUIRED_STATUS_HEADINGS:
        count = heading_count(status_text, heading)
        if count != 1:
            failures.append(
                f"STATUS.md must contain exactly one '## {heading}'; found {count}"
            )

    for heading in REQUIRED_AUTHORITY_HEADINGS:
        count = heading_count(authority_text, heading)
        if count != 1:
            failures.append(
                "docs/authority/AUTHORITY.md must contain exactly one "
                f"'## {heading}'; found {count}"
            )

    claims: list[str] = []
    for path in markdown_files():
        text = path.read_text(encoding="utf-8")
        try:
            metadata = front_matter(text)
        except ValueError:
            metadata = {}
        if metadata.get("completion_authority") == "true":
            claims.append(path.relative_to(ROOT).as_posix())

    if claims != ["STATUS.md"]:
        failures.append(
            "exactly root STATUS.md must claim completion authority; found "
            + ", ".join(claims)
        )

    expected_command = (
        "python scripts/validate_project_control.py "
        "--repository armpitpete/commentate-this"
    )
    if workflow_text.count(expected_command) != 1:
        failures.append(
            "project-control workflow must invoke the repository validator exactly once"
        )
    if "python - <<'PY'" in workflow_text or 'python - <<"PY"' in workflow_text:
        failures.append("project-control workflow must not embed an inline validator")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        print(f"Project control failed with {len(failures)} error(s).")
        return 1

    print("PASS: Commentate This project control is valid")
    print(f"repository={args.repository}")
    print(f"status={status_meta.get('status')}")
    print("template_mode=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env bash

set -euo pipefail

COURSE_DIR="${1:-.}"
COURSE_TITLE="${2:-$(basename "$COURSE_DIR")}"

mkdir -p "$COURSE_DIR/material" "$COURSE_DIR/concepts" "$COURSE_DIR/sessions"

create_file() {
  local path="$1"
  local content="$2"

  if [[ -e "$path" ]]; then
    printf 'kept %s\n' "$path"
    return
  fi

  printf '%s\n' "$content" >"$path"
  printf 'created %s\n' "$path"
}

create_file "$COURSE_DIR/COURSE.md" "# $COURSE_TITLE

## Primary material

- Put human-written sources under \`material/\`.

## Goal

- Describe what you want to understand or be able to do.

## Current position

- Not started.

## Next

- Add the primary material, then run \`/learn\`."

create_file "$COURSE_DIR/PROGRESS.md" "# $COURSE_TITLE Progress

| Concept | Status | Evidence | Source | Last checked |
|---|---|---|---|---|"

create_file "$COURSE_DIR/CONCEPTS.md" "# $COURSE_TITLE Concept Map

Keep this map sparse. Create prose notes under \`concepts/\` only when you choose to."

create_file "$COURSE_DIR/QUESTIONS.md" "# $COURSE_TITLE Questions

## Active

## Parked"

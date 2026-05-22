#!/bin/bash
#
# Generate social preview images (1200x630) for every post on the site.
#
# Each post gets a `social.png` co-located with its index/markdown file. The
# image mirrors the look of the website's post header: penguin logo + the
# "Matthias Endler" wordmark on top, the post title in big pink Happy-Headline
# type below, and the publish date at the bottom.
#
# Usage:
#   scripts/social.sh           # Generate any missing social images
#   scripts/social.sh --force   # Regenerate all social images (overwrites)
#
# Requirements:
#   - ImageMagick 7 (`magick`)
#   - librsvg (so magick can rasterise SVGs at high quality)
#
set -euo pipefail

FORCE=0
for arg in "$@"; do
    case "$arg" in
        -f|--force) FORCE=1 ;;
        -h|--help)
            sed -n '2,14p' "$0"
            exit 0
            ;;
        *)
            echo "Unknown argument: $arg" >&2
            echo "Run '$0 --help' for usage." >&2
            exit 1
            ;;
    esac
done

# ---------------------------------------------------------------------------
# Resolve repo root so the script works no matter where it's invoked from.
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ---------------------------------------------------------------------------
# Palette — kept in sync with static/css/main.css so the generated images
# match the live site (light theme).
# ---------------------------------------------------------------------------
BG_COLOR='#ffffff'         # --background
TEXT_COLOR='#242424'       # --heading-color
ACCENT_COLOR='#fc218a'     # --accent-color
META_COLOR='#7a7a7a'       # --meta-color (approx, opaque over white)

# ---------------------------------------------------------------------------
# Assets & fonts. The TTF originals ship in the repo so the result is
# reproducible across machines without relying on system font installs.
# ---------------------------------------------------------------------------
PENGUIN_SVG="$ROOT_DIR/static/logo.svg"
FONT_HEADLINE="$ROOT_DIR/static/fonts/orig/Happy-Headline.ttf"
FONT_HAPPY="$ROOT_DIR/static/fonts/orig/Happy.ttf"
FONT_BODY="$ROOT_DIR/static/fonts/orig/Merriweather_24pt-Regular.ttf"

for f in "$PENGUIN_SVG" "$FONT_HEADLINE" "$FONT_HAPPY" "$FONT_BODY"; do
    if [[ ! -f "$f" ]]; then
        echo "Missing required asset: $f" >&2
        exit 1
    fi
done

# ---------------------------------------------------------------------------
# Pretty-print an ISO date (YYYY-MM-DD) as e.g. "5th of March 2026".
# Falls back to the original string if parsing fails.
# ---------------------------------------------------------------------------
format_date() {
    local iso=$1
    [[ -z "$iso" ]] && return 0

    local year month day
    IFS='-' read -r year month day <<<"$iso"
    if [[ -z "$year" || -z "$month" || -z "$day" ]]; then
        printf '%s' "$iso"
        return
    fi

    # Strip leading zero so the day reads naturally ("5th" not "05th").
    local day_n=$((10#$day))

    local suffix="th"
    if (( day_n % 100 < 11 || day_n % 100 > 13 )); then
        case $((day_n % 10)) in
            1) suffix="st" ;;
            2) suffix="nd" ;;
            3) suffix="rd" ;;
        esac
    fi

    local months=("" January February March April May June \
                  July August September October November December)
    local month_n=$((10#$month))
    local month_name=${months[$month_n]:-$month}

    printf '%d%s of %s %s' "$day_n" "$suffix" "$month_name" "$year"
}

# ---------------------------------------------------------------------------
# Generate a 1200x630 social image for a single post.
#
#   $1: output path
#   $2: post title
#   $3: optional ISO date string (YYYY-MM-DD) for the footer
# ---------------------------------------------------------------------------
generate_social_image() {
    local output_file=$1
    local title=$2
    local date=${3:-}

    local tmp_dir
    tmp_dir=$(mktemp -d)

    # Intermediate layers carry transparency. We force PNG32 (TrueColorAlpha)
    # on every write because `caption:` with `-background none` otherwise
    # produces a PaletteAlpha PNG, which loses its fill color when later
    # composited onto a TrueColor canvas — text comes out as a faded gray
    # ghost. PNG32 keeps the RGBA channels intact across the pipeline.
    local penguin="$tmp_dir/penguin.png"
    local wordmark="$tmp_dir/wordmark.png"
    local header="$tmp_dir/header.png"
    local title_img="$tmp_dir/title.png"
    local meta_img="$tmp_dir/meta.png"
    local spacer="$tmp_dir/spacer.png"

    # ---- Penguin (top-left of the header row) ---------------------------
    local penguin_size=110
    magick -background none -density 400 "$PENGUIN_SVG" \
        -resize "${penguin_size}x${penguin_size}" "PNG32:$penguin"

    # ---- "Matthias Endler" wordmark -------------------------------------
    magick -background none -fill "$TEXT_COLOR" \
        -font "$FONT_HEADLINE" -pointsize 68 \
        label:"Matthias Endler" "PNG32:$wordmark"

    # Penguin and wordmark sit side-by-side, vertically centered. Use a
    # transparent spacer between them so the wordmark doesn't kiss the logo.
    magick -size 24x10 xc:none "PNG32:$spacer"

    magick "$penguin" "$spacer" "$wordmark" \
        -background none -gravity Center +append \
        "PNG32:$header"

    # ---- Title (big pink Happy-Headline, auto-wrapped & auto-sized) ----
    # We give caption: both a width AND a height for the safe area between
    # the header and the footer. ImageMagick then auto-shrinks the
    # pointsize so the wrapped text fits, which means long multi-line
    # titles no longer collide with the wordmark or date.
    #
    # Safe area: 80px gutter L/R, header ends ~200px from top, footer
    # starts ~100px from bottom → 1040 x 330 box centered on the canvas.
    local title_box_w=1040
    local title_box_h=330

    magick \
        -background none \
        -fill "$ACCENT_COLOR" \
        -font "$FONT_HEADLINE" \
        -size "${title_box_w}x${title_box_h}" \
        -gravity Center \
        caption:"$title" \
        "PNG32:$title_img"

    # ---- Footer meta line (date) ----------------------------------------
    local meta_text=""
    if [[ -n "$date" ]]; then
        meta_text="Published on $(format_date "$date")"
    fi

    if [[ -n "$meta_text" ]]; then
        magick -background none -fill "$META_COLOR" \
            -font "$FONT_BODY" -pointsize 26 \
            label:"$meta_text" "PNG32:$meta_img"
    fi

    # ---- Compose everything onto the 1200x630 canvas --------------------
    # Layout:
    #   header (penguin + wordmark)   — top, centered horizontally
    #   title                         — centered both axes (slight bias up)
    #   meta                          — bottom, centered horizontally
    local canvas="$tmp_dir/canvas.png"
    magick -size 1200x630 "xc:${BG_COLOR}" "PNG24:$canvas"

    local compose_args=(
        "$canvas"
        "$header"    -gravity North  -geometry +0+70  -composite
        "$title_img" -gravity Center -geometry +0+20  -composite
    )
    if [[ -n "$meta_text" ]]; then
        compose_args+=( "$meta_img" -gravity South -geometry +0+60 -composite )
    fi
    compose_args+=( "$output_file" )

    magick "${compose_args[@]}"

    rm -rf "$tmp_dir"
}

# ---------------------------------------------------------------------------
# Process a single markdown post.
# ---------------------------------------------------------------------------
process_post() {
    local post="$1"
    local parent_dir="$2"

    local title date output_path

    # Extract title from TOML frontmatter (`title = "..."`).
    title=$(awk -F'"' '/^title[[:space:]]*=/ {print $2; exit}' "$post")
    # Strip inline markdown so things like `code spans`, *emphasis* and
    # _underscores_ don't render as literal punctuation in the image.
    title=$(printf '%s' "$title" | sed -E 's/[`*_]+//g')
    # Date is unquoted in Zola's TOML frontmatter (e.g. `date = 2026-05-22`).
    date=$(awk -F'=' '/^date[[:space:]]*=/ {gsub(/[[:space:]]/, "", $2); print $2; exit}' "$post")

    if [[ -z "$title" ]]; then
        echo "No title in $post — skipping."
        return
    fi

    output_path="${parent_dir}/social.png"

    if [[ -f "$output_path" && $FORCE -eq 0 ]]; then
        echo "✓ exists  $output_path"
        return
    fi

    echo "→ render  $output_path  ($title)"
    generate_social_image "$output_path" "$title" "$date"
}

# ---------------------------------------------------------------------------
# Walk a content directory recursively.
# ---------------------------------------------------------------------------
process_directory() {
    local dir="$1"

    # Section indexes (_index.md) don't get a custom social image — they
    # already fall back to the default penguin. Skip them.

    # Co-located page: index.md inside a folder (with assets).
    if [[ -f "$dir/index.md" ]]; then
        process_post "$dir/index.md" "$dir"
    fi

    # Standalone markdown files (e.g. `content/2023/foo.md`).
    for file in "$dir"/*.md; do
        [[ -f "$file" ]] || continue
        local base
        base=$(basename "$file")
        [[ "$base" == _* ]] && continue
        [[ "$base" == "index.md" ]] && continue
        process_post "$file" "$dir"
    done

    # Recurse into subdirectories.
    for subdir in "$dir"/*; do
        [[ -d "$subdir" ]] || continue
        [[ $(basename "$subdir") == _* ]] && continue
        process_directory "$subdir"
    done
}

# ---------------------------------------------------------------------------
# Entry point: walk every year under content/.
# ---------------------------------------------------------------------------
for content_dir in content/*; do
    [[ -d "$content_dir" ]] || continue
    [[ $(basename "$content_dir") == _* ]] && continue
    [[ $(basename "$content_dir") == "static" ]] && continue
    process_directory "$content_dir"
done

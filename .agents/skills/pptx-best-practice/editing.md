# Editing Existing PPTX Files

Use this workflow when a template or existing deck is provided and you need to update content safely.

## 1) Inspect Before Editing

```bash
python -m markitdown input.pptx
```

Quickly inspect slide text and ordering before changing anything.

## 2) Prepare a Working Copy

Always keep the original file untouched:

```bash
cp input.pptx working.pptx
```

## 3) Unpack (Optional but Recommended for Deep Edits)

If helper scripts are available:

```bash
python scripts/office/unpack.py working.pptx unpacked/
```

Fallback without scripts:

```bash
mkdir -p unpacked
unzip -q working.pptx -d unpacked
```

## 4) Apply Content Updates

- Replace slide text, speaker notes, and comments as requested.
- Keep layout geometry and style tokens (font size, colors, spacing) consistent.
- Remove or replace placeholder text such as `xxxx`, `lorem ipsum`, and template hints.

## 5) Repack (If You Unpacked)

```bash
cd unpacked
zip -qr ../output.pptx .
cd -
```

## 6) Required QA

```bash
python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum|this.*(page|slide).*layout"
```

If any line is returned, fix and re-check.

Visual QA:

```bash
soffice --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

Review generated images for overflow, overlap, misalignment, and low contrast.

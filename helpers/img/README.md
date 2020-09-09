# Process images

- creates webp and avif images from PNG/JPG
- puts all images into a folder in `static` to help with caching the path
  (e.g. `*/static/img/*` as a Cloudflare rule).

## Requirements

- [cavif](https://github.com/kornelski/cavif) 0.4.0 or higher
- [cwebp](https://developers.google.com/speed/webp/docs/cwebp) 1.1.0 or higher
- [Image Magick](https://imagemagick.org)

## Pseudocode

```python
for dir in content/**
    in_dir = basename(dir)
    out_dir = static/in_dir
    for image in dir/raw
        if svg:
            cp image to out_dir
            continue
        adjust width
        create webp
        create avif
        cp image to out_dir
        cp image.webp to out_dir
        cp image.avif to out_dir
```

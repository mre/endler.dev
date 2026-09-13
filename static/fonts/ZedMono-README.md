# Zed Mono

Extended width, regular weight from [Zed Fonts 1.2.0](https://github.com/zed-industries/zed-fonts/releases/tag/1.2.0), licensed under the SIL Open Font License 1.1 (see `ZedMono-LICENSE.md`).

Source archive: https://github.com/zed-industries/zed-fonts/releases/download/1.2.0/zed-mono-1.2.0.zip

`ZedMono-Extended.woff2` is a web subset of `zed-mono-extended.ttf`, retaining Latin, Greek, Cyrillic, punctuation, arrows, mathematical symbols, and box-drawing characters. Characters not present fall back to the site's system monospace stack.

Generated with FontTools 4.65.0 and Brotli 1.2.0:

```sh
pyftsubset zed-mono-extended.ttf \
  --output-file=ZedMono-Extended.woff2 \
  --flavor=woff2 \
  --unicodes=U+0000-024F,U+0370-052F,U+1E00-1EFF,U+2000-2BFF,U+FFFD \
  --layout-features='*' \
  --name-IDs='*' --name-legacy --name-languages='*'
```

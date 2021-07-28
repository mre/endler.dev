SHELL := /bin/bash

.PHONY: help
help: ## This help message
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: clean
clean: ## Remove build files
	rm -rf public/
	rm -f static/**/*.avif
	rm -f static/**/*.webp

.PHONY: versions
versions: ## Show versions of tools
	zola --version
	gh-stats --version
	tinysearch --version

.PHONY: content
content: ## Build the content of the static site with zola
	zola build

.PHONY: images
images: ## Create webp and avif images 
	cargo run --manifest-path ./helpers/img/Cargo.toml

.PHONY: index
index: content ## Build the search index with tinysearch
	tinysearch --optimize --path static public/json/index.html

.PHONY: minify
minify: ## Compress JavaScript assets
	terser --compress --mangle --output static/search_min.js -- static/search.mjs static/tinysearch_engine.js

.PHONY: build 
build: stars content #index minify ## Build static site and search index, minify JS
	@rm -r public/json

.PHONY: build-quick
build-quick: content ## Build static site

.PHONY: dev run serve
dev run serve: ## Serve website locally
	zola serve

.PHONY: stars
stars: ## Update Github stars statistics for my projects
	gh-stats --filter gitpod --stars 50 --template .star-counter-template.md --output content/static/about/stars.md

.PHONY: deploy publish
deploy publish: clean build ## Deploy site on Cloudflare's Workers Sites using wrangler
	wrangler publish

.PHONY: content
content:
	zola build

.PHONY: index
index: content
	tinysearch --optimize --path static public/json/index.html

.PHONY: minify
minify:
	terser --compress --mangle --output static/search_min.js -- static/search.mjs static/tinysearch_engine.js

.PHONY: build 
build: content index minify

.PHONY: run
run:
	zola serve
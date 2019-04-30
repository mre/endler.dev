.PHONY: content
content:
	zola build

.PHONY: build index 
build index: content
	tinysearch --optimize --path static public/json/index.html

.PHONY: run
run:
	zola serve
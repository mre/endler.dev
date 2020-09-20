| Repository | Stars |
| :--------- | ----: |
{% for repo in repos -%}
| [{{ repo.full_name | safe }}]({{ repo.html_url | safe }}) | {{ repo.stargazers_count }} ★ |
{% endfor -%}

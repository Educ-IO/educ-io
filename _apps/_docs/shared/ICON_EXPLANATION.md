<div class="d-flex align-items-center mb-2{% if include.border %} border p-1 mb-3{% endif %}">
  <i class="material-icons md-24 ml-2 mr-3 text-light bg-dark p-1 my-1">{{ include.icon }}</i>
  <p class="m-0">{{ include.explanation | markdownify | remove: '<p>' | remove: '</p>' }}{% if include.also %} <strong>Also</strong>:{% assign icons = include.also | split: ' ' %}{% for icon in icons %}<i class="material-icons md-18 ml-1 text-black">{{ icon }}</i>{% endfor %}{% endif %}</p>
</div>
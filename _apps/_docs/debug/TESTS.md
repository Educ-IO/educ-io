{% for item in site.tests %}
{% assign title = item.title | downcase | replace: " ", "_" %}
<div class="row highlight_all highlight_{{ title }} pb-3 pb-xl-4 m-1 m-xl-2" markdown="1"><div class="col" markdown="1">
    
#### {% if item.display %}{{ item.display }}{% else %}{{ item.title }}{% endif %}
    
{% if item.content %}{{ item.content }}{% endif %}
    
{% if item.tests %}<div markdown="0">{% assign id = title | append: '__all' %}{% assign hash = 'run.' | append: item.title | append: '.__all' | append: '.' | append: id %}
<div class="btn-group mr-1 mr-md-2 mr-lg-3 mt-2">
  {% include plumbing/command.html quiet=true class="btn btn-lg btn-dark test-all waves-effect" name='All' command='' id=id spinner=true hash=hash placement="bottom" %}
  <button type="button" class="btn btn-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    <span class="sr-only">Toggle Dropdown</span>
  </button>
  <div class="dropdown-menu">
    <a class="dropdown-item" href="#{{hash}}">Once</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" href="#{{hash}}.2">Twice</a>
    <a class="dropdown-item" href="#{{hash}}.5">5 times</a>
    <a class="dropdown-item" href="#{{hash}}.10">10 times</a>
    <a class="dropdown-item" href="#{{hash}}.100">100 times</a>
  </div>
</div>
{% for test in item.tests %}{% assign id = title | append: '__' | append: forloop.index %}{% assign hash = 'run.' | append: item.title | append: '.' | append: test.function | append: '.' | append: id %}{% if test.expected == true or test.expected == false or test.expected.size > 0 %}{% assign hash = hash | append: '.' | append: test.expected %}{% endif %}{% include plumbing/command.html class="btn btn-lg btn-action mr-1 mr-md-2 mr-lg-3 mt-2 waves-effect" command=test spinner=true id=id hash=hash placement="bottom" %}{% endfor %}</div>{% endif %}
</div></div>
{% endfor %}
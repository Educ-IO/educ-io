{% for item in site.tests %}
{% unless forloop.first %}
* * *
{% endunless %}
<div class="row" markdown="1"><div class="col" markdown="1">
    
#### {{ item.title }}
    
{% if item.content %}{{ item.content }}{% endif %}
    
{% if item.tests %}<div markdown="0">{% assign id = item.title | downcase | replace ' ', '_' | append: '__all' %}{% assign hash = 'run.' | append: item.title | append: '.__all' | append: '.' | append: id %}
{% include command.html quiet="true" class="btn btn-lg btn-dark mr-sm-1 mr-md-2 mr-lg-3 mt-2 waves-effect" name='All' command='' spinner=true id=id hash=hash placement="bottom" %}
{% for test in item.tests %}{% assign id = item.title | downcase | replace ' ','_' | append: '__' | append: forloop.index %}{% assign hash = 'run.' | append: item.title | append: '.' | append: test.function | append: '.' | append: id %}{% include command.html class="btn btn-lg btn-action mr-sm-1 mr-md-2 mr-lg-3 mt-2 waves-effect" command=test spinner=true id=id hash=hash placement="bottom" %}{% endfor %}</div>{% endif %}

</div></div>
{% endfor %}
Filter with simple search text, or start with an operator, such as:
+ **=** exactly _equals_
+ **>** _greater_ than
+ **<** _less_ than
+ **>=** _greater_ than or _equals_
+ **<=** - _less_ than or _equals_
+ **<>** exactly _not equals_
+ **x -> y** _range_ between x and y
+ **@@** blank

All text is case _insensitive_, unless prefixed with __$__ to _include_ or __!$__ to _exclude_. Starting with __!!__ will invert the filter, showing only those results that _don't_ match. There are also _magical_ keywords, such **past**, **future** and **today** which work with columns containing dates (they are all relative to the _current date_).

Press *esc*{:.kb-shortcut} to clear then close the filter, or *enter*{:.kb-shortcut} to apply then close. To just close, click the column title again, or the &times; after the filter.
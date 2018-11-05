Forms = function() {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Forms)) return new this.Forms().initialise(this);

  /* <!-- Internal Constants --> */
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _showdown, _cache;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _create = (id, template) => {

    if (id && template) {

      var groups = [],
        _order = 0;

      for (var group_Id in template.groups) {
        var group = _.clone(template.groups[group_Id]);
        group.id = group_Id;
        var fields = [];
        for (var field_Id in group.fields) {
          var field = _.clone(group.fields[field_Id]);
          field.id = field_Id;
          if (field.order === undefined) field.order = ++_order;
          if (field.scale) field.markers = _cache.scales[field.scale].scale;
          fields.push(ಠ_ಠ.Display.template.get(field));
        }
        group.fields = fields.join("").trim();
        groups.push(ಠ_ಠ.Display.template.get(group));
      }

      return {
        template: "form",
        id: id,
        name: template.name,
        title: template.title,
        fields: groups.join("\n").trim()
      };

    }

  };
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Initialise Default Scales and Forms --> */
      _showdown = new showdown.Converter({
        tables: true
      });

      /* <!-- Initialise Default Scales and Forms --> */
      _cache = _.reduce([{
          name: "scales",
          prefix: "Ω"
        },
        {
          name: "forms",
          prefix: "Σ"
        },
      ], (cache, type) => {
        var _prefix = `__${type.prefix}__`;
        cache[type.name] = _.reduce(
          _.filter(_.keys(ಠ_ಠ), key => key.indexOf(_prefix) === 0), (value, key) => {
            value[key.substring(_prefix.length).toLowerCase()] = ಠ_ಠ[key](markdown => _showdown.makeHtml(markdown));
            return value;
          }, {});
        return cache;
      }, {});

      /* <!-- Log Cached Values --> */
      ಠ_ಠ.Flags.log("Cache:", _cache);

      /* <!-- Return for Chaining --> */
      return this;

    },

    all: type => _.reduce(_cache[type ? type : "forms"], (list, value, key) => {
      list.push({
        key: key,
        name: value.name,
        title: value.title,
        type: value.type,
      });
      return list;
    }, []),

    has: name => !!(_cache.forms[name]),

    get: name => ({
      template: _cache.forms[name],
      form: _create(name, _cache.forms[name])
    }),

    create: (id, template) => ({
      template: template,
      form: _create(id, template)
    }),

  };
  /* <!-- External Visibility --> */

};
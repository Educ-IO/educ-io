Forms = function() {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Forms)) return new this.Forms().initialise(this);

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _showdown, _cache;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Constants --> */
  const TYPES = [{
        name: "scales",
        prefix: "Ω",
        mime: "application/x.educ-io.reflect-scale",
      },
      {
        name: "forms",
        prefix: "Σ",
        mime: "application/x.educ-io.reflect-form",
      },
    ],
    MARKDOWN = value => _.reduce(value, (memo, value, key) => {
      var _match;
      (_.isString(value) && _.isString(key) && (_match = key.match(/__(\S+)__/))) ?
      memo[_match[1]] = _showdown.makeHtml(value):
        memo[key] = _.isObject(value) || _.isArray(value) ? MARKDOWN(value) : value;
      return memo;
    }, {});
  /* <!-- Internal Constants --> */

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

  var _all = type => _.reduce(_cache[type ? type : "forms"], (list, value, key) => {
    list.push({
      key: key,
      name: value.name,
      title: value.title,
      type: value.type,
    });
    return list;
  }, []);
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
      _cache = _.reduce(TYPES, (cache, type) => {
        var _prefix = `__${type.prefix}__`;
        cache[type.name] = _.reduce(
          _.filter(_.keys(ಠ_ಠ), key => key.indexOf(_prefix) === 0),
          (value, key) => {
            value[key.substring(_prefix.length).toLowerCase()] = MARKDOWN(ಠ_ಠ[key]);
            return value;
          }, {});
        return cache;
      }, {});

      /* <!-- Get Scales & Forms from Google Drive --> */
      _.each(TYPES, type => ಠ_ಠ.Google.files.type(type.mime)
          .then(files => _.each(files, file => {
            ಠ_ಠ.Google.files.download(file.id)
              .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
              .then(content => JSON.parse(content))
              .then(content => _cache[type.name][file.id.toLowerCase()] = MARKDOWN(content));
          }))
          .catch(e => ಠ_ಠ.Flags.error(`Error Searching Google Drive for File Type: ${type.mime}`, e)));

      /* <!-- Log Cached Values --> */
      ಠ_ಠ.Flags.log("Cache:", _cache);

      /* <!-- Return for Chaining --> */
      return this;

    },

    all: _all,

    selection: type => _.map(_.filter(_all(), {
      type: type ? type : "Report"
    }), item => ({
      value: item.key,
      name: item.title,
    })),

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
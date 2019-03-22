Forms = function() {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Forms)) return new this.Forms().initialise(this);

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {}; /* <!-- State --> */
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
      memo[_match[1]] = ರ‿ರ.showdown.makeHtml(value):
        memo[key] = !_.isRegExp(value) && (_.isObject(value) || _.isArray(value)) ?
        MARKDOWN(value) : value;
      return memo;
    }, {}),
    DEEPCLONE = object => {
      var clone = _.clone(object);
      _.each(clone, (value, key) => !_.isRegExp(value) && _.isObject(value) ?
        clone[key] = DEEPCLONE(value) : value);
      return clone;
    },
    PROCESS = _.compose(MARKDOWN, DEEPCLONE);
  /* <!-- Internal Constants --> */

  /* <!-- Internal Functions --> */
  var _get = (name, value) => _.find(value,
    (value, key) => key.localeCompare(name, undefined, {
      sensitivity: "accent"
    }) === 0);

  var _owner = file => file.owners ?
    `${file.owners[0].displayName}${file.owners[0].emailAddress ? 
              ` (${file.owners[0].emailAddress})` : ""}` : "";

  var _process = (value, type, id) => {
    var _extend = (parent, object) => _.deepExtend(DEEPCLONE(parent), object),
      _action = () => {
        var _return = _extend(ರ‿ರ.cache[type.name][value.__extends], value);
        delete _return.__extends;
        return _return;
      };
    return value && value.__extends ?
      ರ‿ರ.cache[type.name][value.__extends] ?
      _action() :
      ಠ_ಠ.Flags.log(`No ${type.name} named ${value.__extends}${id ? ` for ${id} to extend` : ""}`).reflect(value) :
      value;
  };

  var _create = (id, template, editable, signable, preview) => {

    if (id && template) {

      if (template.__extends) template = _process(template, TYPES[1]);

      var groups = [],
        _headers = [],
        _order = 0,
        _file = ರ‿ರ.files[id];

      for (var group_Id in template.groups) {

        var group = PROCESS(template.groups[group_Id]);
        group.id = group_Id;
        _headers.push(group.id);
        var fields = [];
        for (var field_Id in group.fields) {
          var field = _.clone(group.fields[field_Id]);
          field.id = field_Id;
          if (editable === false) field.readonly = true;
          if (field.order === undefined) field.order = ++_order;
          if (field.scale) {
            var _scale = _get(field.scale, ರ‿ರ.cache.scales);
            field.markers = PROCESS(_scale.scale);
          }
          try {
            fields.push(ಠ_ಠ.Display.template.get(field));
          } catch (e) {
            ಠ_ಠ.Flags.error(`Error rendering template for field: ${field.id} | ${field.template}`, e);
          }
        }
        group.fields = fields.join("").trim();
        try {
          groups.push(ಠ_ಠ.Display.template.get(group));
        } catch (e) {
          ಠ_ಠ.Flags.error(`Error rendering template for group: ${group.id} | ${group.template}`, e);
        }

      }

      return {
        template: "form",
        id: id,
        name: template.name,
        title: template.title,
        headers: _headers,
        footers: []
          .concat(editable || signable ? ["_Actions_"] : [])
          .concat(preview ? [] : ["_Signatures_"]),
        fields: groups.join("\n").trim(),
        owner: _file ? _owner(_file) : "",
        editable: editable,
        signable: signable,
        preview: preview,
      };

    }

  };

  var _all = type => _.reduce(ರ‿ರ.cache[type ? type : "forms"], (list, value, key) => {
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
      ರ‿ರ.showdown = new showdown.Converter({
        tables: true
      });

      /* <!-- Initialise Default Scales and Forms --> */
      ರ‿ರ.files = {};
      ರ‿ರ.cache = _.reduce(TYPES, (cache, type) => {
        var _prefix = `__${type.prefix}__`;
        cache[type.name] = _.chain(_.keys(ಠ_ಠ))
          .filter(key => key.indexOf(_prefix) === 0)
          .reduce((value, key) => {
            value[key.substring(_prefix.length)] = ಠ_ಠ[key];
            return value;
          }, {})
          .value();
        return cache;
      }, {});

      /* <!-- Get Scales & Forms from Google Drive --> */
      _.each(TYPES, type => ಠ_ಠ.Google.files.type(type.mime)
        .then(files => _.each(files, file => {
          ಠ_ಠ.Google.files.download(file.id)
            .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
            .then(content => {
              var _object;
              try {
                _object = JSON.parse(content);
              } catch (e) {
                ಠ_ಠ.Flags.error(`Error Parsing: ${file.id}`, e);
              }
              return _process(_object, type, file.id);
            })
            .then(object => object ? ರ‿ರ.cache[type.name][file.id] = object : object)
            .then(() => file.teamDriveId ? ಠ_ಠ.Google.teamDrives.get(file.teamDriveId)
              .then(drive => {
                file.owners = [{
                  "kind": "drive#teamDrive",
                  "displayName": drive.name
                }];
                return file;
              }) : Promise.resolve(file))
            .then(file => ರ‿ರ.files[file.id] = file);
        }))
        .catch(e => ಠ_ಠ.Flags.error(`Error Searching for File Type: ${type.mime}`, e)));

      /* <!-- Log Cached Values --> */
      ಠ_ಠ.Flags.log("Cache:", ರ‿ರ.cache);

      /* <!-- Return for Chaining --> */
      return this;

    },

    all: _all,

    selection: (type, subtype) => _.chain(_all(type))
      .filter({
        type: subtype ? subtype : "Report"
      })
      .map(item => {
        var _file = ರ‿ರ.files[item.key];
        return {
          value: item.key,
          name: item.title,
          class: _file ? "" : "text-body trusted",
          title: _file ? `Owned by: ${_owner(_file)}` : ""
        };
      })
      .sortBy("name")
      .value(),

    has: name => !!(_get(name, ರ‿ರ.cache.forms)),

    template: name => _get(name, ರ‿ರ.cache.forms),

    get: (name, editable, signable) => {
      var _form = _get(name, ರ‿ರ.cache.forms);
      return _form ? {
        template: _form,
        form: _create(name, _form, editable, signable)
      } : null;
    },

    create: (id, template, editable, signable, preview) => ({
      template: template,
      form: _create(id, template, editable, signable, preview)
    }),

    scale: name => _get(name, ರ‿ರ.cache.scales)

  };
  /* <!-- External Visibility --> */

};
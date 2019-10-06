Forms = function(loaded) {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Forms)) return new this.Forms().initialise(this, loaded);

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {
      loaded: false,
    },
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant --> */
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

  var _create = (id, template, editable, signable, completed, preview) => {

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
          if (editable === false || completed === true) field.readonly = true;
          if (field.order === undefined) field.order = ++_order;
          if (field.scale && _.isString(field.scale)) {
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

      ಠ_ಠ.Flags.log("Generating Form from Template", template);
      
      var _return = {
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
        completed: completed,
        preview: preview,
        actions: MARKDOWN(template.actions || {}),
      };
      
      ಠ_ಠ.Flags.log("Generated Form", _return);
      
      return _return;

    }

  };

  var _all = type => _.reduce(ರ‿ರ.cache[type ? type : "forms"], (list, value, key) => {
    list.push({
      key: key,
      name: value.name,
      title: value.title,
      type: value.type,
      meta: value.__meta
    });
    return list;
  }, []);
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container, loaded) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Initialise Default Scales and Forms --> */
      showdown.setFlavor("github");
      showdown.extension("targetlink", function() {
        return [{
          type: "lang",
          regex: /\[((?:\[[^\]]*]|[^\[\]])*)]\([ \t]*<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\4[ \t]*)?\)\{\:target=(["'])(.*)\6}/g,
          replace: (wholematch, linkText, url, a, b, title, c, target) => {
            var value = value => typeof value != "undefined" && value !== "" && value !== null,
              replace = value => showdown.helper.escapeCharacters(value.replace(/"/g, "&quot;"), "*_", false);

            return `<a href="${url}"${value(title) ? ` title="${replace(title)}"` : ""}${value(target) ? ` target="${target}"` : ""}>${linkText}</a>`;
          }
        }];
      });
      ರ‿ರ.showdown = new showdown.Converter({
        extensions: ["targetlink"],
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
      ಱ.loaded = Promise.all(_.map(TYPES, type => ಠ_ಠ.Google.files.type(type.mime, "domain,user,allTeamDrives")
          .then(files => Promise.all(_.map(files, file => ಠ_ಠ.Google.files.download(file.id)
            .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
            .then(content => {
              var _object;
              try {
                _object = JSON.parse(content);
              } catch (e) {
                ಠ_ಠ.Flags.error(`Error Parsing: ${file.id}`, e);
              }
              _object = _process(_object, type, file.id);
              var _meta = {},
                  _prop = (v, k) => _meta[k.toLowerCase()] = v && _.isString(v) ?
                    v.toLowerCase() == "true" ? true : v.toLowerCase() == "false" ? false : v : v;
              if (file.appProperties) _.each(file.appProperties, _prop);
              if (file.properties) _.each(file.properties, _prop);
              if (!_.isEmpty(_meta)) _object.__meta = _meta;
              return _object;
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
            .then(file => ರ‿ರ.files[file.id] = file))))
          .catch(e => ಠ_ಠ.Flags.error(`Error Searching for File Type: ${type.mime}`, e))))
        .then(() => {
          ರ‿ರ.loaded = true;
          if (loaded && _.isFunction(loaded)) loaded();
          return this;
        });

      /* <!-- Log Cached Values --> */
      ಠ_ಠ.Flags.log("Cache:", ರ‿ರ.cache);

      /* <!-- Return for Chaining --> */
      return this;

    },

    loaded: () => ರ‿ರ.loaded,

    all: _all,

    selection: (type, subtype) => _.chain(_all(type))
      .filter({
        type: subtype ? subtype : "Report"
      })
      .reject(item => item.meta && item.meta.hidden)
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

    create: (id, template, editable, signable, completed, preview) => ({
      template: template,
      form: _create(id, template, editable, signable, completed, preview)
    }),

    scale: name => _get(name, ರ‿ರ.cache.scales),
    
    persistent: () => ಱ,

    process: PROCESS,
    
  };
  /* <!-- External Visibility --> */

};
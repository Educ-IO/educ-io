Google_API = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides an interface onto various Google APIs --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.timeout: Custom timeout for each network/API domain base --> */
  /* <!-- @factory.Network: Function to create a network helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore, quotedPrintable (for emails) --> */
  /* <!-- REQUIRES: Factory Scope: Network helper --> */

  /* === Internal Visibility === */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {};

  const LAST_RESORT_TIMEOUT = 60000,
    PAGE_SIZE = 200,
    BATCH_SIZE = 50,
    PATH_LIMIT = 150;

  const READER = () => { /* <!-- FileReader Wrapper which appends 'promiseAs' methods --> */

    var reader = new FileReader(),
      promisify = fn =>
      function() {
        var _arguments = arguments;
        return new Promise((resolve, reject) => {
          var clean = events => _.each(events, (handler, event) =>
              reader.removeEventListener(event, handler)),
            events = {
              load: () => clean(events) && resolve(reader.result),
              abort: () => clean(events) && reject(),
              error: () => clean(events) && reject(reader.error),
            };
          _.each(events, (handler, event) => reader.addEventListener(event, handler));
          fn.apply(reader, _arguments);
        });
      };

    _.each(_.filter(_.allKeys(reader), name => (/^READAS/i).test(name) && _.isFunction(reader[name])),
      fn => reader[fn.replace(/^READAS/i, "promiseAs")] = promisify(reader[fn]));

    return reader;
  };

  const WILDCARD = test => (value, remove) => {
    var present = value.indexOf(test);
    return remove ?
      present < 0 ?
      value : present === 0 ?
      value.slice(present + test.length) : present == (value.length - 1) ?
      value.slice(0, value.length - test.length) : value :
      present >= 0;
  };

  const TEAM = (id, team, start) =>
    team ? `${start ? "?" : start !== null && start !== undefined ? "&" : ""}${id !== team ? team !== true ? `teamDriveId=${team}&` : "" :""}supportsTeamDrives=true&supportsAllDrives=true` : "";
  /* <!-- Internal Constants --> */

  /* <!-- Network Constants --> */
  const GENERAL_URL = {
    name: "general",
    url: "https://www.googleapis.com/",
    rate: 4,
    /* <!-- 500 per 100 seconds --> */
    concurrent: 8,
    timeout: 60000,
  };
  const PERMISSIONS_URL = {
    name: "permissions",
    url: "https://www.googleapis.com/",
    rate: 1,
    /* <!-- To stop Sharing Limit Rate Exceeded Errors --> */
    concurrent: 1,
    timeout: 60000,
  };
  const SHEETS_URL = {
    name: "sheets",
    url: "https://sheets.googleapis.com/",
    rate: 4,
    /* <!-- 100 per 100 seconds --> */
    concurrent: 2,
    timeout: 30000,
  };
  const SCRIPTS_URL = {
    name: "scripts",
    url: "https://script.googleapis.com/",
    rate: 1,
    concurrent: 1,
    timeout: 30000,
  };
  const ADMIN_URL = {
    name: "admin",
    url: "https://www.googleapis.com/admin/",
    rate: 4,
    concurrent: 4,
    timeout: 30000,
  };
  const CLASSROOM_URL = {
    name: "classroom",
    url: "https://classroom.googleapis.com/",
    rate: 1,
    concurrent: 1,
    timeout: 30000,
  };
  const URLS = [GENERAL_URL, PERMISSIONS_URL, SHEETS_URL, SCRIPTS_URL, ADMIN_URL, CLASSROOM_URL];
  /* <!-- Network Constants --> */

  /* <!-- Internal Constants --> */
  const ALL = "application/vnd.google-apps.*";
  const FOLDER = "application/vnd.google-apps.folder";
  const DOC = "application/vnd.google-apps.document";
  const SHEET = "application/vnd.google-apps.spreadsheet";
  const SLIDE = "application/vnd.google-apps.presentation";
  const DRAWING = "application/vnd.google-apps.drawing";
  const FORM = "application/vnd.google-apps.form";
  const NATIVES = [DOC, SHEET, SLIDE, DRAWING, FORM];
  const APP_DATA = "appDataFolder";

  const SKELETON = "id,name,size,parents,mimeType";
  const FIELDS = `kind,${SKELETON},description,version,webViewLink,webContentLink,iconLink,size,modifiedByMeTime,modifiedTime,hasThumbnail,thumbnailLink,starred,shared,properties,appProperties,teamDriveId,driveId,ownedByMe,capabilities,isAppAuthorized`;
  const FULL = `${FIELDS},createdTime,modifiedTime,sharingUser,owners,permissions`;

  const EVENTS = {
    SEARCH: {
      PROGRESS: "google-search-progress",
    },
  };

  const BOUNDARY = value => `**********%${value ? value : ""}%**********`;
  const CHARSET = "UTF-8";

  const STRIP_NULLS = data => _.chain(data).omit(_.isUndefined).omit(_.isNull).value();
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  var KEY, CLIENT_ID, _check, _before, _token, _nameCache = {};
  /* <!-- Internal Variables --> */

  /* <!-- Network Variables --> */
  const NETWORKS = _.reduce(URLS, (networks, url) => {
    networks[url.name] = factory.Network({
      base: url.url,
      timeout: options.timeout ? options.timeout : url.timeout ? url.timeout : LAST_RESORT_TIMEOUT,
      per_sec: url.rate ? url.rate : 0,
      concurrent: url.concurrent ? url.concurrent : 0,
      retry: r =>
        new Promise(resolve => r.status == 403 || r.status == 429 ?
          r.json().then(result => result.error.message && result.error.message.indexOf("Rate Limit Exceeded") >= 0 ? resolve(true) : resolve(false)) : resolve(false))
    }, factory);
    return networks;
  }, {});
  /* <!-- Network Variables --> */

  /* <!-- Internal Functions --> */
  var _init = (token, type, expires, user, update) => {

    /* <!-- Check Function to ensure token validity --> */
    _check = ((e, u) => force => {

      return new Promise((resolve, reject) => {

        if (force || e <= new Date()) { /* Token Expired */

          u(force).then(r => { /* Update token */

            if (r) _init(r.token, r.type, r.expires, r.user, u); /* Non-Null Response, so changes required */
            resolve(true);

          }).catch(err => reject(err));

        } else { /* Token Fine */

          resolve(false);

        }

      });

    })(new Date((expires - 1) * 1000), update); /* 1 second shift in case of network delays! */

    /* <!-- Pass Token to Network --> */
    _before = ((t, w) => {
      /* "Authorization: token OAUTH-TOKEN" */
      return r => {
        if (r.headers) r.headers.Authorization = (w + " " + t);
        return true;
      };

    })(token, type);

    _token = (t => () => t)(token);

    /* <!-- Before Network Call : Request Authorisation Closure --> */
    _.each(NETWORKS, network => {
      network.before(_before);
      network.check(_check);
    });

  };

  var _arrayize = (value, test) => value && test(value) ? [value] : !value ? [] : value;

  var _list = (method, url, property, list, data, next) => {

    return new Promise((resolve, reject) => {

      _check().then(() => {

        if (data) {
          if (next) data.pageToken = next;
        } else if (next) {
          data = {
            pageToken: next
          };
        }

        method(url, data).then(value => {

          list = list.concat(value[property]);

          value.nextPageToken ?
            _list(method, url, property, list, data, value.nextPageToken).then(list => resolve(list)) : resolve(list);

        }).catch(e => reject(e));

      });

    });

  };

  var _call = function(method) {
    return new Promise((resolve, reject) => {
      _check().then(() => method.apply(this, _.rest(arguments)).then(value => resolve(value)).catch(e => reject(e)));
    });
  };

  var _get = (id, team, full) => {
    var _data = team ?
      team === true ? {
        fields: full ? FULL : FIELDS,
        includeTeamDriveItems: true,
        supportsAllDrives: true,
        supportsTeamDrives: true,
        corpora: "user,allTeamDrives"
      } : {
        fields: full ? FULL : FIELDS,
        teamDriveId: team,
        supportsAllDrives: true,
        includeTeamDriveItems: true,
        supportsTeamDrives: true,
        corpora: "teamDrive"
      } : {
        fields: full ? FULL : FIELDS,
      };
    return _call(NETWORKS.general.get, "drive/v3/files/" + id, _data);
  };

  var _pick = (title, multiple, team, views, callback, context, get) => {

    if (window.google && google.picker) {
      const PICKER = google.picker,
        RESPONSE = PICKER.Response,
        ACTION = PICKER.Action,
        FEATURE = PICKER.Feature;
      var origin = `${window.location.protocol}//${window.location.host}`,
        picker = new google.picker.PickerBuilder()
        .setTitle(title)
        .setAppId(CLIENT_ID ? CLIENT_ID.split("-")[0] : CLIENT_ID)
        .setOAuthToken(_token())
        .setOrigin(origin)
        .setCallback(((callback, context) => data => {
          if (data[RESPONSE.ACTION] == ACTION.PICKED) {
            /* <!-- TODO: TeamDrive Items picked from Recent don't have teamDriveId ... --> */
            var _files = data[RESPONSE.DOCUMENTS];
            multiple ?
              (get ? Promise.all(_.map(_files, file => _get(file.id, data.viewToken[0] == "recently-picked" && !file.teamDriveId ? 
                                                            file.parentId : file.teamDriveId))) :
                Promise.resolve(_files)).then(files => callback(files, context)) :
              (get ? _get(_files[0].id, data.viewToken[0] == "recently-picked" && !_files[0].teamDriveId ?
                          _files[0].parentId : _files[0].teamDriveId) : Promise.resolve(_files[0]))
              .then(file => callback(file, context));
          } else if (data[RESPONSE.ACTION] == ACTION.CANCEL) {
            callback(false, context);
          }
        })(callback, context));

      if (multiple) picker.enableFeature(FEATURE.MULTISELECT_ENABLED);
      /* <!-- This doesn't currently work in Google Loader v1, but does in GAPI --> */
      if (team) picker.enableFeature(FEATURE.SUPPORT_TEAM_DRIVES);
      if (views && typeof views === "function") views = views();
      var make = view => _.isString(view) ? view = new google.picker.View(view) : view;
      if (!views || (Array.isArray(views) && views.length === 0)) {
        var view = new PICKER.DocsView()
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true)
          .setParent("root");
        picker.addView(view.setEnableTeamDrives ? view.setEnableTeamDrives(team) : view);
      } else if (Array.isArray(views)) {
        views.forEach(function(view) {
          picker.addView((view = make(view)).setEnableTeamDrives ?
            view.setEnableTeamDrives(view.team !== undefined ? view.team : team) : view);
        });
        if (views.length == 1 && !views[0].navigation) picker.enableFeature(FEATURE.NAV_HIDDEN);
      } else {
        picker.addView((views = make(views)).setEnableTeamDrives ?
          views.setEnableTeamDrives(views.team !== undefined ? views.team : team) : views);
        picker.enableFeature(FEATURE.NAV_HIDDEN);
      }

      picker.build().setVisible(true);

    } else {

      var _callback = ((title, multiple, team, views, callback, context, get) => () => _pick(title, multiple, team, views, callback, context, get))(title, multiple, team, views, callback, context, get);

      window.google ?
        google.load("picker", "1", {
          "callback": _callback
        }) :
        gapi.load("picker", {
          "callback": _callback
        });

    }

  };

  var _contents = (ids, names, mimeTypes, excludeMimeTypes, properties, visibilities, shared, skeleton, team, overrideType, propertyModifier, spaces, fields, owner, dates) => {

    /* <!-- Build the ID portion of the query --> */
    var _i = ids && ids.length > 0 ?
      _.reduce(ids, (q, id, i) => q + (i > 0 ? " or '" + id + "' in parents" : "'" + id + "' in parents"), " and (") + ")" : "";

    /* <!-- Build the NAME portion of the query --> */
    /* <!-- TODO: Should this be wildcarded as below? --> */
    var _n = names && names.length > 0 ?
      _.reduce(names, (q, n, i) => q + (i > 0 ? " or name contains '" : "name contains '") + n + "'", " and (") + ")" : "";

    /* <!-- Build the MIME portion of the query --> */
    var _wild = WILDCARD("*"),
      _m = mimeTypes && mimeTypes.length > 0 ?
      _.reduce(mimeTypes, (q, m, i) => q + (i > 0 ? " or mimeType" : "mimeType") +
        (_wild(m) ? " contains " : " = ") + "'" + _wild(m, true) + "'", " and (") + ")" : "";

    /* <!-- Build exclude MIME portion of the query --> */
    var _e = excludeMimeTypes && excludeMimeTypes.length > 0 ?
      _.reduce(excludeMimeTypes, (q, m, i) => q + (i > 0 ? " and mimeType != '" : "mimeType != '") + m + "'", " and (") + ")" : "";

    /* <!-- Build PROPERTIES portion of the query --> */
    var _kv = p => "key='" + (p.indexOf("=") > 0 ? (p.split("=")[0] + "' and value='" + p.split("=")[1] + "'") : (p + "' and value=''"));
    var _p = properties && properties.length > 0 ?
      _.reduce(properties, (q, p, i) => q + (i > 0 ? " " + propertyModifier + " (properties has { " + _kv(p) + " } or appProperties has { " + _kv(p) + " })" : "(properties has { " + _kv(p) + "} or appProperties has { " + _kv(p) + "})"), " and (" + (overrideType ? "mimeType = '" + overrideType + "' or (" : "")) + (overrideType ? "))" : ")") : "";

    /* <!-- Build VISIBILITY portion of the query --> */
    var _v = visibilities && visibilities.length > 0 ?
      _.reduce(visibilities, (q, v, i) => q + (i > 0 ? " or visibility = '" : "visibility = '") + v + "'", " and (") + ")" : "";

    /* <!-- Build SHARED portion of the query --> */
    var _s = shared || owner === false ? " and (sharedWithMe = true)" : "";

    /* <!-- Build OWNER portion of the query --> */
    var _o = owner !== null && owner !== undefined ?
      ` and${owner === false ? " not" : ""} ('${_.isString(owner) ? owner : "me"}' in owners)` :
      "";

    /* <!-- Build DATES portion of the query --> */
    var _formatDate = value => value ?
      _.isString(value) ? value :
      _.isDate(value) || _.isFunction(value.toISOString) ?
      value.toISOString() :
      new Date().toISOString() :
      new Date().toISOString();

    var _d = dates !== null && dates !== undefined ?
      ` and (${dates.from ? `modifiedTime >= '${_formatDate(dates.from)}'` : ""}${dates.from && dates.to ? " and " : ""}${dates.to ? `modifiedTime <= '${_formatDate(dates.to)}'` : ""})` : "";

    var _data = {
      pageSize: PAGE_SIZE,
      q: "trashed = false" + _i + _n + _m + _e + _p + _v + _s + _o + _d,
      orderBy: "starred, modifiedByMeTime desc, viewedByMeTime desc, name",
      fields: `kind,nextPageToken,incompleteSearch,files(${fields ? fields : skeleton ? SKELETON : FIELDS}${skeleton && team ? ",teamDriveId" : ""})`,
    };

    if (team) {
      _data.teamDriveId = team;
      _data.includeTeamDriveItems = true;
      _data.supportsTeamDrives = true;
      _data.corpora = "teamDrive";
    } else if (spaces) {
      _data.spaces = spaces;
    } else {
      _data.spaces = "drive";
    }

    return _list(NETWORKS.general.get, "drive/v3/files", "files", [], _data);

  };

  var _paths = (parents, chain, all, cache, team) => {

    var _path = (parent, chain) => {

      return new Promise(resolve => {

        var _complete = item => {
          if (item) chain.push(item);
          resolve(_paths(item ? item.parents : [], chain, all, cache, team));
        };

        if (cache[parent]) { /* <!-- Already Fetched --> */
          _complete(cache[parent]);
        } else if (cache.__pending && cache.__pending[parent]) { /* <!-- Fetch already pending --> */
          cache.__pending[parent].push(item => _complete(item));
        } else { /* <!-- Set-Up Fetch --> */
          if (!cache.__pending) cache.__pending = {};
          cache.__pending[parent] = [];
          /* <!-- Batcher to be inserted here --> */
          _get(parent, team).then(item => {
            cache[item.id] = {
              id: item.id,
              name: item.name,
              parents: item.parents
            };
            _.each(cache.__pending[parent], f => f(item));
            delete cache.__pending[parent];
            _complete(item);
          });
        }
      });

    };

    return new Promise(resolve => {
      if (parents && parents.length > 0) {
        if (parents.length == 1) {
          _path(parents[0], chain).then(value => resolve(value));
        } else {
          var promises = [];
          _.each(parents, parent => promises.push(_path(parent, _.clone(chain))));
          Promise.all(promises).then(() => resolve(all));
        }
      } else {
        all.push(chain.reverse());
        resolve(all);
      }
    });

  };

  var _search = (ids, recurse, folders, names, mimeTypes, excludes, includes, properties, visibilities, shared, team, cache, totals) => {

    return new Promise((resolve, reject) => {

      _contents(ids, names, mimeTypes, [], properties && properties.simple ? properties.simple : null, visibilities, shared, false, team, recurse && mimeTypes.length === 0 ? FOLDER : null, properties.modifier ? properties.modifier : "and").then(c => {

        /* <!-- Update Progress Event --> */
        if (totals && ids && window)(totals.folders += ids.length) && window.dispatchEvent(new CustomEvent(EVENTS.SEARCH.PROGRESS, {
          detail: totals
        }));

        /* <!-- Filter the results using the Exclude then Include methods --> */
        if (excludes) c = _.reject(c, item => _.some(excludes, e => e(item)));
        if (includes) c = _.filter(c, item => _.some(includes, i => i(item)));

        /* <!-- Get the ids of all the folders included in the raw set --> */
        var _cache = item => cache[item.id] = {
          id: item.id,
          name: item.name,
          parents: item.parents
        };
        var next = recurse ? _.filter(c, item => item.mimeType === FOLDER) : [];
        _.each(next, _cache);
        next = _.map(next, f => f.id);

        /* <!-- Batch these IDs into Arrays with length not longer than BATCH_SIZE --> */
        var batches = _.chain(next).groupBy((v, i) => Math.floor(i / BATCH_SIZE)).toArray().value();

        /* <!-- Make an array of promises to resolve with the results of these searches --> */
        var p = recurse ? _.map(batches,
          batch => _search(batch, recurse, folders, names, mimeTypes, excludes, includes, properties, visibilities, shared, team, cache, totals)) : [];

        /* <!-- Filter to remove the folders if we are not returning them --> */
        if (!folders) c = _.reject(c, item => item.mimeType === FOLDER);

        /* <!-- Filter the results using Advanced Properties --> */
        if (properties && properties.complex && properties.complex.length > 0) c = _.filter(c, item => properties.modifier && properties.modifier == "or" ?
          _.some(properties.complex, i => i(item)) : _.every(properties.complex, i => i(item)));

        /* <!-- Resolve this promise whilst resolving the recursive promises too if available --> */
        var _finish = items => p && p.length > 0 ? Promise.all(p).then(r => resolve(_.reduce(r, (c, v) => v && v.length > 0 ? c.concat(v) : c, items))).catch(e => reject(e)) : resolve(items);

        /* <!-- Resolve the paths promises before moving on --> */
        var _getPaths = () => Promise.all(_.map(c, item => new Promise(resolve => _paths(item.parents, [], [], cache, team).then(paths => (item.paths = paths) && resolve(item))))).then(_finish);

        /* <!-- Add in the current path value to each item --> */
        (c.length <= PATH_LIMIT) || recurse ?
          _getPaths() :
          _contents(null, null, [FOLDER], null, null, null, null, true, team, null).then(f => _.each(f, _cache)).then(_getPaths);

      }).catch(e => reject(e));

    });

  };

  var _upload = (metadata, binary, mimeType, team, id, fields) => {

    var _payload = new Blob([
      "--" + BOUNDARY() + "\r\n" + "Content-Type: application/json; charset=UTF-8" + "\r\n\r\n" + (metadata ? JSON.stringify(metadata) : "") + "\r\n\r\n" + "--" + BOUNDARY() + "\r\n" + "Content-Type: " + mimeType + "\r\n\r\n",
      binary, "\r\n" + "--" + BOUNDARY() + "--" + "\r\n"
    ], {
      type: "multipart/related; boundary=" + BOUNDARY(),
      endings: "native"
    });

    return _call(
      id ? NETWORKS.general.patch : NETWORKS.general.post,
      `upload/drive/v3/files/${id?`${id}?newRevision=true&`:"?"}uploadType=multipart${TEAM(id, team, false)}${fields ? `&fields=${fields === true ? FIELDS : fields}`:""}`, _payload, "multipart/related; boundary=" + BOUNDARY(), null, "application/binary");

  };
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    /* <!-- External Functions --> */
    initialise: function(token, type, expires, user, update, key, client_id) {

      /* <!-- Set the Important Constants --> */
      KEY = key, CLIENT_ID = client_id;

      /* <!-- Run the Initialisation --> */
      _init(token, type, expires, user, update);

      /* <!-- Return for Chaining --> */
      return this;

    },

    networks: () => _.map(NETWORKS, network => network.details()),

    /* <!-- Get Repos for the current user (don't pass parameter) or a named user --> */
    me: () => _call(NETWORKS.general.get, "oauth2/v1/userinfo?alt=json"),

    execute: (id, method, data) => _call(NETWORKS.scripts.post, `/v1/scripts/${id}:run`, {
      function: method,
      parameters: data,
    }),

    scripts: () => _list(NETWORKS.general.get, "drive/v3/files", "files", [], {
      q: "mimeType = 'application/vnd.google-apps.script' and trashed = false",
      orderBy: "modifiedByMeTime desc,name",
      fields: "files(description,id,modifiedByMeTime,name,version)",
    }),

    pick: _pick,

    permissions: {

      get: (file, team, admin) => {

        var _id = file && file.id ? file.id : file,
          _url = `drive/v3/files/${_id}/permissions${TEAM(_id, team, true)}`,
          _fields = "id,type,emailAddress,domain,role,allowFileDiscovery,displayName,photoLink,expirationTime,deleted";
        return _list(NETWORKS.general.get, _url, "permissions", [], {
          fields: `kind,nextPageToken,permissions(${_fields}${team ? ",teamDrivePermissionDetails" : ""})`,
          useDomainAdminAccess: !!admin,
        });
      },

      /* <!-- Roles = owner | organizer | fileOrganizer | writer | commenter | reader --> */
      share: (file, team, message) => {

        var _id = file && file.id ? file.id : file,
          _parameters = `?sendNotificationEmail=${message ? `true${message === true ? "" : `&emailMessage=${encodeURIComponent(message)}`}` : "false"}${TEAM(_id, team, false)}`,
          _url = `drive/v3/files/${_id}/permissions${_parameters}`;

        return {

          user: (user, role) => _call(NETWORKS.permissions.post, _url, {
            type: "user",
            emailAddress: user,
            role: role
          }),

          group: (group, role) => _call(NETWORKS.permissions.post, _url, {
            type: "group",
            emailAddress: group,
            role: role
          }),

          domain: (domain, role) => _call(NETWORKS.permissions.post, _url, {
            type: "domain",
            domain: domain,
            role: role
          }),

          anyone: role => _call(NETWORKS.permissions.post, _url, {
            type: "anyone",
            role: role
          }),

        };

      },

    },

    appData: {

      contents: (properties) => _contents([APP_DATA], null, null, null, properties, null, null, false, false, null, null, "appDataFolder"),

      search: (names, mimeTypes, properties) => _contents([APP_DATA], _arrayize(names, _.isString), _arrayize(mimeTypes, _.isString),
        null, properties, null, null, false, false, null, null, "appDataFolder"),

      upload: (metadata, binary, mimeType, id) => _upload(id ? null : metadata ? _.defaults({
        parents: [APP_DATA]
      }, metadata) : metadata = {
        parents: [APP_DATA]
      }, binary, mimeType, null, id),

    },

    mail: {

      send: (to, subject, message, plain_message, from, user) => {

        var _makePlain = message => [
            `Content-Type: multipart/alternative; boundary="${BOUNDARY()}"`,
            "",
            `--${BOUNDARY()}`,
            `Content-Type: text/plain;charset="${CHARSET}"`,
            "Content-Transfer-Encoding: quoted-printable",
            "",
            message && _.isString(message) ? message : "",
            "",
            `--${BOUNDARY()}--`,
          ],
          _makeHtml = (message, plain) => [
            `Content-Type: multipart/mixed; boundary="${BOUNDARY("MIXED")}"`,
            "",
            `--${BOUNDARY("MIXED")}`,
            `Content-Type: multipart/related; boundary="${BOUNDARY("RELATED")}"`,
            "",
            `--${BOUNDARY("RELATED")}`,
            `Content-Type: multipart/alternative; boundary="${BOUNDARY()}"`,
            "",
            `--${BOUNDARY()}`,
            `Content-Type: text/plain;charset="${CHARSET}"`,
            "Content-Transfer-Encoding: quoted-printable",
            "",
            plain && _.isString(plain) ?
            window.quotedPrintable ? quotedPrintable.encode(plain) : plain : "",
            "",
            `--${BOUNDARY()}`,
            `Content-Type: text/html; charset="${CHARSET}"`,
            "Content-Transfer-Encoding: quoted-printable",
            "",
            message && _.isString(message) ?
            window.quotedPrintable ?
            quotedPrintable.encode(message) : message : "",
            "",
            `--${BOUNDARY()}--`,
            "",
            `--${BOUNDARY("RELATED")}--`,
            "",
            `--${BOUNDARY("MIXED")}--`,
          ].join("\r\n"),
          _message = `To: ${to}\r\n${from ? `From: ${from}\r\n` : ""}Subject: ${subject}\r\nMIME-Version: 1.0\r\n${plain_message ?
            _makeHtml(message, plain_message) : _makePlain(message)}`;

        return _call(
          NETWORKS.general.post, `gmail/v1/users/${user ? user : "me"}/messages/send?alt=json`, {
            raw: factory.Strings().base64.encode(_message)
              .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
          });

      },

    },

    files: {

      all: () => ALL,

      natives: () => NATIVES,

      is: type => item => item.mimeType === type,

      in: type => item => item.mimeType && item.mimeType.startsWith(type),

      native: type => type && NATIVES.indexOf(type.toLowerCase()) >= 0,

      delete: (id, team, trash) => {
        var _url = `drive/v3/files/${id}${TEAM(id, team, true)}`;
        var _data = trash ? {
          trashed: true
        } : null;
        var _function = trash ? NETWORKS.general.patch : NETWORKS.general.delete;
        return _call(_function, _url, _data);
      },

      get: _get,

      copy: (id, team, file) => {
        var _url = `drive/v3/files/${id}/copy${TEAM(id, team, true)}`;
        return _call(NETWORKS.general.post, _url, file);
      },

      upload: (metadata, binary, mimeType, team, id, fields) => _upload(metadata, binary, mimeType, team, id, fields),

      download: (id, team) => team ? _call(NETWORKS.general.download, "drive/v3/files/" + id, {
        alt: "media",
        supportsTeamDrives: true
      }) : _call(NETWORKS.general.download, "drive/v3/files/" + id, {
        alt: "media",
      }),

      export: (id, format) => _call(NETWORKS.general.get, "drive/v3/files/" + id + "/export", {
        mimeType: format
      }, null, "application/binary"),

      save: (id, files, team) => _call(NETWORKS.general.patch, `upload/drive/v3/files/${id}?uploadType=media${TEAM(id, team, false)}`, {
        files: files
      }, "application/json"),

      update: (id, file, team, fields) => {
        var _team = TEAM(id, team, true);
        return _call(NETWORKS.general.patch, `drive/v3/files/${id}${_team}${fields ? `${_team ? "&" : "?"}fields=${fields === true ? FIELDS : fields}` : ""}`, file, "application/json");
      },

      move: (id, source, destination, team) => _call(NETWORKS.general.patch,
        `drive/v3/files/${id}?addParents=${_arrayize(destination, _.isString).join(",")}&removeParents=${_arrayize(source, _.isString).join(",")}${TEAM(id, team, false)}`),

      tag: (name, value, app) => {
        var _values = {};
        _values[name] = value;
        var _properties = {};
        _properties[app ? "appProperties" : "properties"] = _values;
        return _properties;
      },

      type: (mime, corpora, spaces, query) => {
        var _domain = "domain", 
            _fn = corpora => _list(NETWORKS.general.get, "drive/v3/files", "files", [], {
              pageSize: PAGE_SIZE,
              q: `trashed = false and ${_.isArray(mime) ? 
                `(${_.reduce(mime, (memo,mime) => `${memo ? `${memo} or ` : ""}mimeType = '${mime}'`, "")})` :
                `mimeType = '${mime}'`}${query ? ` and ${query}` : ""}`,
              orderBy: "starred, modifiedByMeTime desc, viewedByMeTime desc, name",
              fields: `kind,nextPageToken,incompleteSearch,files(${FULL})`,
              includeItemsFromAllDrives: true,
              includeTeamDriveItems: true,
              supportsAllDrives: true,
              supportsTeamDrives: true,
              corpora: corpora ? corpora : "user,allTeamDrives",
              spaces: spaces ? spaces : "drive",
            }).catch(() => null),
            _split = corpora => {
              corpora = corpora.split(",");
              corpora.splice(corpora.indexOf(_domain),1);
              corpora = corpora.join(",");
              return Promise.all([_fn(corpora), _fn(_domain)])
                .then(values => _.compact(_.flatten(values)));
            };
        return corpora && corpora.indexOf(_domain) >= 0 && corpora != _domain ? _split(corpora) : _fn(corpora);
      },

      comments: file => {

        const FIELDS = "kind,id,createdTime,modifiedTime,author,content,anchor,deleted,resolved";

        var fn = {

          create: (content, anchor) => _call(NETWORKS.general.post,
            `drive/v3/files/${file && file.id ? file.id : file}/comments?fields=${FIELDS}`, STRIP_NULLS({
              content: content,
              anchor: anchor,
            })),

          update: (id, content) => _call(NETWORKS.general.patch,
            `drive/v3/files/${file && file.id ? file.id : file}/comments/${id}?fields=${FIELDS}`, STRIP_NULLS({
              content: content,
            })),

          delete: id => _call(NETWORKS.general.delete,
            `drive/v3/files/${file && file.id ? file.id : file}/comments/${id}`),

          list: () => _list(NETWORKS.general.get,
            `drive/v3/files/${file && file.id ? file.id : file}/comments`, "comments", [], STRIP_NULLS({
              fields: `kind,nextPageToken,comments(${FIELDS})`
            })),

        };

        return fn;

      },

      revisions: file => {

        const FIELDS = "kind,id,mimeType,modifiedTime,md5Checksum,size";

        var fn = {

          list: () => _list(NETWORKS.general.get,
            `drive/v3/files/${file && file.id ? file.id : file}/revisions`, "revisions", [], STRIP_NULLS({
              fields: `kind,nextPageToken,revisions(${FIELDS})`,
            })),

          get: id => _call(NETWORKS.general.get,
            `drive/v3/files/${file && file.id ? file.id : file}/revisions/${id}`, STRIP_NULLS({
              fields: FIELDS,
            })),

          latest: () => fn.get("head"),

        };

        return fn;
      },

      search: (mimeTypes, properties, mine, dates, full) => _contents(null, null,
        _arrayize(mimeTypes, _.isString), null, _arrayize(properties, _.isString),
        null, null, false, false, null, null, null, full ? FULL : null, mine, dates),

    },

    calendar: {

      get: id => _call(NETWORKS.general.get, `calendar/v3/calendars/${encodeURIComponent(id)}`, {
        fields: "id,summary,description,timeZone",
      }),

      list: (id, start, end) => _list(NETWORKS.general.get,
        `calendar/v3/calendars/${encodeURIComponent(id)}/events`, "items", [], STRIP_NULLS({
          orderBy: "startTime",
          singleEvents: true,
          timeMin: start ? start.toISOString() : null,
          timeMax: end ? end.toISOString() : null,
          fields: "kind,nextPageToken,items(id,summary,description,created,updated,start,end,extendedProperties,organizer,attendees,attachments,recurringEventId,source,status,htmlLink,location)",
        })),

      search: (id, property, query) => _list(NETWORKS.general.get,
        `calendar/v3/calendars/${encodeURIComponent(id)}/events`, "items", [], STRIP_NULLS({
          orderBy: "startTime",
          singleEvents: true,
          sharedExtendedProperty: property,
          q: query,
          fields: "kind,nextPageToken,items(id,summary,description,created,updated,start,end,extendedProperties,organizer,attendees,attachments,recurringEventId,source,status,htmlLink,location)",
        })),

      events: {

        create: (id, data, conference) => _call(NETWORKS.general.post, `calendar/v3/calendars/${encodeURIComponent(id)}/events${conference === true ? "" : "?conferenceDataVersion=1"}`, data, "application/json"),
        
        get: (id, event) => _call(NETWORKS.general.get, `calendar/v3/calendars/${encodeURIComponent(id)}/events/${event}`, {
          fields: "id,summary,description,created,updated,start,end,extendedProperties,organizer,attendees,attachments,recurringEventId,source,status,htmlLink,location",
        }),

        update: (id, event, data) => _call(NETWORKS.general.patch, `calendar/v3/calendars/${encodeURIComponent(id)}/events/${event}`, data, "application/json"),

      },
      
      busy: (ids, start, end, zone) => _call(NETWORKS.general.post, "calendar/v3/freeBusy", {
        timeMin: start ? start.toISOString() : null,
        timeMax: end ? end.toISOString() : null,
        timeZone: zone ? zone : null,
        items: _.map(ids, id => ({id : id})),
      }, "application/json"),
      
    },

    calendars: {

      get: id => _call(NETWORKS.general.get, `calendar/v3/users/me/calendarList/${encodeURIComponent(id)}`, {
          fields: "id,summary,summaryOverride,description,accessRole",
        }),
      
      list: () => _list(
        NETWORKS.general.get, "calendar/v3/users/me/calendarList", "items", [], {
          orderBy: "summary",
          fields: "kind,nextPageToken,items(id,summary,summaryOverride,description,accessRole)",
        }),

    },

    classrooms: {

      list: state => _list(
        NETWORKS.classroom.get, "/v1/courses", "courses", [], {
          courseStates: state || "ACTIVE",
          fields: "nextPageToken,courses(id,name,section,description,calendarId,teacherFolder)",
        }),

      work: classroom => {

        var _id = classroom && classroom.id ? classroom.id : classroom,
          _url = `v1/courses/${_id}/courseWork`;

        return {

          list: state => _list(
            NETWORKS.classroom.get, _url, "courseWork", [], {
              courseWorkStates: state || "PUBLISHED",
              orderBy: "dueDate",
              fields: "nextPageToken,courseWork(id,title,dueDate,dueTime,workType,alternateLink)",
            }),

        };

      },
    },

    admin: {
      
      privileges : customer => _call(NETWORKS.admin.get, `directory/v1/customer/${customer || "my_customer"}/roles/ALL/privileges`),

    },
    
    resources: {
      
      buildings: customer => _list(
        NETWORKS.admin.get,
        `directory/v1/customer/${customer || "my_customer"}/resources/buildings`, "buildings", [], {
          orderBy: "buildingName",
          fields: "nextPageToken,buildings(buildingId,buildingName,description,coordinates,floorNames,address)"
        }),
  
      calendars: (query, customer) => _list(
        NETWORKS.admin.get,
        `directory/v1/customer/${customer || "my_customer"}/resources/calendars`, "items", [], {
          orderBy: "resourceName",
          query: query || "", 
          fields: "nextPageToken,items(resourceId,resourceName,generatedResourceName,resourceType,resourceDescription,resourceEmail,capacity,buildingId,floorName,floorSection,resourceCategory,userVisibleDescription),items/featureInstances/feature/name"}),
      
      features: customer => _list(
        NETWORKS.admin.get,
        `directory/v1/customer/${customer || "my_customer"}/resources/features`, "features", [], {
          orderBy: "name",
          fields: "nextPageToken,features(name)"
        })
     
    },
    
    teamDrives: {

      get: id => _call(NETWORKS.general.get, `drive/v3/teamdrives/${id}`, {
        fields: "kind,id,name,colorRgb,capabilities",
      }),

      list: (details, admin) => _list(
        NETWORKS.general.get, "drive/v3/teamdrives", "teamDrives", [], {
          orderBy: "name",
          fields: `kind,nextPageToken,teamDrives(id,name,colorRgb${details ? ",createdTime,capabilities,restrictions" : ""})`,
          useDomainAdminAccess: !!admin,
        }),

    },

    folders: {

      native: () => FOLDER,

      check: is => item => is ? item.mimeType === FOLDER : item.mimeType !== FOLDER,

      is: type => type === FOLDER,

      search: (ids, recurse, names, mimeTypes, excludes, includes, properties, visibilities, shared, team, basic) => {
        var _folders = (mimeTypes = _arrayize(mimeTypes, _.isString)).indexOf(FOLDER) >= 0;
        return basic ?
          _search(null, false, false, names, mimeTypes, null, null, properties, visibilities, shared, team, _nameCache, {
            folders: 0
          }) :
          _search(
            _arrayize(ids, _.isString), recurse, _folders, names,
            recurse && mimeTypes && mimeTypes.length > 0 && !_folders ? [FOLDER].concat(mimeTypes) : mimeTypes,
            _arrayize(excludes, _.isFunction),
            recurse && !_folders ? [f => f.mimeType === FOLDER].concat(_arrayize(includes, _.isFunction)) : _arrayize(includes, _.isFunction),
            properties, visibilities, shared, team, _nameCache, {
              folders: 0
            });
      },

      contents: (ids, mimeTypes, team, properties) => _contents(_arrayize(ids, _.isString), null, _arrayize(mimeTypes, _.isString), null, properties, null, null, false, team),

      children: (ids, skeleton, team, properties) => _contents(_arrayize(ids, _.isString), null, null, null, properties, null, null, skeleton, team),

      folders: (ids, skeleton, team, properties) => _contents(_arrayize(ids, _.isString), null, [FOLDER], null, properties, null, null, skeleton, team),

      files: (ids, skeleton, team) => _contents(_arrayize(ids, _.isString), null, null, [FOLDER], null, null, null, skeleton, team),

      create: (name, parent, data, team) => _call(NETWORKS.general.post, `drive/v3/files${TEAM(null, team, true)}`,
        _.defaults({
          mimeType: FOLDER,
          name: name,
          parents: _arrayize(parent, _.isString)
        }, data)),

    },

    sheets: {

      /* <!-- Create a new Spreadsheet --> */
      create: (name, tab, colour, meta) => {
        var _data = {
          "properties": {
            "title": name
          },
          "sheets": [{
            "properties": {
              "sheetId": 0,
              "title": tab ? tab : "Sheet1",
              "tabColor": colour ? colour : {
                "red": 0.0,
                "green": 0.0,
                "blue": 0.0
              }
            }
          }]
        };
        if (meta) _data.sheets[0].developerMetadata = _.map((_.isArray(meta) ? meta : [meta]), meta => ({
          "metadataId": meta.id,
          "metadataKey": meta.key,
          "metadataValue": String(meta.value),
          "visibility": meta.visibility ? meta.visibility : "DOCUMENT"
        }));
        return _call(NETWORKS.sheets.post, "v4/spreadsheets", _data, "application/json");
      },

      get: (id, all, range) => _call(NETWORKS.sheets.get, `v4/spreadsheets/${id}${all ?
																`?includeGridData=true${range ? `&ranges=${encodeURIComponent(range)}` : ""}` : ""}`),

      filtered: (id, filters, all) => _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}:getByDataFilter`, {
        "dataFilters": _.isArray(filters) ? filters : [filters],
        "includeGridData": all ? true : false
      }),

      values: (id, ranges, sheet) => {

        var _batch = _.isArray(ranges),
          _metadata = _batch && _.every(ranges, _.isNumber);

        return _metadata ?
          _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/values:batchGetByDataFilter`, {
            "dataFilters": _.map(ranges, range => ({
              "developerMetadataLookup": {
                "locationMatchingStrategy": "INTERSECTING_LOCATION",
                "metadataLocation": sheet !== null && sheet !== undefined ? {
                  "sheetId": sheet
                } : {
                  "spreadsheet": true,
                },
                "metadataId": range,
              },
            })),
            "majorDimension": "ROWS",
          }, "application/json") :
          _batch ?
          _call(NETWORKS.sheets.get, `v4/spreadsheets/${id}/values:batchGet?${_.reduce(ranges, (memo, range) => `${memo}${memo.length > 0 ? "&" : ""}ranges=${encodeURIComponent(range)}`, "")}`) :
          _call(NETWORKS.sheets.get, `v4/spreadsheets/${id}/values/${encodeURIComponent(ranges)}`);
      },

      append: (id, range, values, input) => _call(NETWORKS.sheets.post, "v4/spreadsheets/" + id + "/values/" + encodeURIComponent(range) + ":append?valueInputOption=" + (input ? input : "RAW"), {
        "range": range,
        "majorDimension": "ROWS",
        "values": values
      }, "application/json"),

      clear: (id, ranges, sheet) => {

        var _batch = _.isArray(ranges),
          _metadata = _batch && _.every(ranges, _.isNumber);

        return _metadata ?
          _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/values:batchClearByDataFilter`, {
            "dataFilters": _.map(ranges, range => ({
              "developerMetadataLookup": {
                "locationMatchingStrategy": "INTERSECTING_LOCATION",
                "metadataLocation": sheet !== null && sheet !== undefined ? {
                  "sheetId": sheet
                } : {
                  "spreadsheet": true,
                },
                "metadataId": range,
              },
            })),
          }, "application/json") :
          _batch ?
          _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/values:batchClear`, {
            "ranges": ranges
          }, "application/json") :
          _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/values/${encodeURIComponent(ranges)}:clear`);

      },

      update: (id, ranges, values, input, sheet) => {

        var _batch = _.isArray(ranges) && _.isArray(values) && ranges.length == values.length,
          _metadata = _batch && _.every(ranges, _.isNumber);

        return _batch ?
          _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/values:${_metadata ? "batchUpdateByDataFilter" : "batchUpdate"}`, {
            "valueInputOption": input ? input : "RAW",
            "data": _.map(ranges, (range, index) => _metadata ? {
              "dataFilter": {
                "developerMetadataLookup": {
                  "locationMatchingStrategy": "INTERSECTING_LOCATION",
                  "metadataLocation": sheet !== null && sheet !== undefined ? {
                    "sheetId": sheet
                  } : {
                    "spreadsheet": true,
                  },
                  "metadataId": range,
                },
              },
              "majorDimension": "ROWS",
              "values": [values[index]]
            } : {
              "range": range,
              "majorDimension": "ROWS",
              "values": [values[index]]
            }),
            "includeValuesInResponse": true,
          }, "application/json") :
          _call(NETWORKS.sheets.put, `v4/spreadsheets/${id}/values/${encodeURIComponent(ranges)}?valueInputOption=${input ? input : "RAW"}`, {
            "range": ranges,
            "majorDimension": "ROWS",
            "values": values
          }, "application/json");

      },

      batch: (id, updates, returnSheet, returnData) => _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}:batchUpdate`, {
        "requests": _arrayize(updates, value => !_.isArray(value)),
        "includeSpreadsheetInResponse": returnSheet ? true : false,
        "responseIncludeGridData": returnData ? true : false,
      }, "application/json"),

      metadata: {

        all: id => _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/developerMetadata:search`, {
          "dataFilters": [{
            developerMetadataLookup: {
              visibility: "DOCUMENT"
            }
          }]
        }),

        find: (id, filters) => _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/developerMetadata:search`, {
          "dataFilters": _.isArray(filters) ? filters : [filters]
        }),

        get: (id, meta) => _call(NETWORKS.sheets.get, `v4/spreadsheets/${id}/developerMetadata/${meta}`),

        sheet: (id, sheet) => _call(NETWORKS.sheets.post, `v4/spreadsheets/${id}/developerMetadata:search`, {
          "dataFilters": [{
            developerMetadataLookup: {
              metadataLocation: {
                "sheetId": sheet
              }
            }
          }]
        })

      }

    },

    groups: {

      get: (id, details) => _call(NETWORKS.general.get, `admin/directory/v1/groups/${id}`, {
        fields: `kind,id,etag,email,name,description${details ? ",directMembersCount,adminCreated,aliases,nonEditableAliases" : ""}`
      }),

      members: (id, details) => _list(
        NETWORKS.general.get, `admin/directory/v1/groups/${id}/members`, "members", [], {
          includeDerivedMembership: true,
          orderBy: "email",
          fields: `kind,nextPageToken,members(kind,etag,id,email,role${details ? ",type,status,delivery_settings" : ""})`,
        }),

    },

    url: {

      insert: url => _call(NETWORKS.general.post, `urlshortener/v1/url${KEY ? `?key=${KEY}` : ""}`, {
        longUrl: url
      }, "application/json"),

    },

    reader: READER,

    events: () => EVENTS

  };
  /* === External Visibility === */
};
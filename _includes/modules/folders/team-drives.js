TeamDrives = ಠ_ಠ => {
  "use strict";

  /* <!-- MODULE: Provides tools to list and show team drive permissions --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Google --> */

  /* <!-- Internal Constants --> */
  const DB = new loki("team-drives.db"),
    TYPES = {
      user: {
        name: "User",
        icon: "face"
      },
      group: {
        name: "Group",
        icon: "group"
      },
      domain: {
        name: "Domain",
        icon: "domain"
      },
      anyone: {
        name: "Public",
        icon: "public"
      },
    },
    ROLES = {
      owner: {
        name: "Owner",
        title: "Owners",
        icon: "lock",
        count: 0
      },
      organizer: {
        name: "Manager",
        title: "Managers",
        icon: "perm_identity",
        count: 0
      },
      fileOrganizer: {
        name: "Content Manager",
        title: "Content Managers",
        icon: "supervised_user_circle",
        count: 0
      },
      writer: {
        name: "Writer",
        title: "Writers",
        icon: "edit",
        count: 0
      },
      commenter: {
        name: "Commenter",
        title: "Commenters",
        icon: "comment",
        count: 0
      },
      reader: {
        name: "Reader",
        title: "Readers",
        icon: "remove_red_eye",
        count: 0
      },
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */

  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _get = admin => ಠ_ಠ.Google.teamDrives.list(true, admin).then(drives => {
    var _drives = {};
    ಠ_ಠ.Flags.log("DRIVE list:", drives);
    return Promise.all(_.map(drives, drive => ಠ_ಠ.Google.permissions.get(drive.id, drive.id, admin)
        .then(permissions => {
          ಠ_ಠ.Flags.log(`PERMISSIONS for ${drive.name}:`, permissions);
          _.each(permissions, permission => {
            var _email = permission.emailAddress.toLowerCase(),
              _perms = _.reduce(_.keys(ROLES),
                (roles, role) => _.tap(roles, roles => roles[role] = []), {});
            if (!_drives[drive.id])
              _drives[drive.id] = {
                id: drive.id,
                name: drive.name,
                permissions: _perms
              };
            _drives[drive.id].permissions[permission.role].push({
              email: _email,
              role: ROLES[permission.role],
              name: permission.displayName,
              type: TYPES[permission.type],
              deleted: permission.deleted
            });
            ROLES[permission.role].count += 1;
          });
        }).catch(e => ಠ_ಠ.Flags.error("Permissions Load Error", e))))
      .then(() => _drives);
  });

  var _display = value => {

    ಠ_ಠ.Flags.log("TEAM DRIVES:", value);

    var _drives = _.chain(value).values().sortBy(d => d.name).map(d => d.id).value();

    var id = "team-drives",
      name = "Team Drives",
      headers = _.map(["Id", "Name"].concat(_.pairs(ROLES)), v => ({
        name: _.isArray(v) ? v[1].name : v,
        icon: _.isArray(v) ? v[1].icon : false,
        hide: function(initial) {
          return !!(initial && this.hide_initially);
        },
        set_hide: function(now, always, initially) {
          this.hide_initially = initially;
        },
        hide_always: false,
        hide_now: false,
        hide_initially: v == "Id" || (_.isArray(v) && !v[1].count) ? true : false,
        field: _.isArray(v) ? v[0] : v.toLowerCase(),
      }));

    var _data = DB.addCollection(id, {
      unique: ["id"],
      indices: ["name"]
    });

    _data.insert(_.map(_drives, drive => {
      var _drive = value[drive];
      return _.extend({
        id: _drive.id,
        name: _drive.name,
      }, _drive.permissions);
    }));

    return ಠ_ಠ.Datatable(ಠ_ಠ, {
      id: id,
      name: name,
      data: _data,
      headers: headers,
      classes: ["table-responsive"]
    }, {
      template: "drive_rows",
      advanced: false,
      collapsed: true
    }, $("<div />", {
      class: "container-fluid p-2"
    }).appendTo(ಠ_ಠ.container), target => target);

  };

  var _show = admin => _get(admin)
    .then(_display)
    .catch(e => ಠ_ಠ.Flags.error("Team Drives Load Failure", e ? e : "No Inner Error"))
    .then(ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      fn: true
    }));
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    show: _show,

  };
  /* <!-- External Visibility --> */

};
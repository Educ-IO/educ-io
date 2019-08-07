Groups = ಠ_ಠ => {
  "use strict";

  /* <!-- MODULE: Provides tools to list and show group members --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Google --> */

  /* <!-- Internal Constants --> */
  const ROLES = {
      manager: {
        name: "Manager",
        icon: "perm_identity",
      },
      member: {
        name: "Member",
        icon: "person"
      },
      owner: {
        name: "Owner",
        icon: "lock",
      }
    },
    TYPES = {
      user: {
        name: "User",
        icon: "face"
      },
      group: {
        name: "Group",
        icon: "group"
      },
      customer: {
        name: "Domain",
        icon: "domain"
      },
      external: {
        name: "Public",
        icon: "public"
      },
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _get = email => ಠ_ಠ.Google.groups.members(email, true)
    .then(members => _.tap(members, () => ಠ_ಠ.Flags.log("MEMBER list:", members)));

  var _display = (email, members, targets) => {
    if (!members || members.length === 0) return;
    targets.siblings(`[data-members='${email}']`).remove();
    _.each(members, member => {
      member.type = TYPES[member.type.toLowerCase()];
      member.role = ROLES[member.role.toLowerCase()];
    });
    var _show = ಠ_ಠ.Display.template.show({
      template: "group_members",
      email: email,
      members: members,
      target: $("<div />", {
        "class": `mt-1 ml-2 collapse${members.length < 5 ? " show" : ""}`,
        "data-members": email
      }).insertAfter(targets)
    });
    _show.each((i, el) => {
      var _el = $(el).parent();
      _el[0].id = `_${_el.parents("tr[data-drive]").data("drive")}__${_el.parents("td[data-type]").data("type")}__${email.replace(new RegExp("@", "gi"), "_")}`;
      _el.prev().find(".member_toggle").removeClass("d-none").addClass("d-inline-flex");
    });
  };

  var _show = (email, targets) => _get(email)
    .then(members => _display(email, members, targets))
    .catch(e => ಠ_ಠ.Flags.error("Group Load Failure", e ? e : "No Inner Error"))
    .then(ಠ_ಠ.Display.busy({
      target: targets.parents("td"),
      class: "loader-small w-100 h-0",
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
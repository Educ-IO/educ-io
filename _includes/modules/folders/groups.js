Groups = (ಠ_ಠ, drives) => {
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
        "class": `mt-1 ml-0 collapse${members.length < 5 ? " show" : ""}`,
        "data-members": email
      }).insertAfter(targets)
    });
    _show.each((i, el) => {
      
      var _el = $(el).parent(),
          _type = _el.parents("td[data-type]").data("type"),
          _drive = _el.parents("tr[data-drive]").data("drive"),
          _teamDrive = drives.drive(_drive);
      
      /* <!-- Add All members to search / indexing table --> */
      _teamDrive[`$$${_type}`] = _.union(_teamDrive[`$$${_type}`], 
        _.reduce(members, (memo, member) => (memo.push(member.email), memo), []));
      
      _el[0].id = `_${_drive}__${_el.parents("td[data-type]").data("type")}__${email.replace(new RegExp("@", "gi"), "_")}`;
      _el.prev().find(".member_toggle").removeClass("d-none").addClass("d-inline-flex");
      
      /* <!-- Update Team Drive --> */
      var _group = _.find(_teamDrive[_type], value => value.email == email);
      if (_group) _group.members = members;
      drives.update(_teamDrive);
      
    });
  };

  var _show = (email, targets) => _get(email)
    .then(members => _display(email, members, targets))
    .catch(e => ಠ_ಠ.Flags.error("Group Load Failure", e ? e : "No Inner Error"))
    .then(ಠ_ಠ.Display.busy({
      target: targets,
      class: "loader-small ml-1 pr-1",
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
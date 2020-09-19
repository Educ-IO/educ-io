Resources = function(loaded) {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Resources)) return new this.Resources().initialise(this, loaded);

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {loaded: false}, /* <!-- State --> */
    ಱ = {}, /* <!-- Persistant --> */
    FN = {}; /* <!-- Functions --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Constants --> */
  const REGEXES = {
          PARENT : /parent\s*:\s*([a-zA-Z]+[\s\S]*)/i,
          BUNDLE : /bundle\s*:\s*([a-zA-Z]+[\s\S]*)\|~\|(\d+)\|~\|(\d+)/i,
        },
        CATEGORY = {
          ROOM : "CONFERENCE_ROOM",
        },
        TESTS = {
          PARENT : value => REGEXES.PARENT.test(value),
          BUNDLE : value => REGEXES.BUNDLE.test(value)
        },
        EXTRACTS = {
          PARENT : value => value ? (match => match ? match[1] : match)(REGEXES.PARENT.exec(value)) : value,
          BUNDLE : value => value ? (match => match ? {
            id : value,
            name : match[1],
            sequence : match.length >= 3 ? parseInt(match[2], 10) : null,
            quantity : match.length >= 4 ? parseInt(match[3], 10) : null,
          } : match)(REGEXES.BUNDLE.exec(value)) : value
        },
        FORMATS = {
          PARENT : value => `PARENT:${value}`,
          BUNDLE : (name, sequence, quantity) => `BUNDLE:${name}${sequence ? `|~|${sequence}` : ""}${quantity ? `|~|${quantity}`: ""}`
        },
        FEATURE = value => value.feature.name.trim();
  /* <!-- Internal Constants --> */

  /* <!-- Map Functions --> */
  FN.map = {
  
    resource: value => ({
        id: value.resourceId,
        title: value.generatedResourceName,
        name: value.resourceName,
        email: value.resourceEmail,
        type: value.resourceType,
        category: value.resourceCategory,
        icon: value.resourceType ? FN.populate.icon(value.resourceType.toUpperCase().trim()) : false,
        location: `${value.buildingId ? value.buildingId : ""}${value.buildingId && value.floorName ? "\\" : ""}${value.floorName ? `Floor ${value.floorName}` : ""}${(value.buildingId || value.floorName) && value.floorSection ? "\\" : ""}${value.floorSection ? value.floorSection : ""}`,
        description: value.resourceDescription,
        details: value.userVisibleDescription,
        bundles: _.chain(value.featureInstances)
                      .map(FEATURE)
                      .filter(TESTS.BUNDLE)
                      .map(EXTRACTS.BUNDLE)
                      .value(),
        parents: _.chain(value.featureInstances)
                      .map(FEATURE)
                      .filter(TESTS.PARENT)
                      .map(EXTRACTS.PARENT)
                      .value(),
        features: _.chain(value.featureInstances)
                      .map(FEATURE)
                      .reject(TESTS.BUNDLE)
                      .reject(TESTS.PARENT)
                      .value(),
      }),
    
    feature: value => ({
        name: value.name,
      }),
    
  };
  /* <!-- Map Functions --> */
  
  /* <!-- Populate Functions --> */
  FN.populate = {
    
    db : (name, schema, data, map) => {
      if (ರ‿ರ[name]) ಱ.db.removeCollection(name);
      ರ‿ರ[name] = ಱ.db.addCollection(name, schema);
      ರ‿ರ[name].clear({
        removeIndices: false
      });
      ರ‿ರ[name].insert(_.map(data, map));
      ಠ_ಠ.Flags.log(`Loaded ${name.toUpperCase()}:`, ರ‿ರ[name].data);
    },
    
    icon : type => type == "COMPUTER" ? "computer" :
                    type == "CAMERA" ? "camera" :
                    type == "PHOTO CAMERA" ? "photo_camera" :
                    type == "VIDEO CAMERA" ? "videocam" :
                    type == "LENS" ? "lens" :
                    type == "MICROPHONE" ? "mic" : 
                    type == "MICROPHONE BOOM" ? "build" : 
                    type == "HEADPHONE" ? "hearing" : 
                    type == "BATTERY" ? "battery_charging_full" :
                    type == "CASE" ? "work" :
                    type == "RIG" ? "straighten" :
                    type == "TRIPOD" ? "device_hub" :
                    type == "TRIPOD HEAD" ? "device_hub" :
                    type == "AUDIO RECORDER" ? "audiotrack" : "device_unknown",
    
    resources : data => FN.populate.db("resources", {
        unique: ["id", "email"],
        indices: ["id", "title", "name", "email", "type", "category", "description", "details", "features"]
      }, data, FN.map.resource),
    
    features : data => FN.populate.db("features", {
        indices: ["name"]
      }, data, FN.map.feature),
    
  };
  /* <!-- Populate Functions --> */

  /* <!-- Find Functions --> */
  FN.find = {
    
    bundles: search => {
      var ret = ರ‿ರ.features.chain();
      if (search) ret = ret.find({name: {"$regex": [RegExp.escape(search), "i"]}});
      return _.chain(ret.sort(FN.sort).data())
                    .pluck("name")
                    .filter(TESTS.BUNDLE)
                    .map(EXTRACTS.BUNDLE)
                    .pluck("name")
                    .uniq()
                    .value();
    },
      
    resources: search => {
      var ret = ರ‿ರ.resources.chain();
      if (search) ret = ret.find({"$or": [
        {title: {"$regex": [RegExp.escape(search), "i"]}},
        {features: {"$regex": [RegExp.escape(search), "i"]}},
        {parents: {"$regex": [RegExp.escape(search), "i"]}}
      ]});
      return ret.sort(FN.sort).data();
    },
    
  };
  /* <!-- Find Functions --> */
  
  /* <!-- Get Functions --> */
  FN.get = {
    
    children: parent => ರ‿ರ.resources.chain()
      .find({parents: {"$contains": parent}})
      .sort(FN.sort)
      .data(),
    
    resource: identifier => ರ‿ರ.resources.findOne({"$or": [
      {id: {"$eq": identifier}},
      {email: {"$eq": identifier}}
    ]}),
    
    parents: () => _.chain(ರ‿ರ.features.chain().data())
                      .pluck("name")
                      .filter(TESTS.PARENT)
                      .map(value => ({id: value, name: EXTRACTS.PARENT(value)}))
                      .value(),

    bundles: () => _.chain(ರ‿ರ.features.chain().data())
                      .pluck("name")
                      .filter(TESTS.BUNDLE)
                      .map(EXTRACTS.BUNDLE)
                      .value(),
    
    features: () => _.chain(ರ‿ರ.features.chain().data())
                      .pluck("name")
                      .reject(TESTS.BUNDLE)
                      .reject(TESTS.PARENT)
                      .value(),
    
  };
  /* <!-- Get Functions --> */
  
  /* <!-- Other Functions --> */
  FN.parse = data => ({
      resourceId: data.ID.Value,
      resourceName: data.Name.Value,
      resourceCategory: "OTHER",
      resourceDescription: data.Description ? data.Description.Value : "",
      resourceType: data.Type ? data.Type.Value : "",
      userVisibleDescription: data["User Description"] ? data["User Description"].Value : "",
      featureInstances: _.map((data.Features ? _.isArray(data.Features.Values) ? data.Features.Values : [data.Features.Values] : [])
        .concat(data.Parents ? _.isArray(data.Parents.Values) ? data.Parents.Values : [data.Parents.Values] : [])
        .concat(data.Bundles ? _.isArray(data.Bundles.Values) ? data.Bundles.Values : [data.Bundles.Values] : []), value => ({
          feature: {
            name: value,
          },
        })),
    });
  /* <!-- Other Functions --> */
  
  /* <!-- Load Functions --> */
  FN.load = (loaded, context) => Promise.all([
        ಠ_ಠ.Google.resources.calendars.list()
          .catch(e => e && e.status === 404 ? ಠ_ಠ.Flags.log("No Resource Calendars").negative() : false),
        ಠ_ಠ.Google.resources.features.list()
          .catch(e => e && e.status === 404 ? ಠ_ಠ.Flags.log("No Resource Features").negative() : false),
      ])
      .then(values => {

        /* <!-- Resources --> */
        FN.populate.resources(_.reject(values[0] || [], value => value.resourceCategory == CATEGORY.ROOM));

        /* <!-- Features --> */
        FN.populate.features(values[1] || []);

        /* <!-- Mark as Loaded --> */
        ರ‿ರ.loaded = true;
        if (loaded && _.isFunction(loaded)) loaded();
        return context;

      });
  /* <!-- Load Functions --> */
  
  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container, loaded) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;
      
      /* <!-- Create DB Reference --> */
      ಱ.db = new loki("resources.db");
      
      /* <!-- Create Resource String Sorter --> */
      FN.sort = ಠ_ಠ.Strings().sort("name");
      
      /* <!-- Start the loading process --> */
      ಱ.loaded = FN.load(loaded, this);
      
      /* <!-- Return for Chaining --> */
      return this;

    },

    loaded: () => ರ‿ರ.loaded,
    
    safe: () => ಱ.loaded,
    
    extract : {
      parent : EXTRACTS.PARENT,
      bundle : EXTRACTS.BUNDLE,
    },
    
    format : {
      parent : FORMATS.PARENT,
      bundle : FORMATS.BUNDLE,
    },
    
    find: {
      
      bundles: FN.find.bundles,
      
      resources: FN.find.resources,
      
    },
    
    children: FN.get.children,
    
    get: FN.get.resource,
    
    parents: FN.get.parents,

    bundles: FN.get.bundles,
    
    features: FN.get.features,
    
    add: {
    
      resource: resource => ರ‿ರ.resources.insert(FN.map.resource(resource)),
      
      feature: name => ರ‿ರ.features.insert({name: name}),
      
    },
    
    update: {
      
      resource: resource => {
        var _existing = ರ‿ರ.resources.findOne({email: {"$eq": resource.resourceEmail}}),
            _new = FN.map.resource(resource);
        _.each(_new, (value, key) => _existing[key] = value);
        ರ‿ರ.resources.update(_existing);
      },
      
    },
    
    remove: {
    
      resource: id => ರ‿ರ.resources.remove(ರ‿ರ.resources.findOne({id: {"$eq": id}})),
      
      feature: value => ರ‿ರ.features.remove(ರ‿ರ.features.findOne({name: {"$eq": value}})),
      
    },
    
    parse: FN.parse,
    
    reload: FN.load
    
  };
  /* <!-- External Visibility --> */

};
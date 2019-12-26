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
        },
        CATEGORY = {
          ROOM : "CONFERENCE_ROOM",
        },
        FEATURE = value => value.feature.name.trim(),
        PARENT = value => REGEXES.PARENT.test(value),
        EXTRACT = value => value ? (match => match ? match[1] : match)(REGEXES.PARENT.exec(value)) : value,
        FORMAT = value => `PARENT:${value}`;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Functions --> */
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
        parent: EXTRACT(_.chain(value.featureInstances)
                      .map(FEATURE)
                      .find(PARENT)
                      .value()),
        parents: _.chain(value.featureInstances)
                      .map(FEATURE)
                      .filter(PARENT)
                      .map(EXTRACT)
                      .value(),
        features: _.chain(value.featureInstances)
                      .map(FEATURE)
                      .reject(PARENT)
                      .value(),
      }),
    
    feature: value => ({
        name: value.name,
      }),
    
  };
  
  FN.populate = {
    
    db : (name, schema, data, map) => {
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
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container, loaded) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;
      
      /* <!-- Create DB Reference --> */
      ಱ.db = new loki("resources.db");
      
      ಱ.loaded = Promise.all([
        ಠ_ಠ.Google.resources.calendars.list()
          .catch(e => e && e.status == 404 ? ಠ_ಠ.Flags.log("No Resource Calendars").negative() : false),
        ಠ_ಠ.Google.resources.features.list()
          .catch(e => e && e.status == 404 ? ಠ_ಠ.Flags.log("No Resource Features").negative() : false),
      ])
        .then(values => {
       
          /* <!-- Resources --> */
          FN.populate.resources(_.reject(values[0] || [], value => value.resourceCategory == CATEGORY.ROOM));
        
          /* <!-- Features --> */
          FN.populate.features(values[1] || []);
        
          /* <!-- Mark as Loaded --> */
          ರ‿ರ.loaded = true;
          if (loaded && _.isFunction(loaded)) loaded();
          return this;
        
        });
      
      FN.sort = ಠ_ಠ.Strings().sort("name");

      /* <!-- Return for Chaining --> */
      return this;

    },

    loaded: () => ರ‿ರ.loaded,
    
    safe: () => ಱ.loaded,
    
    extract: EXTRACT,
    
    format: FORMAT,
    
    find: search => {
      var ret = ರ‿ರ.resources.chain();
      if (search) ret = ret.find({title: {"$regex": [RegExp.escape(search), "i"]}});
      return ret.sort(FN.sort).data();
    },
    
    children: parent => ರ‿ರ.resources.chain()
      .find({parents: {"$contains": parent}})
      .sort(FN.sort)
      .data(),
    
    get: email => ರ‿ರ.resources.findOne({email: {"$eq": email}}),
    
    parents: () => _.chain(ರ‿ರ.features.chain().data())
                      .pluck("name")
                      .filter(PARENT)
                      .map(value => ({id: value, name: EXTRACT(value)}))
                      .value(),

    features: () => _.chain(ರ‿ರ.features.chain().data())
                      .pluck("name")
                      .reject(PARENT)
                      .value(),
    
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
    
  };
  /* <!-- External Visibility --> */

};
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
        EXTRACT = value => value ? (match => match ? match[1] : match)(REGEXES.PARENT.exec(value)) : value;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Functions --> */
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
                    type == "MICROPHONE" ? "mic" : "device_unknown",
    
    resources : data => FN.populate.db("resources", {
        unique: ["id", "email"],
        indices: ["id", "title", "name", "email", "type", "category", "description", "details", "features"]
      }, data, value => ({
        id: value.resourceId,
        title: value.generatedResourceName,
        name: value.resourceName,
        email: value.resourceEmail,
        type: value.resourceType,
        category: value.resourceCategory,
        icon: value.resourceType ? FN.populate.icon(value.resourceType.toUpperCase().trim()) : false,
        description: value.resourceDescription,
        details: value.userVisibleDescription,
        parent: EXTRACT(_.chain(value.featureInstances)
                      .map(FEATURE)
                      .find(PARENT)
                      .value()),
        features: _.chain(value.featureInstances)
                      .map(FEATURE)
                      .reject(PARENT)
                      .value(),
      })),
    
    features : data => FN.populate.db("features", {
        indices: ["name"]
      }, data, value => ({
        name: value.name,
      })),
    
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
      
      ಱ.loaded = Promise.all([ಠ_ಠ.Google.resources.calendars.list(), ಠ_ಠ.Google.resources.features.list()])
        .then(values => {
       
          /* <!-- Resources --> */
          FN.populate.resources(_.reject(values[0], value => value.resourceCategory == CATEGORY.ROOM));
        
          /* <!-- Features --> */
          FN.populate.features(values[1]);
        
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
    
    find: search => {
      var ret = ರ‿ರ.resources.chain();
      if (search) ret = ret.find({title: {"$regex": [RegExp.escape(search), "i"]}});
      return ret.sort(FN.sort).data();
    },
    
    children: parent => ರ‿ರ.resources.chain()
      .find({parent: {"$regex": [RegExp.escape(parent), "i"]}})
      .sort(FN.sort)
      .data(),
    
    get: email => ರ‿ರ.resources.findOne({email: {"$eq": email}})
    
  };
  /* <!-- External Visibility --> */

};
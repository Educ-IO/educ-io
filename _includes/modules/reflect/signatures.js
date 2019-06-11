Signatures = (ಠ_ಠ, stringify, replacer, elevate) => {
  "use strict";
  /* <!-- MODULE: Provides an signature management and verification of a form/s reports --> */
  /* <!-- PARAMETERS: Receives the global app context, a stringify function and replacer function for converting objects to strings --> */
  /* <!-- REQUIRES: Global Scope: Underscore | App Scope: Flags, Display, Google --> */

  /* <!-- Internal Constants --> */
  const FN = {},
    MARKER = "=== SIGNED ===",
    ALGORITHM = {
      name: "ECDSA",
      hash: {
        name: "SHA-256"
      },
    },
    KEY = {
      name: "ECDSA",
      namedCurve: "P-256",
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal State Variable --> */
  /* <!-- Internal State Variable --> */

  /* <!-- Internal Functions --> */

  /* <-- Helper Functions --> */
  FN.helper = {

    supported: () => window.crypto &&
      window.crypto.getRandomValues &&
      window.crypto.subtle &&
      window.crypto.subtle.generateKey &&
      window.crypto.subtle.sign &&
      window.crypto.subtle.verify &&
      window.TextEncoder &&
      window.TextDecoder,

    crypto: window.crypto.subtle,

    encode: value => ಠ_ಠ.Strings().hex.encode(value),

    decode: value => ಠ_ಠ.Strings().hex.decode(value),

  };
  /* <-- Helper Functions --> */


  /* <-- Data Functions --> */
  FN.data = {

    /* <!-- Raw Data for Signing/Verifying [data property to avoid signing with file name] --> */
    raw: data => new TextEncoder().encode(
      _.tap(stringify(data, replacer).trim(),
        raw => ಠ_ಠ.Flags.log("RAW DATA for Signing/Verifying:", raw))),

  };
  /* <-- Data Functions --> */


  /* <!-- Signature Functions --> */
  FN.signature = {

    parse: (file, comment, valid) => ({
      template: "signature",
      valid: valid,
      who: comment.author.me ? true : comment.author.displayName,
      email: comment.author.emailAddress,
      when: ಠ_ಠ.Dates.parse(comment.modifiedTime).fromNow(),
      link: `${ಠ_ಠ.Flags.full()}${ಠ_ಠ.Flags.dir()}/#google,load.${file.id}`
    }),

    list: (file, data) => ಠ_ಠ.Google.files.comments(file).list()
      .then(comments => _.filter(comments, comment => {
        var _signature, _set = signature => {
          comment.signature = JSON.parse(signature[0]);
          return true;
        };
        return comment.content.indexOf(MARKER) === 0 &&
          (_signature = comment.content.match(/{.+}/gi)) ?
          _set(_signature) : false;
      }))
      .then(comments => Promise.all(
        _.map(comments, comment => FN.signature.verify(comment.signature, data)
          .then(valid => FN.signature.parse(file, comment, valid)))))
      .then(signatures => _.tap(signatures, signatures => ಠ_ಠ.Flags.log(`File: ${file.id}`, signatures)))
      .catch(e => ಠ_ಠ.Flags.error("Loading Comments", e).negative()),

    verify: (signature, data) => FN.helper.crypto.importKey("raw",
        FN.helper.encode(signature.key), KEY, false, ["verify"])
      .then(key => FN.helper.crypto.verify(ALGORITHM, key,
        FN.helper.encode(signature.signature), FN.data.raw(data)))
      .then(result => _.tap(result,
        result => ಠ_ಠ.Flags.log(`Verification Result: ${result}`, signature)))
      .catch(e => ಠ_ಠ.Flags.error("Verifying Error", e).negative()),

    remove: file => ಠ_ಠ.Google.files.comments(file).list()
      .then(comments => _.filter(comments, comment =>
        comment.content.indexOf(MARKER) === 0 && comment.author && comment.author.me === true))
      .then(comments => comments.length > 0 ? ಠ_ಠ.Display.confirm({
        id: "confirm_Remove",
        message: ಠ_ಠ.Display.doc.get({
          name: "REMOVE_SIGNATURES",
          content: comments.length,
        }),
        action: "Remove",
        close: "Cancel"
      }).then(result => result === true ? Promise.all(_.map(comments, comment =>
          elevate(() => ಠ_ಠ.Google.files.comments(file).delete(comment.id)))) :
        false) : false)
      .catch(e => ಠ_ಠ.Flags.error("Loading Comments", e).negative()),

  };
  /* <!-- Signature Functions --> */


  /* <!-- Sign Functions --> */
  FN.sign = {

    report: (file, data) => FN.helper.supported() ? FN.helper.crypto.generateKey(
        KEY, true, ["sign", "verify"]
      ).then(key => FN.helper.crypto.sign(ALGORITHM, key.privateKey, FN.data.raw(data))
        .then(signature => {
          return FN.helper.crypto.exportKey("raw", key.publicKey)
            .then(value => _.tap({
              signature: FN.helper.decode(signature),
              key: FN.helper.decode(value)
            }, signature => ಠ_ಠ.Flags.log("Signature:", signature)));
        }))
      .then(signature => `${MARKER}\n\n${JSON.stringify(signature)}`)
      .then(signature => ಠ_ಠ.Google.files.comments(file).list()
        .then(comments => _.filter(comments, comment =>
          comment.content.indexOf(MARKER) === 0 && comment.author && comment.author.me === true))
        .then(comments => elevate(comments.length > 0 ?
          () => ಠ_ಠ.Google.files.comments(file).update(comments[0].id, signature) :
          () => ಠ_ಠ.Google.files.comments(file).create(signature, {
            r: "head",
            a: [{
              rect: {
                mw: 1,
                mh: 1,
              }
            }],
          })))
      )
      .catch(e => ಠ_ಠ.Flags.error("Signing Error", e))
      .then(ಠ_ಠ.Main.busy("Signing Report")) : false,

  };
  /* <!-- Sign Functions --> */


  /* <!-- External Visibility --> */
  return {

    sign: FN.sign,

    list: FN.signature.list,

    remove: FN.signature.remove,

    verify: FN.signature.verify,

  };
  /* <!-- External Visibility --> */
};
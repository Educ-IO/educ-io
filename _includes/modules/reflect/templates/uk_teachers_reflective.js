__Σ__UK_Teachers_Reflective =  {
	/* <!-- FORM: UK Teachers Reflection --> */
  name : "Reflective",
  title : "Teachers' Reflective Report",
  type : "Report",
  groups : {
    basic : {
      template : "group",
      name : "To Start",
      fields : {
        name : {
          template: "field_textual",
          title: "About / Subject",
          field: "Name",
          help: "Who (or what) is this report about?",
          icon: "face",
          button: "Me!",
          action: "me",
          large: true,
          required: true,
          __meta: {
            index: true,
            analyse: {
              type: "row"
            }
          },
        },
        span : {
          template: "field_span",
          title: "Assessment Period",
          field: "Span",
          icon: "query_builder",
          help: "For which assessment period is this report for?",
          required: true,
          type: "Custom",
          options: [
            {value: "Custom", name: "Custom"},
            {span: "w", value: "Weekly", name: "Weekly"},
            {span: "M", value: "Monthly", name: "Monthly"},
            {span: "y", value: "Yearly", name: "Yearly"}
          ],
          __meta: {
            index: true,
            transform: "{% raw %}{{Start}} -> {{End}}{{#if Type}} ({{Type}}){{/if}}{% endraw %}",
            analyse: {
              type: "column"
            }
          },
        },
        absences : {
          template: "field_numeric",
          title: "Any absences over this period?",
          field: "Absences",
          icon: "local_hospital",
          __help__: "If you have been ill, or have taken __agreed absence__, please enter the number of days here.",
          increment: 0.5,
          min: 0,
          max: 5,
          suffix: "day/s absent this week",
          details: "Further details, if applicable",
          large: true
        },
        mentor : {
          template: "field_textual",
          title: "Mentor",
          field: "Mentor",
          icon: "school",
          help: "",
          required: true,
          pattern: /(.*\s|^)([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)(\s.*|$)/gi,
          __meta: {
            signatory: true,
          }
        },
      }
    },
    progress : {
      template: "group",
      name: "Evaluate your Progress",
      __help__: "During the period covered by this report, you should have targeted a number of sub-standards, focussing upon them in your teaching and approach. Please gather material to support this, and link it here using the 'Evidence' buttons. You can also (optionally) supply a few sentences to describe the evidence and give it some further context.\n\nRemember that this evidence will be __shared with those people__ you choose to share this report with, so please remember to __respect data protection__ conventions and student __privacy__.",
      fields : {
        ts_evidence : {
          template : "field_scale",
          title : "Evidence against the Teachers' Standards",
          field : "TS Evidence",
          scale : "uk_teachers_standards",
          type : "Evidence",
          list_template : "field_items",
          list_field : "Evidence",
          items_details : "Further details about how this was met",
          options: [
            {name : "From Google Drive", value: "drive", class: "g-picker"},
            {name : "From File", value: "file", class: "g-file"},
            {name : "From Web", value: "web", class: "web"},
            {name : "Offline / Paper", value: "paper", class: "paper", divider: true},
          ],
          __help__ : "__Click__ on the switches of the _Teachers' Standards_ you have targeted this week. You should __supply evidence__ as well, which will help build and populate your evidence tracker.",
        },
        further_reflections : {
          template: "field_textual",
          title: "Any further reflections on this period",
          field: "Further Reflections",
          rows: 5,
          wide: true,
          button: "Load",
          action: "load-g-doc",
          help: "Please record further thoughts about your progress here.",
        },
        overall_assessment : {
          template: "field_radio",
          title: "Overall Assessment",
          field: "Overall Assessment",
          icon: "gavel",
          __help__: "Having discussed and agreed this, please assess your progress over this period.",
          large: true,
          options: [
            {
              class: "btn-primary",
              value: "A: Excellent",
              icon: ""
            },
            {
              class: "btn-info",
              value: "B: Secure",
              icon: ""
            },
            {
              class: "btn-success",
              value: "C: Developing (Standards Met)",
              icon: ""
            },
            {
              class: "btn-warning",
              value: "D: Emerging",
              icon: ""
            },
            {
              class: "btn-danger",
              value: "E: Weak",
              icon: ""
            },
            {
              class: "btn-dark",
              value: "Not enough evidence seen / Opportunity to assess",
              icon: "visibility_off"
            }
          ]
        },
      }
    },
    previous : {
      template : "group",
      name : "Looking Back",
      __help__ : "Please review your previous targets, either by filling them in manually - or loading them from a previous report.\n\nOnce you have added a target, you can respond with details of how it was met. If you would like to submit evidence to support your responses (e.g. Lesson Observations etc.) then use the evidence drop-down to select/upload your evidence.",
      fields : {
        past_targets : {
          template : "field_responses",
          title : "Review Previous Targets",
          field : "Previous Targets",
          type : "Response",
          icon : "grade",
          list_field : "Responses",
          list_extend : {
            prefix : "Evidence",
            options : [
              {name : "From Google Drive", value : "drive", class : "g-picker"},
              {name : "From File", value : "file", class : "g-file"},
              {name : "From Web", value : "web", class : "web"},
              {name : "Offline / Paper", value : "paper", class : "paper", divider : true}
            ]
          },
          rows : 1,
          required : true,
          min : 0,
          max : 5,
          add_template : "response_item",
          add_prefix : "Evidence",
          add_options : [
            {name : "From Google Drive", value : "drive", class : "g-picker"},
            {name : "From File", value : "file", class : "g-file"},
            {name : "From Web", value : "web", class : "web"},
            {name : "Offline / Paper", value : "paper", class : "paper", divider : true}
          ],
          button : {
            icon : "folder_open",
            action : "load",
            field : "scale_targets",
            details : "",
            item : "",
            tooltip : "Load from Previous Report"
          },
          __valid__ : "Everything looks __good__!",
          __invalid__ : "Please enter between __0__ and __5 responses__ before completion.",
          __help__ : "",
          __meta: {
            references: "future_targets",
          }
        }
      }
    },
    forward : {
      template: "group",
      name: "Looking Forward",
      __help__: "Please identify a number of targets that you feel would be appropriate for the period ahead, thinking about the types of evidence you might gather to show you have meet them. You will be asked in the next report to identify those you have met, and supply relevant supporting evidence.",
      fields : {
        future_targets : {
          template: "field_complex",
          title: "Targets for the upcoming assessment period",
          field: "Future Targets",
          type: "Target",
          prefix: "Evidence Type",
          icon: "gps_fixed",
          list_field: "Targets",
          rows : 3,
          required: true,
          __help__: "Enter details of the targets you are setting yourself, together with the type of evidence that will confirm you have met the target.  \n\nThen save them to the list below using the __green__ add button.",
          options: [
            "Lesson Plan",
            "Lesson Observation",
            "Audio / Visual Recording",
            "Feedback (from Colleagues / Students)",
            "Records (e.g. Google Sheet Markbook)",
            "Other"
          ]
        },
      }
    }
  }
};
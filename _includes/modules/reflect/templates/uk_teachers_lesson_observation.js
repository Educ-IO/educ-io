__Σ__UK_Teachers_Lesson_Observation =  {
	/* <!-- FORM: UK Teachers Lesson Observation --> */
  name : "Observation",
  title : "Lesson Observation",
  type : "Report",
  groups : {
    
    about : {
      template : "group",
      name : "About",
      fields : {
        name: {
          template: "field_textual",
          title: "Your Name",
          field: "Name",
          help: "Who undertook this observation?",
          icon: "face",
          default: "me",
          large: true,
          required: true,
          readonly: true,
        },
        concerning: {
          template: "field_textual",
          field: "Concerning",
          __help__: "Name / Email address of the person being observed",
          icon: "account_box",
          large: true,
          required: true,
          pattern: /(.*\s|^)([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)(\s.*|$)/gi,
          __meta: {
            analyse: {
              type: "row"
            },
            index: true,
            signatory: true,
          },
        },
      }
    },
    
    details: {
      template: "group",
      name: "Details",
      __help__: "Remember to check you have been supplied with a relevant __seating plan__, __group details__, information about relevant __special educational needs__ and/or __pupil premium__ recipients.",
      fields: {
        date: {
          template: "field_textual",
          title: "Date",
          field: "Date",
          class: "dt-picker",
          default: "now",
          icon: "date_range",
          __help__: "__Date__ of the Lesson being Observed",
          required: true,
          __meta: {
            index: true,
            analyse: {
              type: "column"
            }
          },
        },
        time: {
          template: "field_span",
          title: "Time",
          field: "Time",
          default: "now",
          time: true,
          icon: "query_builder",
          __help__: "__Time__ of the Lesson being Observed",
        },
        group: {
          template: "field_textual",
          field: "Group",
          icon: "group",
          __help__: "Which __group__ is this observation for?",
        },
        subject: {
          template: "field_textual",
          field: "Subject",
          icon: "subject",
          __help__: "What __subject__ is this observation for?",
        },
      }
    },
    
    standards : {
      template: "group",
      name: "Areas of Strength / Weakness",
      __help__: "You can list areas of particular __strength__ or in __need of improvement__ below. These should be recorded against the relevant Teachers' Standard / Sub-Standard",
      fields : {
        ts_evidence : {
          template : "field_scale",
          title : "Standards Observed",
          field : "TS Standards",
          scale : "uk_teachers_standards",
          prefix: "Observation",
          type : "Observation",
          list_template : "field_additions",
          list_field : "Observations",
          items_details : "Further details",
          rows : 2,
          options: [
            "Area of Strength",
            "Improvement Required",
          ],
          __help__ : "__Click__ on the switches of the _Teachers' Standards_ to record your observations against them.",
        },
      },
    },
    
    targets : {
      template: "group",
      name: "Targets",
      fields : {
        targets : {
          template: "field_complex",
          title: "Targets",
          field: "Targets",
          type: "Target",
          rows: 3,
          prefix: "Standard",
          icon: "gps_fixed",
          list_field: "Targets",
          __help__: "Please enter __appropriate targets__, and (optionally) the __teachers' standard__ to which they apply (TS 1-7 & 8.3 only).\n\nThen save them to the list below using the __green__ add button.",
          options: [
            "TS1 - Expectations",
            "TS2 - Outcomes",
            "TS3 - Subject Knowledge",
            "TS4 - Planning",
            "TS5 - Differentiation",
            "TS6 - Assessment",
            "TS7 - Behaviour Management",
            "TS8.3 - Deploy support staff effectively"
          ]
        },
      }
    },
    
    judgement : {
      template: "group",
      name: "Overall Judgement",
      __help__: "",
      fields : {
        overall_assessment : {
          template: "field_radio",
          title: "Overall Grading",
          field: "Grade",
          icon: "gavel",
          __help__: "",
          required: true,
          large: true,
          options: [
            {
              class: "btn-primary",
              value: "1: Outstanding",
              numeric: 4,
              icon: ""
            },
            {
              class: "btn-success",
              value: "2: Good",
              numeric: 3,
              icon: ""
            },
            {
              class: "btn-warning",
              value: "3: Requires Improvement",
              numeric: 2,
              icon: ""
            },
            {
              class: "btn-danger",
              value: "4: Inadequate",
              numeric: 1,
              icon: ""
            },
            {
              class: "btn-dark",
              value: "No grade given/required",
              icon: "visibility_off"
            }
          ],
          __meta: {
            index: true,
          },
        },
        comments : {
          template: "field_textual",
          title: "Further Comments",
          field: "Comments",
          rows: 5,
          wide: true,
          button: "Load",
          action: "load-g-doc",
          __help__: "Please record any __further thoughts__ about the lesson, or __recommendations__ for the future, here.",
        },
      }
    }
    
  }
};
__Σ__Progress = {
  /* <!-- FORM: Progress --> */
  name: "Progress",
  title: "Progress Report",
  type: "Report",
  groups: {
    about: {
      template: "group",
      name: "About",
      fields: {
        name: {
          template: "field_textual",
          title: "Your Name",
          field: "Name",
          help: "Who completed this progress report?",
          icon: "face",
          default: "me",
          large: true,
          required: true,
          readonly: true,
        },
        concerning: {
          template: "field_textual",
          field: "Concerning",
          __help__: "Name / Email address of the __target__ of this progress report",
          icon: "account_box",
          large: true,
          required: true,
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
      fields: {
        span: {
          template: "field_span",
          title: "Volunteering Period",
          field: "Span",
          icon: "date_range",
          help: "Over which period are you assessing progress?",
          required: true,
          type: "Custom",
          options: [{
              value: "Custom",
              name: "Custom"
            },
            {
              span: "w",
              value: "Weekly",
              name: "Weekly"
            },
            {
              span: "M",
              value: "Monthly",
              name: "Monthly"
            },
            {
              span: "y",
              value: "Yearly",
              name: "Yearly"
            }
          ],
          __meta: {
            index: true,
            analyse: {
              type: "column"
            }
          },
        },
        group: {
          template: "field_textual",
          field: "Group",
          icon: "group",
          __help__: "Which __group__ is this progress report for?",
        },
        subject: {
          template: "field_textual",
          field: "Subject",
          icon: "subject",
          __help__: "What __subject__ is this progress report for?",
        },
      }
    },
    assessment: {
      template: "group",
      name: "Assessment",
      fields: {
        attainment: {
          template: "field_range",
          field: "Attainment",
          icon: "work_outline",
          suffix: "%",
          details: true,
          __help__: "Please indicate __your assessment__ of the attainment level.",
        },
        progress: {
          template: "field_range",
          field: "Progress",
          icon: "trending_up",
          details: true,
          min: 0,
          max: 20,
          step: 0.1,
        },
        ability: {
          template: "field_range",
          field: "Ability",
          min: 0,
          max: 10,
          step: 1,
        },
        effort: {
          template: "field_range",
          field: "Effort",
          icon: "fitness_center",
          details: true,
          min: 0,
          max: 5,
          step: 1,
          range: "E;D;C;B;A;A*",
          details_Title: "Grade",
        },
      }
    },
    conclusion: {
      template: "group",
      name: "Conclusion",
      fields: {
        comments: {
          template: "field_textual",
          title: "Further Comments",
          field: "Comments",
          rows: 3,
          wide: true,
          button: "Load",
          action: "load-g-doc",
          help: "Please record further thoughts about progress made here.",
        },
        overall_assessment: {
          template: "field_radio",
          title: "Overall Assessment",
          field: "Overall Assessment",
          icon: "gavel",
          __help: "How would you rate __overall progress__ during this period.",
          large: true,
          options: [{
              class: "btn-success",
              value: "Excellent",
              icon: "sentiment_very_satisfied"
            },
            {
              class: "btn-info",
              value: "Good",
              icon: "sentiment_satisfied"
            },

            {
              class: "btn-warning",
              value: "Satisfactory",
              icon: "sentiment_dissatisfied"
            },
            {
              class: "btn-danger",
              value: "Poor",
              icon: "sentiment_very_dissatisfied"
            }
          ]
        },
      }
    },
  }
};
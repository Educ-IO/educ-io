__Σ__Volunteering = {
 	/* <!-- FORM: Volunteering --> */
  name : "Volunteering",
  title : "Volunteering Report",
  type : "Report",
  groups : {
    you : {
      template : "group",
      name : "About You",
      fields : {
        name : {
          template: "field_textual",
          title: "Your Name",
          field: "Name",
          help: "Who completed this volunteering period?",
          icon: "face",
          default: "me",
          large: true,
          required: true,
          readonly: true,
          __meta: {
            analyse: {
              type: "row"
            }
          },
        },
        group : {
          template: "field_textual",
          title: "Your group",
          field: "Group",
        },
      }
    },
    volunteering : {
      template : "group",
      name : "Volunteering",
     	fields : {
        span : {
          template: "field_span",
          title: "Volunteering Period",
          field: "Span",
          icon: "date_range",
          __help__: "Over which period did you undertake this volunteering work?",
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
            analyse: {
              type: "column"
            }
          },
        },
        periods : {
          template: "field_durations",
          title: "Hours Undertaken",
          field: "Hours",
          icon_date: "calendar_today",
          icon_number: "alarm_add",
          help: "Please add the hours of volunteering undertaken during this period",
          increment: 0.5,
          min: 0,
          required: true,
          type: "Hours",
          suffix: "hours/s",
          items: "Periods",
          details: "Further details, if applicable",
        },
      }
    },
    evidence : {
      template: "group",
      name: "Evidence",
      __help__: "",
      fields : {
        volunteering_evidence : {
          template : "field_files",
          title : "Evidence",
          field : "Volunteering Evidence",
          icon : "assessment",
          type : "Evidence",
          list_field : "Evidence",
          items_details : "Further details about the evidence you are submitting",
          options: [
            {name : "From Google Drive", value: "drive", class: "g-picker"},
            {name : "From File", value: "file", class: "g-file"},
            {name : "From Web", value: "web", class: "web"},
          ],
          __help__ : "",
        },
        supervisor : {
          template: "field_textual",
          title: "Supervisor",
          field: "Volunteering Supervisor",
          help: "Email address of your supervisor",
          icon: "how_to_reg",
          large: true,
          required: true,
          pattern: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
          __meta: {
            signatory: true,
          }
        },
      }
    },
    details : {
      template: "group",
      name: "Details",
      __help__: "",
      fields : {
        overall_assessment : {
          template: "field_radio",
          title: "Overall Assessment",
          field: "Overall Assessment",
          icon: "gavel",
          help: "How would you rate your overall experience over this period.",
          large: true,
          options: [
            {
              class: "btn-success",
              value: "Wonderful",
              icon: "sentiment_very_satisfied"
            },
            {
              class: "btn-info",
              value: "Ok",
              icon: "sentiment_satisfied"
            },
            
            {
              class: "btn-warning",
              value: "Not great",
              icon: "sentiment_dissatisfied"
            },
            {
              class: "btn-danger",
              value: "Poor",
              icon: "sentiment_very_dissatisfied"
            }
          ]
        },
        further_reflections : {
          template: "field_textual",
          title: "Any further reflections on this period",
          field: "Further Reflections",
          rows: 5,
          wide: true,
          button: "Load",
          action: "load-g-doc",
          help: "Please record further thoughts about your experiences here.",
        },
      }
    },
  }
};
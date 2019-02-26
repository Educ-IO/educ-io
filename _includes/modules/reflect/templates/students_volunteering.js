__Σ__Students_Volunteering = {
 	/* <!-- FORM: Student Volunteering --> */
  name : "Student Volunteering",
  title : "Student Volunteering Report",
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
          analyse: {
            type: "row"
          },
        },
        form_group : {
          template: "field_select",
          title: "Your form group / div",
          field: "Form Group",
          default: "Please select ...",
          options: ["Please select ...", "6B1","6B2", "6B3", "6D1", "6D2", "6D3", "6N1", 
                    "6N2", "6N3", "6R1", "6R2", "6R3", "6S1", "6S2", "6S3", "6V1", "6V2", "6V3"], 
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
          pattern: /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi
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
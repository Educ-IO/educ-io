__Σ__UK_Teachers_Grading =  {
	/* <!-- FORM: UK Teachers Grading --> */
  name : "Grading",
  title : "Teachers Grading",
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
          help: "Who are you?",
          icon: "face",
          default: "me",
          large: true,
          required: true,
          readonly: true,
        },
        concerning: {
          template: "field_textual",
          field: "Concerning",
          __help__: "Name / Email address of the person being graded",
          icon: "account_box",
          large: true,
          required: true,
          pattern: /.*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+).*/gi,
          __meta: {
            analyse: {
              type: "row"
            },
            index: true,
            signatory: true,
          },
        },
        date: {
          template: "field_textual",
          title: "Date",
          field: "Date",
          class: "dt-picker",
          default: "now",
          icon: "date_range",
          __help__: "__Date__ when the grading occured",
          required: true,
          __meta: {
            index: true,
            analyse: {
              type: "column"
            }
          },
        },
      }
    },
    
    standards : {
      template: "group",
      name: "Grades",
      __help__: "You can record grade judgements against the relevant Teachers' Standard / Sub-Standard",
      fields : {
        ts_gradings : {
          template : "field_scale",
          title : "Graded Standards",
          field : "TS Graded Standards",
          scale : "uk_teachers_standards",
          list_template : "field_buttons",
          list_field : "Gradings",
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
          ],
          __help__ : "__Click__ on the switches of the _Teachers' Standards_ to record your grade judgements against them.",
        },
      },
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
          required: true,
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
          ],
          __help__ : "Given the __gradings above__, please indicate your overall judgement here.",
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
          __help__: "Please record any __further thoughts__ about the judgements given above.",
        },
      }
    }
    
  }
};
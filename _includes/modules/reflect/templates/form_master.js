__Σ__Form_Master = {
	/* <!-- FORM: Form Master --> */
  name : "Form Master",
  title : "Create a new Reflective Form",
  type : "Master",
  groups : {
    basic : {
      template : "group",
      name : "Basic Details",
      fields : {
        name : {
          template: "field_textual",
          title: "Name",
          field: "Name",
          help: "What will this form be called?",
          required: true
        },
        frequency : {
          template: "field_select",
          title: "Frequency of use",
          field: "Frequency",
          icon: "query_builder",
          help: "How often will this form be used?",
          options: [
            {value: "weekly", name: "Weekly"},
            {value: "fortnightly", name: "Fortnightly (every two weeks)"},
            {value: "monthly", name: "Monthly"},
            {value: "quarterly", name: "Quarterly (four times a year)"},
            {value: "triannually", name: "Triannually (three times a year)"},
            {value: "biannually", name: "Biannually (twice a year)"},
            {value: "yearly", name: "Yearly"},
            {value: "biennially", name: "Biennially (every two years)"},
            {value: "triennially", name: "Triennially (every three years)"},
            {value: "quadrennially", name: "Quadrennially (every four years)"}
          ],
          required: true
        }
      }
    }
  }
};
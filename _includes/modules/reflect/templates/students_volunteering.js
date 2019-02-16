__Σ__Students_Volunteering = markdown => {
	"use strict";
  
	/* <!-- FORM: Student Volunteering --> */
  return {
		name : "Student Volunteering",
		title : "Student Volunteering Report",
    type : "Report",
		groups : {
			basic : {
				template : "group",
				name : "To Start",
				fields : {
					name : {
						template: "field_textual",
						title: "About",
						field: "Name",
						help: markdown("Who completed this volunteering period?"),
						icon: "face",
            default: "me",
						large: true,
						required: true,
            readonly: true,
					},
					span : {
						template: "field_span",
						title: "Volunteering Period",
						field: "Span",
						icon: "date_range",
						help: markdown("Over which period did you undertake this volunteering work?"),
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
						help: markdown("Please add the hours of volunteering undertaken during this period"),
            increment: 0.25,
            min: 0,
						required: true,
						type: "Hours",
            suffix: "hours/s",
            items: "Periods",
            details: "Further details, if applicable",
					},
					absences : {
						template: "field_numeric",
						title: "Total number of hours volunteered over this period?",
						field: "Hours_",
						icon: "query_builder",
						help: markdown("Please total up the number of hours you have volunteered for, during this period."),
						increment: 0.5,
						min: 0,
						max: 30,
						suffix: "hours/s volunteered",
						details: "Further details, if applicable",
						large: true
					},
				}
			},
			details : {
				template: "group",
				name: "Details",
				help: markdown("During the week, you should have targeted between __3__ and __6__ sub-standards, focussing upon them in your teaching and approach. Please gather material to support this, and link it here using the 'Evidence' buttons. Once you have begun teaching, and after having met with your mentor, you should also supply your __agreed__ overall assessment."),
				fields : {
          future_targets : {
						template: "field_complex",
						title: "Targets for the coming week",
						field: "Future Targets",
						type: "Target",
						prefix: "Evidence Type",
						icon: "gps_fixed",
            required: true,
						help: markdown("Enter details of the targets you are setting yourself this week, together with the type of evidence that will confirm you have met the target. Then save them to the list below."),
						options: [
							"Lesson Plan",
							"Lesson Observation",
							"Audio / Visual Recording",
							"Feedback (from Colleagues / Students)",
							"Records (e.g. Google Sheet Markbook)",
							"Other"
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
						help: "Please record further thoughts about your progress here.",
					},
					overall_assessment : {
						template: "field_radio",
						title: "Overall Assessment",
						field: "Overall Assessment",
						icon: "gavel",
						help: markdown("Having discussed and agreed this, please assess your progress over this period."),
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
		}
	};
};
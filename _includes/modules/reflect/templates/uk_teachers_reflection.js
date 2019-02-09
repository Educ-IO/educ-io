__Σ__UK_Teachers_Reflection = markdown => {
	"use strict";
  
	/* <!-- FORM: UK Teachers Reflection --> */
  return {
		name : "Reflective Report",
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
						help: markdown("Who (or what) is this report about?"),
						icon: "face",
						button: "Me!",
						action: "me",
						large: true,
						required: true
					},
					span : {
						template: "field_span",
						title: "Assessment Period",
						field: "Span",
						icon: "query_builder",
						help: markdown("For which assessment period is this report for?"),
						required: true,
						type: "Custom",
						options: [
							{value: "Custom", name: "Custom"},
							{span: "w", value: "Weekly", name: "Weekly"},
							{span: "M", value: "Monthly", name: "Monthly"},
							{span: "y", value: "Yearly", name: "Yearly"}
						],
					},
					absences : {
						template: "field_numeric",
						title: "Any absences over this period?",
						field: "Absences",
						icon: "local_hospital",
						help: markdown("If you have been ill, or have taken __agreed absence__, please enter the number of days here."),
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
						required: true
					},
				}
			},
			progress : {
				template: "group",
				name: "Evaluate your Progress",
				help: markdown("During the week, you should have targeted between __3__ and __6__ sub-standards, focussing upon them in your teaching and approach. Please gather material to support this, and link it here using the 'Evidence' buttons. Once you have begun teaching, and after having met with your mentor, you should also supply your __agreed__ overall assessment."),
				fields : {
					ts_evidence : {
						template : "field_scale",
						title : "Evidence against the Teachers' Standards",
						field : "TS Evidence",
						scale : "uk_teachers_standards",
						type : "Evidence",
            list_field : "Evidence",
						items_details : "Further details about how this was met",
						options: [
							{name : "From Google Drive", value: "drive", class: "g-picker"},
							{name : "From File", value: "file", class: "g-file"},
							{name : "From Web", value: "web", class: "web"},
							{name : "Offline / Paper", value: "paper", class: "paper", divider: true},
						],
						help : markdown("__Click__ on the switches of the _Teachers' Standards_ you have targeted this week. You should __supply evidence__ as well, which will help build and populate your evidence tracker."),
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
			forward : {
				template: "group",
				name: "Looking Forward",
				help: markdown("Please identify between __2__ and __5__ targets that you feel would be appropriate for the week ahead, thinking about the types of evidence you might gather to show you have meet them. You will be asked in the following week to identify those you have met, and supply relevant supporting evidence."),
				fields : {
					future_targets : {
						template: "field_complex",
						title: "Targets for the coming week",
						field: "Future Targets",
						type: "Target",
						prefix: "Evidence Type",
						icon: "gps_fixed",
            list_field: "Targets",
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
				}
			}
		}
	};
  
};
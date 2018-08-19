Folder = (ಠ_ಠ, calendar, target) => {

	/* <!-- Internal Constants --> */
	const DB = new loki("calendar.db");
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
  
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
  var _showCalendar = calendar => {
    return target ? calendar : false;
  };
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */
	_showCalendar(calendar);

	/* <!-- External Visibility --> */
	return {

    db: DB,
    
		id: () => calendar.id,
    
	};
	/* <!-- External Visibility --> */

};
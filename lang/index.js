//exports.index = function(req, res){
//  res.render('index', {
//	  title: 'Calendar',
//	  newCalEntry: 'new calendar entry'
//  });
//};

exports.de_de = function(req, res){
	res.render('index', {
		title: 'Kalender',
		newCalEntry: 'neuer Kalendereintrag',
		cancel: 'Abbrechen',
		save: 'Speichern',
		del: 'L&ouml;schen',
		modalAddEntryHeader: 'neuer Kalendereintrag',
		modalEditEntryHeader: 'Kalendereintrag editieren',
		entryTitle: 'Titel',
		entryDescr: 'Beschreibung',
		entryStartDate: 'Startdatum',
		entryEndDate: 'Enddatum',
		entryStartTime: 'Startzeitpunkt',
		entryEndTime: 'Endzeitpunkt',
		refreshBtn: 'aktualisieren'
	});
};

exports.en_gb = function(req, res){
	res.render('index', {
		title: 'Calendar',
		newCalEntry: 'new calendar entry',
		cancel: 'Cancel',
		save: 'Save',
		del: 'Delete',
		modalAddEntryHeader: 'new calendar entry',
		modalEditEntryHeader: 'edit calendar entry',
		entryTitle: 'Title',
		entryDescr: 'Description',
		entryStartDate: 'Start Date',
		entryEndDate: 'End Date',
		entryStartTime: 'Start Time',
		entryEndTime: 'End Time',
		refreshBtn: 'refresh'
	});
};
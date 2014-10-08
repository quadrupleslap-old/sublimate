	$(function() {
		// Dodgy hax ftw!
		$("#contextmenu ul").append("<li onclick='window.location.href=\"/about.html\"'>About Sublimate</li>");

		getDay()
		getNotices()
	})

	function getDay() {
		$.getJSON( '/api/daytimetable.json', function( data ) {

			window.day = data
			day.bells[0].bellDisplay = 'School Starts'

			$('#belltimes table').empty()

			var constructed = ''

			for(var i=0; i<day.bells.length; i++) {

				constructed += '<tr>'


				if(day.timetable.timetable.periods[day.bells[i].bell] && day.timetable.timetable.periods[day.bells[i].bell].room) {

					constructed += '<td class="timeCell">' + escapeHTML(day.bells[i].time) + '</td>';

					if (day.bells[i].bell in day.classVariations && day.classVariations[day.bells[i].bell].type != "novariation") {
						var message = day.classVariations[day.bells[i].bell].title + (day.classVariations[day.bells[i].bell].type == "replacement" ?
												' has ' + day.classVariations[day.bells[i].bell].casualSurname.trim() + ' as a casual.' :
												' doesn\'t have a teacher assigned to it.')

						constructed += '<td><p class="rollover highlight" onclick="rollover(this)" title="' + escapeHTML(message) + '">'
						+ escapeHTML(day.timetable.subjects[day.timetable.timetable.periods[day.bells[i].bell].year + day.timetable.timetable.periods[day.bells[i].bell].title].title)
						+ '</p></td>'

					} else {

						constructed += '<td>'
						+ escapeHTML(day.timetable.subjects[day.timetable.timetable.periods[day.bells[i].bell].year
							+ day.timetable.timetable.periods[day.bells[i].bell].title].title)
						+ '</td>'

					}

					if (day.bells[i].bell in day.roomVariations) {

						constructed += '<td class="roomCell highlight">'
						+ escapeHTML(day.roomVariations[day.bells[i].bell].roomTo)
						+ '</td>'

					} else {
						constructed += '<td class="roomCell">'
						+ escapeHTML(day.timetable.timetable.periods[day.bells[i].bell].room)
						+ '</td>'
					}

				} else  {
					constructed += '<td class="timeCell">'
					+ escapeHTML(day.bells[i].time) + '</td><td>'
					+ escapeHTML(day.bells[i].bellDisplay)
					+ '</td><td class="roomCell"></td>'
				}

				constructed += '</tr>'
			}

			$('#belltimes table').append(constructed)
			showNextPeriod()

		}).fail(function () {
			window.location.href = "/fallback"
		})

}



function showNextPeriod() {
	var now  = new Date()
	var bell = new Date(day.date)

	bell.setSeconds(0)
	bell.setMilliseconds(0)

	var splitted

	for(var i=0; i<day.bells.length; i++) {

		splitted = day.bells[i].time.split(':')

		bell.setHours(splitted[0])
		bell.setMinutes(splitted[1])


		if (bell > now) {

			var nextPeriod = day.timetable.timetable.periods[day.bells[i].bell]
			$('#next').text(nextPeriod && nextPeriod.year ? day.timetable.subjects[nextPeriod.year + nextPeriod.title].subject
				|| day.timetable.subjects[nextPeriod.year + nextPeriod.title].title
				: day.bells[i].bellDisplay)

			if (nextPeriod && nextPeriod.room) {$('#next').text($('#next').text() + ' (' + nextPeriod.room +')')}

			tick(bell)
			window.updateLoop = setInterval(function () {
				tick(bell)
			}, 1000)

			return
		}

	}

	getDay()

}

function tick(bell) {

				var units = countdown.HOURS | countdown.MINUTES | countdown.SECONDS,
				now   = new Date(),
				ts    = countdown(bell, now, units),
				msg   = '',
				value,
				humanisedValues = []

				value = ts.hours
				if (value) {humanisedValues.push(twoPad(value)+'h')}

				humanisedValues.push(twoPad(ts.minutes)+'m')
				humanisedValues.push(twoPad(ts.seconds)+'s')
				msg = humanisedValues.join(', ')


				if (now > bell) {
					clearInterval(updateLoop)
					showNextPeriod()
				} else {
					$('#time').text(msg)
				}
}

function getNotices() {
	$.getJSON( '/api/dailynotices.json', function( data ) {

		if (data.notices) {
			$('#notices').empty()
			$('#week').text('Week ' + data.dayInfo.week + data.dayInfo.weekType)
			if (data.dayInfo.week==0) $('#week').text('Holidays!')

			var newNotice
			for(var i=0; i<data.notices.length; i++) {

				newNotice = $('<div class="notice">').data('years', data.notices[i].years)

				$('<p>', {
					'text': data.notices[i].title,
					'class': 'title'
				}).appendTo(newNotice)

				if (data.notices[i].isMeeting === '1') {
					$('<p>', {
						'text': data.notices[i].meetingTime
						+ ', '
						+ (new Date(data.notices[i].meetingDate)).toLocaleDateString()
						+ ' in '
						+ data.notices[i].meetingLocation
						+ '.'
					}).appendTo(newNotice)
				}

				$(data.notices[i].content).appendTo(newNotice)

				$('<p>', {
					'text': data.notices[i].authorName,
					'class': 'author'
				}).css('float', 'left').appendTo(newNotice)

				$('<p>', {
					'text': data.notices[i].displayYears,
					'class': 'author'
				}).css('float', 'right').appendTo(newNotice)



				$('#notices').append(newNotice)

				// Don't you just *hate* it when people put code in the wrong place?
				if (localStorage.noticeFilter && window.customise) customise.filterNotices(localStorage.noticeFilter)

			}

		}

	})
}

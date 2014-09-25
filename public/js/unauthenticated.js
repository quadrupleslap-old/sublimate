	$(function() {
		getDay()
	})

	function getDay(date) {
		var now = date || new Date()
		var isodate = now.toISOString().split('T')[0]

		$.getJSON( '//student.sbhs.net.au/api/timetable/bells.json?date='+ isodate +'&callback=?', function( data ) {
			if (data && data.status != 'Error') {
				window.day = data
				day.bells[0].bell = 'School Starts'

				$('#week').text('Week ' + day.week + day.weekType)

				$('#belltimes table').empty()

				var constructed = ''

				for(var i=0; i<day.bells.length; i++) {


					if (/^\d$/.test(day.bells[i].bell)) {
						day.bells[i].bell = 'Period ' + day.bells[i].bell
					}

					constructed += '<tr><td class="timeCell">'
					+ escapeHTML(day.bells[i].time) + '</td><td>'
					+ escapeHTML(day.bells[i].bell)
					+ '</td>'

					constructed += '</tr>'
				}

				$('#belltimes table').append(constructed)

				showNextPeriod()
			} else {
				now.setDate(now.getDate() + 1)
				getDay(now)
			}

		});

	}



	function showNextPeriod() {
		var now  = new Date()
		var bell = new Date(day.date)
		var splitted

		for(var i=0; i<day.bells.length; i++) {

			splitted = day.bells[i].time.split(':')

			bell.setHours(splitted[0])
			bell.setMinutes(splitted[1])


			if (bell > now) {

				$('#next').text(day.bells[i].bell)

				tick(bell)
				window.updateLoop = setInterval(function () {
					tick(bell)
				}, 1000)

				return


			}

		}

		now.setDate(now.getDate() + 1)
		getDay(now)

	}

	function tick (bell) {
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

	$(function() {
		getDay();
		getNotices();
	});

	$(window).resize(function() {
		$("td, p, div").css("z-index", 1);
	});

	function getDay() {
		$.getJSON( "/api/daytimetable.json", function( data ) {
			
			window.day = data;
			showNextPeriod();

			$("#belltimes table").empty();

			var constructed = "";

			for(var i=0; i<day.bells.length; i++) {

				constructed += "<tr>"
				

				if(day.timetable.timetable.periods[day.bells[i].bell] && day.timetable.timetable.periods[day.bells[i].bell].room) {

					constructed += '<td class="timeCell">' + escapeHTML(day.bells[i].time) + '</td>';

					if (day.bells[i].bell in day.classVariations) {

						constructed += '<td><p class="rollover" title="'
						+ escapeHTML(day.classVariations[day.bells[i].bell].title
							+ ' has '
							+ day.classVariations[day.bells[i].bell].casualSurname.trim())
							+ ' as a casual.">'
							+ escapeHTML(day.timetable.subjects[day.timetable.timetable.periods[day.bells[i].bell].year
							+ day.timetable.timetable.periods[day.bells[i].bell].title].title)
						+ '</p></td>';

					} else {

						constructed += '<td>'
						+ escapeHTML(day.timetable.subjects[day.timetable.timetable.periods[day.bells[i].bell].year
							+ day.timetable.timetable.periods[day.bells[i].bell].title].title)
						+ '</td>';

					}

					if (day.bells[i].bell in day.roomVariations) {

						constructed += '<td class="roomCell warning">'
						+ escapeHTML(day.roomVariations[day.bells[i].bell].roomTo)
						+ '</td>';

					} else {
						constructed += '<td class="roomCell">'
						+ escapeHTML(day.timetable.timetable.periods[day.bells[i].bell].room)
						+ '</td>';
					}

				} else  {
					constructed += '<td class="timeCell">'
					+ escapeHTML(day.bells[i].time) + '</td><td>'
					+ escapeHTML(day.bells[i].bellDisplay)
					+ '</td><td class="roomCell"></td>';
				}
				
				constructed += "</tr>";
			}

			$("#belltimes table").append(constructed);

		});

}



function showNextPeriod() {
	var now  = new Date();
	var bell = new Date(day.date);
	var splitted;

	day.bells[0].bellDisplay = "School Starts";

	for(var i=0; i<day.bells.length; i++) {

		splitted = day.bells[i].time.split(":");

		bell.setHours(splitted[0]);
		bell.setMinutes(splitted[1]);


		if (bell > now) {
			if (day.bells[i].bellDisplay)

				var nextPeriod = day.timetable.timetable.periods[day.bells[i].bell];
			$("#next").text(nextPeriod && nextPeriod.year ? day.timetable.subjects[nextPeriod.year + nextPeriod.title].subject
			|| day.timetable.subjects[nextPeriod.year + nextPeriod.title].title
			: day.bells[i].bellDisplay);

			if (nextPeriod && nextPeriod.room) {$("#next").text($("#next").text() + " (" + nextPeriod.room +")");}

			window.updateLoop = setInterval(function () {

				var units = countdown.HOURS | countdown.MINUTES | countdown.SECONDS,
				now   = new Date(),
				ts    = countdown(bell, now, units),
				msg   = "",
				value,
				humanisedValues = [];

				value = ts.hours;
				if (value) {humanisedValues.push(twoPad(value)+"h");}

				humanisedValues.push(twoPad(ts.minutes)+"m");
				humanisedValues.push(twoPad(ts.seconds)+"s");
				msg = humanisedValues.join(", ");


				if (now > bell) {
					clearInterval(updateLoop);
					showNextPeriod();
				} else {
					$("#time").text(msg);
				}
			}, 1000);

			return;
		}

	}

	getDay();

}

function getNotices() {
	$.getJSON( "/api/dailynotices.json", function( data ) {

		if (data.notices) {
			$("#week").append($("<b>", {"text": ('Week ' + data.dayInfo.week + data.dayInfo.weekType)}));

			var newNotice;
			for(var i=0; i<data.notices.length; i++) {

				newNotice = $("<div>");

				$("<p>", {
					"text": data.notices[i].title,
					"class": "title"
				}).appendTo(newNotice);

				if (data.notices[i].isMeeting === "1") {
					$("<p>", {
						"text": data.notices[i].meetingTime
						+ ", "
						+ (new Date(data.notices[i].meetingDate)).toLocaleDateString()
						+ " in "
						+ data.notices[i].meetingLocation
						+ "."
					}).appendTo(newNotice);
				}

				$("<br>").appendTo(newNotice);

				$(data.notices[i].content).appendTo(newNotice);

				$("<p>", {
					"text": data.notices[i].authorName,
					"class": "author"
				}).css("float", "left").appendTo(newNotice);

				$("<p>", {
					"text": data.notices[i].displayYears,
					"class": "author"
				}).css("float", "right").appendTo(newNotice);



				$("#notices").append(newNotice);

			}
		}

	});
}
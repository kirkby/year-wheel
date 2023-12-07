const textColor = "#333333";

function toRadians(deg) {
	return (deg * Math.PI) / 180;
}

function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstChild;
}

function moveToAngle(center, radius, angle) {
	const x = center.x + radius * Math.cos(angle);
	const y = center.y + radius * Math.sin(angle);
	return { x: x, y: y };
}

function setCircleSectionHTML(context, center, startRadius, width, startAngle, endAngle, color, textFunction, text, fontSize) {
	const endRadius = startRadius + width;
	const calculatedStartAngle = toRadians(startAngle);
	const calculatedEndAngle = toRadians(endAngle);

	const innerStartCoords = moveToAngle(center, startRadius, calculatedStartAngle);
	const outerStartCoords = moveToAngle(center, endRadius, calculatedStartAngle);
	const innerEndCoords = moveToAngle(center, startRadius, calculatedEndAngle);
	const outerEndCoords = moveToAngle(center, endRadius, calculatedEndAngle);
	const angleLength = Math.abs(calculatedEndAngle - calculatedStartAngle);

	context.beginPath();
	context.fillStyle = color;
	context.moveTo(outerStartCoords.x, outerStartCoords.y);
	context.lineTo(innerStartCoords.x, innerStartCoords.y);

	context.arc(center.x, center.y, startRadius, calculatedStartAngle, calculatedEndAngle, false);

	context.lineTo(outerEndCoords.x, outerEndCoords.y);
	context.arc(center.x, center.y, startRadius + width, calculatedEndAngle, calculatedStartAngle, true);
	context.fill();
	context.closePath();

	context.moveTo(center.x, center.y);

	if (text !== undefined) {
		context.font = `bold ${fontSize}px Arial`;
		textFunction(text, context, center, startRadius, width, calculatedStartAngle, calculatedEndAngle, angleLength);
	}
}

function setCircleSectionTitle(text, context, center, startRadius, width, startAngle, endAngle, angleLength) {
	const angle = (startAngle + endAngle) / 2;
	const middleRadius = startRadius + width / 2.2;
	let radius;

	const circleSectionLength = startRadius * 2 * Math.PI * (angleLength / (Math.PI * 2));
	const textWidth = context.measureText(text).width;

	if (textWidth < circleSectionLength) {
		radius = middleRadius;
		context.fillStyle = "#ffffff";
	} else {
		radius = middleRadius + width;
		context.fillStyle = textColor;
	}
	const coord = moveToAngle(center, radius, angle);

	context.save();
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.translate(coord.x, coord.y);
	context.rotate(angle + Math.PI / 2);
	context.fillText(text.toUpperCase(), 0, 0);
	context.restore();
}

function setCircleSectionTexts(texts, context, center, startRadius, width, startAngle, endAngle, angleLength) {
	const radius = startRadius + width / 2;
	const averageAngle = (startAngle + endAngle) / 2;
	context.fillStyle = "#ffffff";
	const angleDifference = angleLength / (texts.length + 1);
	for (let i = 0; i < texts.length; i++) {
		const text = texts[i];
		const angle = startAngle + angleDifference + i * angleDifference;

		const coord = moveToAngle(center, startRadius + width / 10, angle);
		context.save();
		context.textAlign = "start";
		context.textBaseline = "middle";
		context.translate(coord.x, coord.y);
		context.rotate(angle);
		context.fillText(text, 0, 0, width - width * 0.2);
		context.restore();
	}
}

let scrollWidth = 0.5;
let scrollHeight = 0.5;

function scaleYearWheel($canvas, scale) {
	const context = $canvas.getContext("2d");
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;
	context.imageSmoothingEnabled = false;


	const size = 3000;
	const width = size * scale;
	const height = (size / 4 + size) * scale;
	// const oldWidth = $canvas.width
	// const oldHeight = $canvas.height
	// scrollWidth = $yearWheel.scrollLeft / oldWidth;
	// scrollHeight = $yearWheel.scrollTop / oldHeight;
	const pixelRatio = window.devicePixelRatio || 1;
	$canvas.width = width * pixelRatio;
	$canvas.height = height * pixelRatio;
	$canvas.style.width = `${width}px`;
	$canvas.style.height = `${height}px`;
	// $canvas.style.marginTop = `calc(50% - ${height}px / 2)`;

	context.save();
	context.translate(-(((width)-width)/2), -(((height)-height)/2));
	context.scale(scale*pixelRatio, scale*pixelRatio);
    context.clearRect(0, 0, width, height);
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;
	context.imageSmoothingEnabled = false;
	context.drawImage($copiedCanvas, 0, 0);
	context.restore();

	// console.log($yearWheel.scrollWidth);
	// console.log(scrollWidth * width + (width - oldWidth)/2);

	// $yearWheel.scrollTo(scrollWidth * width + (width - oldWidth)/2, scrollHeight * height + (height - oldHeight)/2);
}

let $copiedCanvas;
let $pngCanvas;
let $yearWheel = document.querySelector(".year-wheel")

function copyYearWheel($canvas, context, width, height){
	const $copiedCanvas = $canvas.cloneNode()
	$copiedCanvas.width = width;
	$copiedCanvas.height = height;
	const imageData = context.getImageData(0, 0, width, height);
	const copiedContext = $copiedCanvas.getContext("2d")
	copiedContext.putImageData(imageData, 0, 0);
	copiedContext.webkitImageSmoothingEnabled = false;
	copiedContext.mozImageSmoothingEnabled = false;
	copiedContext.imageSmoothingEnabled = false;

	return $copiedCanvas
}


function createYearWheel($canvas, ringsData, title, year, colors) {
	const context = $canvas.getContext("2d");

	const size = 3000;

	const width = size;
	const height = (size / 4 + size);
	$canvas.width = width;
	$canvas.height = height;
	// $canvas.style.width = `${width}px`;
	$canvas.style.height = `100%`;
	const center = { x: size / 2, y: (size / 5) + size / 2 };

	context.fillStyle = textColor;
	context.font = `bold ${size / 20}px Arial`;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(title, size / 2, size / 9, size);

	context.font = `bold ${size / 30}px Arial`;
	context.fillText(year, center.x, center.y + size / 500, size);

	function addMonthlyCircleSection(startRadius, width, spacingAngle, color, textFunction, texts, fontSize) {
		const numberOfIntervals = 12;
		addRegularCircleSections(numberOfIntervals, spacingAngle, startRadius, width, color, textFunction, texts, fontSize);
	}

	function addRegularCircleSections(numberOfIntervals, spacingAngle, startRadius, width, color, textFunction, texts, fontSize) {
		const intervalAngle = 360 / numberOfIntervals;
		for (let i = 0; i < numberOfIntervals; i++) {
			const text = texts[i];
			addCircleSection(spacingAngle, startRadius, width, i * intervalAngle, i * intervalAngle + intervalAngle, color ? color : colors[i % colors.length], textFunction, text, fontSize);
		}
	}

	const initAngle = -15 - 90;
	function addCircleSection(spacingAngle, startRadius, width, startAngle, endAngle, color, textFunction, text, fontSize) {
		const newStartAngle = initAngle + startAngle + spacingAngle;
		const newEndAngle = initAngle + endAngle - spacingAngle;
		setCircleSectionHTML(context, center, startRadius, width, newStartAngle, newEndAngle, color, textFunction, text, fontSize);
	}

	const minRadius = size / 15;
	const maxRadius = size / 2 - size / 30;

	const minDate = new Date(year, 0, 1);
	const maxDate = new Date(year, 11, 31);

	// calendar events
	const calenderEvents = {
		2024: [
			{ startDate: new Date(year - 1, 11, 28), endDate: new Date(year, 0, 4), name: "Nytår" },
			{ startDate: new Date(year, 0, 4), endDate: new Date(year, 0, 29), name: "Helligtrekonger" },
			{ startDate: new Date(year, 1, 19), endDate: new Date(year, 3, 1), name: "Faste" },
			{ startDate: new Date(year, 3, 1), endDate: new Date(year, 3, 11), name: "Påske" },
			{ startDate: new Date(year, 4, 4), endDate: new Date(year, 4, 6), name: "Bededag" },
			{ startDate: new Date(year, 4, 17), endDate: new Date(year, 4, 19), name: "Kristi Himmelfart" },
			{ startDate: new Date(year, 4, 25), endDate: new Date(year, 4, 31), name: "Pinse" },
			{ startDate: new Date(year, 10, 4), endDate: new Date(year, 10, 6), name: "Allehelgen" },
			{ startDate: new Date(year - 1, 11, 2), endDate: new Date(year - 1, 11, 23), name: "Advent" },
			{ startDate: new Date(year - 1, 11, 22), endDate: new Date(year - 1, 11, 28), name: "Jul" },
		], 
		2023: [
			{ startDate: new Date(year - 1, 11, 28), endDate: new Date(year, 0, 4), name: "Nytår" },
			{ startDate: new Date(year, 0, 4), endDate: new Date(year, 0, 29), name: "Helligtrekonger" },
			{ startDate: new Date(year, 1, 19), endDate: new Date(year, 3, 1), name: "Faste" },
			{ startDate: new Date(year, 3, 1), endDate: new Date(year, 3, 11), name: "Påske" },
			{ startDate: new Date(year, 4, 4), endDate: new Date(year, 4, 6), name: "Bededag" },
			{ startDate: new Date(year, 4, 18), endDate: new Date(year, 4, 19), name: "Kristi Himmelfart" },
			{ startDate: new Date(year, 4, 25), endDate: new Date(year, 4, 31), name: "Pinse" },
			{ startDate: new Date(year, 10, 4), endDate: new Date(year, 10, 6), name: "Allehelgen" },
			{ startDate: new Date(year - 1, 11, 2), endDate: new Date(year - 1, 11, 23), name: "Advent" },
			{ startDate: new Date(year - 1, 11, 22), endDate: new Date(year - 1, 11, 28), name: "Jul" },
		], 
		2022: [
			{ startDate: new Date(year - 1, 11, 27), endDate: new Date(year, 0, 4), name: "Nytår" },
			{ startDate: new Date(year, 0, 4), endDate: new Date(year, 1, 7), name: "Helligtrekonger" },
			{ startDate: new Date(year, 1, 27), endDate: new Date(year, 3, 3), name: "Faste" },
			{ startDate: new Date(year, 3, 10), endDate: new Date(year, 3, 18), name: "Påske" },
			{ startDate: new Date(year, 4, 11), endDate: new Date(year, 4, 13), name: "Bededag" },
			{ startDate: new Date(year, 4, 25), endDate: new Date(year, 4, 26), name: "Krist himmelfart" },
			{ startDate: new Date(year, 5, 1), endDate: new Date(year, 5, 6), name: "Pinse" },
			{ startDate: new Date(year, 10, 3), endDate: new Date(year, 10, 6), name: "Allehelgen" },
			{ startDate: new Date(year - 1, 10, 27), endDate: new Date(year - 1, 11, 20), name: "Advent" },
			{ startDate: new Date(year - 1, 11, 20), endDate: new Date(year - 1, 11, 27), name: "Jul" },
		], 
	}
	
	const sortedCalenderEvents = calenderEvents[year].sort((a, b) => a.startDate - b.startDate);

	const calendarEventWidth = size / 40;
	const calendarEventStartRadius = maxRadius - calendarEventWidth;
	for (let i = 0; i < sortedCalenderEvents.length; i++) {
		const calenderEvent = sortedCalenderEvents[i];
		let startAngle = Math.round(((calenderEvent.startDate - minDate) / (maxDate - minDate)) * 360);
		let endAngle = Math.round(((calenderEvent.endDate - minDate) / (maxDate - minDate)) * 360);
		if (Math.abs(startAngle - endAngle) < 3) {
			const averageAngle = (startAngle + endAngle) / 2;
			startAngle = averageAngle - 1.5;
			endAngle = averageAngle + 1.5;
		}
		addCircleSection(0, calendarEventStartRadius, calendarEventWidth, startAngle, endAngle, colors[i % colors.length], setCircleSectionTitle, calenderEvent.name, size / 90);
	}

	// months name
	const monthColor = colors[0];
	const monthNameWidth = size / 30;
	const monthNameStartRadius = calendarEventStartRadius - monthNameWidth - size / 200;
	const monthNames = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
	addMonthlyCircleSection(monthNameStartRadius, monthNameWidth, 0.5, monthColor, setCircleSectionTitle, monthNames, size / 60);

	// monthly events
	const eventSpacing = size / 300;
	const numberOfEvents = ringsData.length;
	const eventWidth = monthNameStartRadius - minRadius - size / 30 - eventSpacing * (numberOfEvents - 1);
	let percentage;
	let remainingEventWidth = eventWidth;
	let eventRadius = minRadius;
	for (let i = 0; i < numberOfEvents; i++) {
		percentage = (1 / (numberOfEvents - i)) * 1.1;
		const newEventWidth = i !== numberOfEvents - 1 ? remainingEventWidth * percentage : remainingEventWidth;
		remainingEventWidth -= newEventWidth;
		addMonthlyCircleSection(eventRadius, newEventWidth, 0.4, null, setCircleSectionTexts, ringsData[i], size / 150);
		eventRadius += newEventWidth + eventSpacing;
	}

	$copiedCanvas = copyYearWheel($canvas, context, width, height);
	$pngCanvas = copyYearWheel($canvas, context, width, height)
}






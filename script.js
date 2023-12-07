window.onload = () => onLoad();

// html elements
const $body = document.querySelector("body");
const $ringTextareas = document.querySelectorAll(".ring-textarea textarea");
const $ringsHTML = document.querySelector(".rings");
const $colorInputs = document.querySelectorAll(".color-input");
const $title = document.querySelector(".title-input");
const $year = document.querySelector(".year-select");
const $canvas = document.querySelector("canvas");
const $downloadButton = document.querySelector(".download-button");

// inital values
const initialTitle = "[Indsæt titel]";
const initialSelectedYear = "2023";
const initalSelectedColorIndexes = [7, 2, 6];
const initialSelectedRingIndex = 1;
const initalRingsData = [
	[[], [], [], [], [], [], [], [], [], [], [], []],
	[
		["1. Nytårsdag", "6. Helligtrekonger"],
		["2. Kyndelmisse", "19. Fastelavnssøndag", "22. Askeonsdag"] ,
		[],
		["2. Palmesøndag", "14. Skærtorsdag", "15. Langfredag", "17. Påskedag", "18. Anden påskedag", "30. Store Bededag"],
		["4. Befrielsesaften", "5. Danmarks befrielse", "8. Mors dag", "19.-21. Naturmødet Hirtshals", "23. DemensDagene 23.-24.", "26. Kristihimmelfartsdag", "26. Himmelske Dage i Roskilde 26.-29."],
		["5. Pinsedag", "6. Anden pinsedag", "5. Grundlovsdag", "15. Valdemarsdag", "23. Sankthansaften", "24. Sankthansdag"],
		[],
		[],
		["29. Mikkelsdag"],
		["31. Reformationsdag"],
		["6. Allehelgen", "10. Mortensaften"],
		["3. Første søndag i advent", "10. Anden søndag i advent", "17. Tredje søndag i advent", "13. Luciadag", "24. Fjerde søndag i advent", "24. Juleaftensdag", "25. Juledag", "26. Anden juledag", "31. Nytårsaften"],
	],
];

// templates
const ringDataTemplate = [[], [], [], [], [], [], [], [], [], [], [], []];

// constant data
const colors = ["#000000", "#999999", "#CC3333", "#F89933", "#FFCC00", "#669933", "#006699", "#663399"];
const years = ["2022", "2023", "2024"];

// variable data
let ringsData = [[[], [], [], [], [], [], [], [], [], [], [], []]];
let selectedRingIndex = 0;
let selectedColorIndexes = [];
let title = "";
let selectedYear = "";
let scale = 0.18;

function onLoad() {
	loadData();
	setHTML();
	generateYearWheel();
	initialize();
}

function loadData() {
	const loadDataIfExist = (maybeJSON, initial) => (maybeJSON ? JSON.parse(maybeJSON) : initial);

	const titleJSON = localStorage.getItem("title");
	title = loadDataIfExist(titleJSON, initialTitle);

	const selectedYearJSON = localStorage.getItem("selectedYear");
	selectedYear = loadDataIfExist(selectedYearJSON, initialSelectedYear);

	const selectedColorIndexesJSON = localStorage.getItem("selectedColorIndexes");
	selectedColorIndexes = loadDataIfExist(selectedColorIndexesJSON, initalSelectedColorIndexes);

	const selectedRingIndexJSON = localStorage.getItem("selectedRingIndex");
	selectedRingIndex = loadDataIfExist(selectedRingIndexJSON, initialSelectedRingIndex);

	const ringsDataJSON = localStorage.getItem("ringsData");
	ringsData = loadDataIfExist(ringsDataJSON, initalRingsData);
}

// add event listeners and colors
function initialize() {
	$ringTextareas.forEach(($ringTextarea, i) => $ringTextarea.addEventListener("change", (event) => setText(event, i)));
	$colorInputs.forEach(($colorInput, i) => {
		$colorInput.addEventListener("click", (event) => selectColor(event, i));
		$colorInput.style.backgroundColor = colors[i];
	});
	$title.addEventListener("change", (event) => (title = event.target.value));
	$year.addEventListener("change", (event) => (selectedYear = event.target.value));
}

function setHTML() {
	createRingHTMLs();
	setRingsTexts(ringsData);
	selectRing(selectedRingIndex);
	selectColors(selectedColorIndexes);
	$title.value = title;
	$year.value = selectedYear;
}

function createRingHTMLs() {
	$ringsHTML.innerHTML = "";
	for (let i = 0; i < ringsData.length; i++) {
		// const ringData = ringsData[i]
		$ringsHTML.innerHTML += createRingHTML(i, i == selectedRingIndex);
	}
	function createRingHTML(index, isSelected) {
		return `
      <button onClick="selectRing(${index})" class="ring-button${isSelected ? " selected" : ""}">
        Ring ${index + 1}
      </button>`;
	}
}

function setRingsTexts(ringsData) {
	ringsData.forEach((ringData) => setRingTexts(ringData));
}

function setRingTexts(ringData) {
	for (let i = 0; i < $ringTextareas.length; i++) {
		const $ringTextarea = $ringTextareas[i];
		$ringTextarea.value = "";
		$ringTextarea.value = ringData[i].join("\n");
	}
}

// select colors
function selectColors(selectedColorIndexes) {
	selectedColorIndexes.forEach((selectedColorIndex) => $colorInputs[selectedColorIndex].classList.toggle("selected"));
}

// event functions
function selectColor(event, index) {
	const indexIndex = selectedColorIndexes.indexOf(index);
	const $colorInput = $colorInputs[index];
	if (indexIndex !== -1) {
		selectedColorIndexes.splice(indexIndex, 1);
	} else {
		selectedColorIndexes.push(index);
	}
	$colorInput.classList.toggle("selected");
}

function selectRing(index) {
	selectedRingIndex = index;
	const $selectedRingHTML = document.querySelector(".rings .ring-button.selected");
	if ($selectedRingHTML) $selectedRingHTML.classList.remove("selected");
	const $ringHTML = document.querySelectorAll(".rings .ring-button")[index];
	$ringHTML.classList.add("selected");
	setRingTexts(ringsData[index]);
	localStorage.setItem("selectedRingIndex", JSON.stringify(selectedRingIndex));
}

function addRing() {
	if (ringsData.length < 3) {
		const newRingData = Object.assign([], ringDataTemplate);
		ringsData.push(newRingData);
		createRingHTMLs();
	}
}

function deleteRing() {
	if (ringsData.length > 1) {
		ringsData.splice(selectedRingIndex, 1);
		createRingHTMLs();
		selectRing(0);
	}
}

function setText(event, monthIndex) {
	ringsData[selectedRingIndex][monthIndex] = event.target.value.split("\n");
}

function generateYearWheel() {
	const selectedColors = selectedColorIndexes.map((selectedColorIndex) => colors[selectedColorIndex]);
	saveData();
	createYearWheel($canvas, ringsData, title, selectedYear, selectedColors);
	scaleYearWheel($canvas, scale);
	$downloadButton.href = $pngCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}

function saveData() {
	localStorage.setItem("title", JSON.stringify(title));
	localStorage.setItem("selectedYear", JSON.stringify(selectedYear));
	localStorage.setItem("selectedColorIndexes", JSON.stringify(selectedColorIndexes));
	localStorage.setItem("ringsData", JSON.stringify(ringsData));
}

function resetData() {
	localStorage.removeItem("title");
	localStorage.removeItem("year");
	localStorage.removeItem("selectedColorIndexes");
	localStorage.removeItem("selectedRingIndex");
	localStorage.removeItem("ringsData");
	document.location.reload();
}

// in development
function zoom(factor) {
	// const currentScale = getComputedStyle($body).getPropertyValue("--scale");
	const newScale = scale * factor;
	if (newScale <= 1.5 && newScale > 0.1) {
		scaleYearWheel($canvas, newScale);
		scale = newScale;
	}
}

function m(id) {
	return document.getElementById(id);
}
var unaryOps = m("unary_ops").getElementsByTagName("input"),
	binaryOps = m("binary_ops").getElementsByTagName("input");
var digitsNum = m("digits_num"),
	digitsContainer = m("digits"),
	solForm = m("sol_form"),
	solOutput = m("solutions");
var stopOpts = [m("fst"), m("arb"), m("all")],
	desiredNum = m("desired_num"),
	solLimit = m("sol_limit"),
	numSols = m("num_sols");
function setTextContent(el, text) {
	var propertyName = ("textContent" in el) ? "textContent" : "innerText";
	el[propertyName] = text;
}
function addDigitInputs() {
	var val = +digitsNum.value;
	if(!isNaN(val)) {
		val = Math.min(Math.max(2, val), 20);
		var digits = [];
		for(var i = 0; i < val; i++) {
			digits.push('<input type="text" class="digit-input" value="' + (Math.floor((Math.random() * 9) + 1)) + '">');
		}
		digitsContainer.innerHTML = digits.join("");
	}
}
function getDigits() {
	var digits = [],
		digits_coll = digitsContainer.childNodes;
	for(var i = 0, num_digits = digits_coll.length; i < num_digits; i++) {
		var digit_val = +digits_coll[i].value;
		if(isNaN(digit_val)) {
			digit_val = 0;
		}
		digits_coll[i].value = digit_val;
		digits.push(digits_coll[i].value);
	}
	return digits;
}
digitsNum.oninput = addDigitInputs;
function printSolutions() {
	for(var j = 0, num_uops = unaryOps.length; j < num_uops; j++) {
		Deset.set_unary_enabled_state(unaryOps[j].id, unaryOps[j].checked);
	}
	for(j = 0, num_bops = binaryOps.length; j < num_bops; j++) {
		Deset.set_binary_enabled_state(binaryOps[j].id, binaryOps[j].checked);
	}
	var digits = getDigits(),
		desired_num = +desiredNum.value,
		sol_limit = 0,
		sol_limits = {
			"fst": 1,
			"arb": +solLimit.value,
			"all": Infinity
		};
	if(isNaN(desired_num)) {
		desiredNum.value = desired_num = 10;
	}
	for(var i = 0, num_opts = stopOpts.length; i < num_opts; i++) {
		if(stopOpts[i].checked) {
			sol_limit = sol_limits[stopOpts[i].id];
			break;
		}
	}
	var sols = Deset.get_solutions(digits, desired_num, sol_limit),
		readable_rows = [],
		num_sols = sols.length;
	setTextContent(numSols, num_sols);
	for(var j = 0; j < num_sols; j++) {
		readable_rows.push(Deset.get_readable_solution(sols[j]));
	}
	if(readable_rows.length === 0) {
		readable_rows.push("No solution found.");//Nebylo nalezeno žádné řešení.
	}
	setTextContent(solOutput, readable_rows.join("\n"));
	return false;
}
solForm.onsubmit = printSolutions;
addDigitInputs();
// jshint esversion: 3, curly: true, eqeqeq: true, strict: global, undef: true, futurehostile: true, browser: true
"use strict";
var Deset = (function() {
var cache = {0: {0: [[]]}};// important: always initialize the cache this way!
function get_grouped_digits_options(end) {
	if (end in cache) {
		return cache[end];
	}
	var options_by_len = {};
	for (var i = 1; i <= end; i++) {
		options_by_len[i] = [];
	}
	for (var group_length = 1; group_length <= end; group_length++) {
		var received_options_by_len = get_grouped_digits_options(end - group_length);
		for (var l in received_options_by_len) {
			l = +l;
			var opts = received_options_by_len[l],
				opts_len = opts.length;
			for (var j = 0; j < opts_len; j++) {
				var opt = opts[j].slice();
				opt.push(group_length);
				options_by_len[l + 1].push(opt);
			}
		}
	}

	cache[end] = options_by_len;
	return options_by_len;
}
function are_arrays_equal(a, b) {
	if(a.length !== b.length) {
		return false;
	}
	for(var i = 0, len = a.length; i < len; i++) {
		if(Array.isArray(a[i]) && Array.isArray(b[i])){
			if(!are_arrays_equal(a[i], b[i])) {
				return false;
			}
		} else {
			if(a[i] !== b[i]) {
				return false;
			}
		}
	}
	return true;
}
function get_binary_grouping_options(digits_options) {
	var options = [],
		queue = digits_options.slice();
	var element, num_elements;
	for (var i = 0; queue.length > 0; i++) {
		element = queue.pop();
		num_elements = element.length;
		if (num_elements === 1) {
			var allowPush = true;
			for(var j = 0, num_opts = options.length; j < num_opts; j++) {
				if(are_arrays_equal(options[j], element[0])) {
					allowPush = false;
					break;
				}
			}
			if(allowPush) {
				options.push(element[0]);
			}
		} else {
			for (var group_start = num_elements - 2; group_start >= 0; group_start--) {
				var grouped_state = element.slice(),
					second = grouped_state.splice(group_start + 1, 1)[0];
				grouped_state[group_start] = [grouped_state[group_start], second];
				queue.push(grouped_state);
			}
		}
	}
	return options;
}
var UNARY_OPERATORS = ['-', '√', '!'],
unary_enabled = {
	"unary_minus": true,
	"unary_sqrt": true,
	"unary_factorial": true
};
function unary_minus(a) {
	if(!unary_enabled.unary_minus) {
		return false;
	}
	return -a;
}
function unary_sqrt(a) {
	if(!unary_enabled.unary_sqrt) {
		return false;
	}
	if (a >= 0) {
		return Math.sqrt(a);
	}
	return false;
}
var factorial_values = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000];
function unary_factorial(a) {
	if(!unary_enabled.unary_factorial) {
		return false;
	}
	if (a >= 0 && Number.isInteger(a) && a <= 18) {
		return factorial_values[a];
	}
	return false;
}
var UNARY_OPERATIONS = [unary_minus, unary_sqrt, unary_factorial],
	BINARY_OPERATORS = ['+', '*', '/', '^'],
binary_enabled = {
	"binary_plus": true,
	"binary_mult": true,
	"binary_div": true,
	"binary_pow": true
};
function binary_plus(a, b) {
	if(!binary_enabled.binary_plus) {
		return false;
	}
	return a + b;
}
function binary_mult(a, b) {
	if(!binary_enabled.binary_mult) {
		return false;
	}
	return a * b;
}
function binary_div(a, b) {
	if(!binary_enabled.binary_div) {
		return false;
	}
	if (b !== 0) {
		return a / b;
	}
	return false;
}
function binary_pow(a, b) {
	if(!binary_enabled.binary_pow) {
		return false;
	}
	if ((a !== 0 || b > 0) && Number.isInteger(b)) {
		if (a < 0) {
			if (b === 0) {
				return 1;
			} else {
				var a_lower_boundary = -Math.pow(2, 53 / b),
					a_upper_boundary;
				if (b > 0 || b < -42/53) {
					a_upper_boundary = -Math.pow(2, -42 / b);
				} else {
					a_upper_boundary = Infinity;
				}
				if (a_lower_boundary < a && a < a_upper_boundary) {
					if (b >= 1) {
						return Math.pow(a, b);
					}
				} else if (a_upper_boundary < a && a < a_lower_boundary) {
					if (b <= -1) {
						return Math.pow(a, b);
					}
				}
			}
		} else if (a > 0) {
			if (a === 1) {
				return 1;
			} else {
				var b_boundary_upper = 53 / Math.log2(a),
					b_boundary_lower = -42 / Math.log2(a);
				if (a < 1) {
					if (b > b_boundary_upper && b < b_boundary_lower) {
						return Math.pow(a, b);
					}
				} else {
					if (b < b_boundary_upper && b > b_boundary_lower) {
						return Math.pow(a, b);
					}
				}
			}
		}
	}
	return false;
}
var BINARY_OPERATIONS = [binary_plus, binary_mult, binary_div, binary_pow],
	MAX_UNARY_COMBO_LEN = 1;

function get_unary_operation_combos(MAX_COMBO_LEN) {
	var combos = {},
		num_unary = UNARY_OPERATORS.length,
		minus_adjacent_combo = UNARY_OPERATORS.indexOf('-') * (num_unary + 1),
		contains_minus_adjacent_combo = false;
	for(var unary_combo_len = 0; unary_combo_len <= MAX_COMBO_LEN; unary_combo_len++) {
		combos[unary_combo_len] = [];
/*  n ... number in (len(UNARY_OPERATORS))-ary positional numeral system,
          where each digit represents one unary operator (more precisely, its index)*/
		contains_minus_adjacent_combo = false;
		for (var n = Math.pow(num_unary, unary_combo_len) - 1; n >= 0; n--) {
			for (var j = unary_combo_len; j >= 2; j -= 1) {
/*  extracting two adjacent unary operators and checking if both of them are minus (-)
    (using positional numeral system tricks - extracting first *j* least significant digits
     using modulo, then subtracting all digits whose weight is less than *j - 2*
     and then shifting remaining two digits to the radix point so that testing equality
     with the number xxxxx-- can be used)*/
				var left_weight = Math.pow(num_unary, j),
					right_weight = Math.pow(num_unary, j - 2);
				if (Math.floor((n % left_weight - n % right_weight) / right_weight) === minus_adjacent_combo) {
					contains_minus_adjacent_combo = true;
					break;
				}
			}
			if (contains_minus_adjacent_combo) {
				contains_minus_adjacent_combo = false;
			} else {
				combos[unary_combo_len].push(n);
			}
		}
	}
	return combos;
}

var unary_operation_combos = get_unary_operation_combos(MAX_UNARY_COMBO_LEN);

function eval_potential_solutions(binary_grouping, desired_num) {
	var num_unary = UNARY_OPERATORS.length,
		solutions = [];
	var rslts = [];
	if (typeof binary_grouping === "object") {
		var a = eval_potential_solutions(binary_grouping[0], false),
			b = eval_potential_solutions(binary_grouping[1], false);
		for (var i_a = 0, a_len = a.length, a_opt; a_opt = a[i_a], i_a < a_len; i_a++) {
			for (var i_b = 0, b_len = b.length, b_opt; b_opt = b[i_b], i_b < b_len; i_b++) {
				for (var i = BINARY_OPERATORS.length - 1; i >= 0; i--) {
					var c = BINARY_OPERATIONS[i](a_opt[0], b_opt[0]);
					if (c !== false) {
						rslts.push([c, [i, a_opt[1], b_opt[1]]]);
					}
				}
			}
		}
	} else {
		rslts.push([binary_grouping, binary_grouping]);
	}
	for (var i_rslt = 0, rslts_len = rslts.length, rslt; rslt = rslts[i_rslt], i_rslt < rslts_len; i_rslt++) {
		for (var comb_l in unary_operation_combos) {
			comb_l = +comb_l;
			unaryComboLoop: for (var i_n = 0, n_len = unary_operation_combos[comb_l].length, n; n = unary_operation_combos[comb_l][i_n], i_n < n_len; i_n++) {
				var rslt_val = rslt[0];
				for (var t = 0; t < comb_l; t++) {
					var left_weight = Math.pow(num_unary, t + 1),
						right_weight = Math.pow(num_unary, t),
						unary_idx = Math.floor(((n % left_weight) - (n % right_weight)) / right_weight);
					rslt_val = UNARY_OPERATIONS[unary_idx](rslt_val);
					if (rslt_val === false || rslt_val === rslt[0]) {
						continue unaryComboLoop;
					}
				}
				if (desired_num === false || rslt_val === desired_num) {
					solutions.push([rslt_val, [[comb_l, n], rslt[1]]]);
				}
			}
		}
	}
	return solutions;
}
function get_specific_binary_grouping(binary_grouping_generic, sequence) {
	if (typeof binary_grouping_generic === "object") {
		var a = get_specific_binary_grouping(binary_grouping_generic[0], sequence),
			b = get_specific_binary_grouping(binary_grouping_generic[1], sequence);
		return [a, b];
	} else {
		return sequence[binary_grouping_generic];
	}
}

function get_specific_grouped_digits(grouped_digits_generic, sequence) {
	var num_digits = sequence.length,
		grouped_digits_options_by_len = {};
	for (var gd_len in grouped_digits_generic) {
		grouped_digits_options_by_len[gd_len] = [];
		for (var i_gd = 0, i_gd_len = grouped_digits_generic[gd_len].length, gd_opt; gd_opt = grouped_digits_generic[gd_len][i_gd], i_gd < i_gd_len; i_gd++) {
			var option = [],
				digit_countdown = gd_opt[0],
				j = 1;
			for (var i_digit = 0, number = 0; i_digit < num_digits; i_digit += 1) {
				digit_countdown -= 1;
				number += sequence[i_digit] * Math.pow(10, digit_countdown);
				if (digit_countdown === 0) {
					option.push(number);
					if (j >= gd_len) {
						break;
					}
					number = 0;
					digit_countdown = gd_opt[j];
					j += 1;
				}
			}
			grouped_digits_options_by_len[gd_len].push(option);
		}
	}
	return grouped_digits_options_by_len;
}


function get_solutions(sequence, desired_num, sol_limit) {
	var num_digits = sequence.length,
		grouped_digits_generic_options_by_len = get_grouped_digits_options(num_digits),
		grouped_digits_options_by_len = get_specific_grouped_digits(grouped_digits_generic_options_by_len, sequence),
		binary_grouping_generic_options_by_len = {1: [0]};
	for (var i = 2; i <= num_digits; i++) {
		var state = [];
		for (var j = 0; j < i; j++) {
			state.push(j);
		}
		binary_grouping_generic_options_by_len[i] = get_binary_grouping_options([state]);
	}
	var solutions = [];
	for (var l = 1; l <= num_digits; l++) {
		for (var i_bg = 0, bg_len = binary_grouping_generic_options_by_len[l].length, bg_opt; bg_opt = binary_grouping_generic_options_by_len[l][i_bg], i_bg < bg_len; i_bg++) {
			for (var i_gd = 0, i_gd_len = grouped_digits_options_by_len[l].length, gd_opt; gd_opt = grouped_digits_options_by_len[l][i_gd], i_gd < i_gd_len; i_gd++) {
				var binary_grouping = get_specific_binary_grouping(bg_opt, gd_opt),
					sols = eval_potential_solutions(binary_grouping, desired_num);
				for (var i_sol = 0, sols_len = Math.min(sols.length, sol_limit); i_sol < sols_len; i_sol++) {
					solutions.push(sols[i_sol]);
				}
				sol_limit -= sols_len;
				if(sol_limit === 0) {
					return solutions;
				}
			}
		}
	}
	return solutions;
}

var HumanPrinter = (function() {
	function get_readable_unary_op(unary_op, val) {
		var num_unary = UNARY_OPERATORS.length,
			fact_idx = UNARY_OPERATORS.indexOf('!'),
			print_res = val.toString(),
			comb_l = unary_op[0],
			n = unary_op[1];
		for (var t = 0; t < comb_l; t++) {
			var left_weight = Math.pow(num_unary, t + 1),
				right_weight = Math.pow(num_unary, t),
				unary_idx = Math.floor((n % left_weight - n % right_weight) / right_weight);
			if(unary_idx === fact_idx) {
				print_res = '(' + print_res + ')' + UNARY_OPERATORS[unary_idx];
			} else {
				print_res = UNARY_OPERATORS[unary_idx] + '(' + print_res + ')';
			}
		}
		return print_res;
	}

	function get_readable_solution(atom) {
		if (typeof atom === "number") {
			return atom.toString();
		} else if (atom.length === 2) {
			return get_readable_unary_op(atom[0], get_readable_solution(atom[1]));
		} else if (atom.length === 3) {
			return '(' + get_readable_solution(atom[1]) + BINARY_OPERATORS[atom[0]] + get_readable_solution(atom[2]) + ')';
		}
	}
	return {
		get_readable_unary_op: get_readable_unary_op,
		get_readable_solution: get_readable_solution
	};
})();

function set_unary_enabled_state(op_name, value) {
	unary_enabled[op_name] = value;
}
function set_binary_enabled_state(op_name, value) {
	binary_enabled[op_name] = value;
}
return {
	get_solutions: get_solutions,
	get_readable_solution: HumanPrinter.get_readable_solution,
	set_unary_enabled_state: set_unary_enabled_state,
	set_binary_enabled_state: set_binary_enabled_state
};
})();

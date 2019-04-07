import math
cache = {0: {0: [[]]}}# important: always initialize the cache this way!
def get_grouped_digits_options(end):
    global cache
    if end in cache:
        return cache[end]
    options_by_len = {}
    i = 1
    while i <= end:
        options_by_len[i] = []
        i += 1
    
    group_length = 1
    while group_length <= end:
        received_options_by_len = get_grouped_digits_options(end - group_length)
        for l in received_options_by_len:
            j = 0
            opts = received_options_by_len[l]
            opts_len = len(opts)
            while j < opts_len:
                opt = opts[j].copy()
                opt.append(group_length)
                options_by_len[l + 1].append(opt)
                j += 1
        group_length += 1
    cache[end] = options_by_len
    return options_by_len


def get_binary_grouping_options(digits_options):
    options = set()#[]
    queue = digits_options.copy()
    i = 0
    while len(queue) > 0:
        element = queue.pop()
        num_elements = len(element)
        if num_elements == 1:
            options.add(tuple(element[0]))#append(element)
        else:
            group_start = num_elements - 2
            while group_start >= 0:
                grouped_state = element.copy()
                second = grouped_state.pop(group_start + 1)
                grouped_state[group_start] = (grouped_state[group_start], second)
                queue.append(grouped_state)
                
                group_start -= 1
        i += 1
    return options

UNARY_OPERATORS = ['-', '√', '!']
import math
def unary_minus(a):
    return -a
def unary_sqrt(a):
    if a >= 0:
        return math.sqrt(a)
    return False
def unary_factorial(a):
    if a >= 0 and float(a).is_integer() and a <= 18:
        return math.factorial(a)
    return False
UNARY_OPERATIONS = [unary_minus, unary_sqrt, unary_factorial]
BINARY_OPERATORS = ['+', '*', '/', '^']
def binary_plus(a, b):
    return a + b
def binary_mult(a, b):
    return a * b
def binary_div(a, b):
    if b != 0:
        return a / b
    return False
def binary_pow(a, b):
    if ((a != 0 or b > 0) and float(b).is_integer()):
        if a < 0:
            if b == 0:
                return 1
            else:
                a_lower_boundary = -(2 ** (53 / b))
                if b > 0 or b < (-537/512):
                    a_upper_boundary = -(2 ** (-1074 / b))
                else:
                    a_upper_boundary = math.inf
                if a_lower_boundary < a and a < a_upper_boundary:
                    if b >= 1:
                        return a ** b
                elif a_upper_boundary < a and a < a_lower_boundary:
                    if b <= -1:
                        return a ** b
        elif a > 0:
            if a == 1:
                return 1
            else:
                b_boundary_upper = 53 / math.log2(a)
                b_boundary_lower = -1074 / math.log2(a)
                if a < 1:
                    if b > b_boundary_upper and b < b_boundary_lower:
                        return a ** b
                else:
                    if b < b_boundary_upper and b > b_boundary_lower:
                        return a ** b
    return False
BINARY_OPERATIONS = [binary_plus, binary_mult, binary_div, binary_pow]
MAX_UNARY_COMBO_LEN = 1
def get_binary_init_options(num_numbers):
    init_rising_digits_options = {}
    i = 1
    while i <= num_numbers:
        j = 0
        state = []
        while j < i:
            state.append(j)
            j += 1
        init_rising_digits_options[i] = state
        i += 1
    return init_rising_digits_options

def get_unary_operation_combos(MAX_COMBO_LEN):
    global UNARY_OPERATORS
    combos = {}
    num_unary = len(UNARY_OPERATORS)
    minus_adjacent_combo = UNARY_OPERATORS.index('-') * (num_unary + 1)
    unary_combo_len = 0
    contains_minus_adjacent_combo = False
    while unary_combo_len <= MAX_COMBO_LEN:
        combos[unary_combo_len] = set()
        n = (num_unary ** unary_combo_len) - 1
#  n ... number in (len(UNARY_OPERATORS))-ary positional numeral system,
#        where each digit represents one unary operator (more precisely, its index)
        contains_minus_adjacent_combo = False
        while n >= 0:
            j = unary_combo_len
            while j >= 2:
#  extracting two adjacent unary operators and checking if both of them are minus (-)
# (using positional numeral system tricks - extracting first *j* least significant digits
#  using modulo, then subtracting all digits whose weight is less than *j - 2*
#  and then shifting remaining two digits to the radix point so that testing equality
#  with the number xxxxx-- can be used)
                if ((n % (num_unary ** j)) - (n % (num_unary ** (j - 2)))) // (num_unary ** (j - 2)) == minus_adjacent_combo:
                    contains_minus_adjacent_combo = True
                    break
                j -= 1
            if contains_minus_adjacent_combo:
                contains_minus_adjacent_combo = False
            else:
                combos[unary_combo_len].add(n)#append(n)
            n -= 1
        unary_combo_len += 1
    return combos

unary_operation_combos = get_unary_operation_combos(MAX_UNARY_COMBO_LEN)

import time
def eval_potential_solutions(binary_grouping, desired_num):
    global UNARY_OPERATORS, UNARY_OPERATIONS, BINARY_OPERATORS, BINARY_OPERATIONS, unary_operation_combos
    num_unary = len(UNARY_OPERATORS)
    solutions = []
# solution format:
# (result,
#     (unary_combo,
#         (binary_idx,
#             (unary_combo, (binary_idx, (unary_combo, 1), (unary_combo, 2))),
#             (unary_combo, 3)
#         )
#     )
# )
# , where unary_combo = (length, n)
    if type(binary_grouping) is tuple:
        a = eval_potential_solutions(binary_grouping[0], False)
        b = eval_potential_solutions(binary_grouping[1], False)
        rslts = []
        for a_opt in a:
            for b_opt in b:
                i = len(BINARY_OPERATORS) - 1
                while i >= 0:
                    c = BINARY_OPERATIONS[i](a_opt[0], b_opt[0])
                    if c is False:
                        pass
                    else:
                        rslts.append((c, (i, a_opt[1], b_opt[1])))
                    i -= 1
    else:# treat it as real number
        rslts = [(binary_grouping, binary_grouping)]
    for rslt in rslts:
        for comb_l in unary_operation_combos:
            for n in unary_operation_combos[comb_l]:
                rslt_val = rslt[0]
                t = 0
                while t < comb_l:
                    unary_idx = ((n % (num_unary ** (t + 1))) - (n % (num_unary ** t))) // (num_unary ** t)
                    rslt_val = UNARY_OPERATIONS[unary_idx](rslt_val)
                    if rslt_val is False:
                        break
                    t += 1
                if rslt_val is False:
                    continue
                if desired_num is False or rslt_val == desired_num:
                    solutions.append((rslt_val, ((comb_l, n), rslt[1])))
    return solutions
def get_specific_binary_grouping(binary_grouping_generic, sequence):
    if type(binary_grouping_generic) is tuple:
        a = get_specific_binary_grouping(binary_grouping_generic[0], sequence)
        b = get_specific_binary_grouping(binary_grouping_generic[1], sequence)
        return (a, b)
    else:
        return sequence[binary_grouping_generic]

def get_specific_grouped_digits(grouped_digits_generic, sequence):
    num_digits = len(sequence)
    grouped_digits_options_by_len = {}
    for gd_len in grouped_digits_generic:
        grouped_digits_options_by_len[gd_len] = []
        for gd_opt in grouped_digits_generic[gd_len]:
            option = []
            digit_countdown = gd_opt[0]
            i_digit = 0
            j = 1
            number = 0
            while i_digit < num_digits:
                digit_countdown -= 1
                number += sequence[i_digit] * (10 ** digit_countdown)
                if digit_countdown == 0:
                    option.append(number)
                    if j >= gd_len:
                        break
                    number = 0
                    digit_countdown = gd_opt[j]
                    j += 1
                i_digit += 1
            grouped_digits_options_by_len[gd_len].append(option)
    return grouped_digits_options_by_len


def get_solutions(sequence, desired_num):
    num_digits = len(sequence)
    grouped_digits_generic_options_by_len = get_grouped_digits_options(num_digits)
    grouped_digits_options_by_len = get_specific_grouped_digits(grouped_digits_generic_options_by_len, sequence)
    
    binary_grouping_generic_options_by_len = {1: [0]}
    binary_grouping_options_by_len = {}
    i = 2
    while i <= num_digits:
        j = 0
        state = []
        while j < i:
            state.append(j)
            j += 1
        binary_grouping_generic_options_by_len[i] = get_binary_grouping_options([state])
        i += 1
    l = 1
    solutions = []
    while l <= num_digits:
        for bg_opt in binary_grouping_generic_options_by_len[l]:
            for gd_opt in grouped_digits_options_by_len[l]:
                binary_grouping = get_specific_binary_grouping(bg_opt, gd_opt)
                sols = eval_potential_solutions(binary_grouping, desired_num)
                if len(sols) > 0:
                    for sol in sols:
                        solutions.append(sol[1])
        l += 1
    return solutions


def get_readable_unary_op(unary_op, val):
    global UNARY_OPERATORS
    num_unary = len(UNARY_OPERATORS)
    fact_idx = UNARY_OPERATORS.index('!')
    t = 0
    print_res = str(val)

    comb_l = unary_op[0]
    n = unary_op[1]
    while t < comb_l:
        unary_idx = ((n % (num_unary ** (t + 1))) - (n % (num_unary ** t))) // (num_unary ** t)
        if unary_idx == fact_idx:
            print_res = '(' + print_res + ')' + UNARY_OPERATORS[unary_idx]
        else:
            print_res = UNARY_OPERATORS[unary_idx] + '(' + print_res + ')'
        t += 1
    return print_res

def get_readable_solution(atom):
    global BINARY_OPERATORS
    if type(atom) is int:
        return str(atom)
    elif len(atom) == 2:
        return get_readable_unary_op(atom[0], get_readable_solution(atom[1]))
    elif len(atom) == 3:
        return '(' + get_readable_solution(atom[1]) + BINARY_OPERATORS[atom[0]] + get_readable_solution(atom[2]) + ')'

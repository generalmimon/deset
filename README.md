# <img src="deset-logo.png" alt="Deset" width="200">
## Introduction
The goal of this project is to solve the task Deset. There are given 4 digits from 1 to 9, e.g. 1 2 5 2. The task is to fill in numerical operators (+, −, ×, ÷, √ and !) so that the result of the created expression is 10. All digits must be used. Changing order of the digits is not allowed (that would be too easy), but adjacent digits can be merged to multi-digit number.

For example, given the digits 2 1 4 4, desired result 10 and all operations allowed, a bunch of solutions are possible:
* <img src="https://latex.codecogs.com/gif.latex?-2&plus;\sqrt{144}=10" alt="-2+\sqrt{144}=10" />
* <img src="https://latex.codecogs.com/gif.latex?\sqrt{21&plus;4}\cdot\sqrt{4}=10" alt="\sqrt{21+4}\cdot\sqrt{4}=10" />
* <img src="https://latex.codecogs.com/gif.latex?(-21&plus;4!)!&plus;4=10" alt="(-21+4!)!+4=10" />
* <img src="https://latex.codecogs.com/gif.latex?(-2&plus;14)-\sqrt{4}=10" alt="(-2+14)-\sqrt{4}=10" />
* <img src="https://latex.codecogs.com/gif.latex?(2^1&plus;4)&plus;4=10" alt="(2^1+4)+4=10" />
* <img src="https://latex.codecogs.com/gif.latex?(2^1\cdot4)&plus;\sqrt4=10" alt="(2^1\cdot4)+\sqrt4=10" />
* <img src="https://latex.codecogs.com/gif.latex?-\frac{2}{1}&plus;\frac{4!}{\sqrt{4}}=10" alt="-\frac{2}{1}+\frac{4!}{\sqrt{4}}=10" />
* <img src="https://latex.codecogs.com/gif.latex?\sqrt{{((2&plus;1)!&plus;4)}^{\sqrt{4}}}=10" alt="\sqrt{{((2+1)!+4)}^{\sqrt{4}}}=10">
* <img src="https://latex.codecogs.com/gif.latex?\frac{2\cdot(1&plus;4)!}{4!}=10" alt="\frac{2\cdot(1+4)!}{4!}=10" />
* <img src="https://latex.codecogs.com/gif.latex?2^{1&plus;\sqrt{4}}&plus;\sqrt{4}=10" alt="2^{1+\sqrt{4}}+\sqrt{4}=10" />
... and many others.
## Algorithm
The algorithm can be used to find a solution with arbitrary number of given digits and any desired result (it's not hardcoded). It has 3 phases.
### Phase 1 - ``` get_grouped_digits_options(end) ```
This function returns all possible options, how can the adjacent digits be merged to a n-digit number. It accepts one argument ```end```, which is the number of digits we want to ask about. For all ```end```ings greater than 0, it gradually declare last _k_ (k = 1, 2, 3, ..., end) digits a one _k_-digit number and calls itself for merging options in the rest of the digit sequence (with an argument ```end - k```). To every returned option for sequence with length ```end - k``` is added the k-digit number.
For example, here is the diagram ```get_grouped_digits_options(4)``` (digits are marked as A, B, C, D):
```
│· · · ·│
 ├── │· · ·│D│
 │    ├── │· ·│C│
 │    │    ├── │·│B│
 │    │    │    └── │A│          → │A│B│C│D│
 │    │    └── │A B│             → │A B│C│D│
 │    ├── │·│B C│
 │    │    └── │A│               → │A│B C│D│
 │    └── │A B C│                → │A B C│D│
 ├── │· ·│C D│
 │    ├── │·│B│
 │    │    └── │A│               → │A│B│C D│
 │    └── │A B│                  → │A B│C D│
 ├── │·│B C D│
 │    └── │A│                    → │A│B C D│
 └── │A B C D│                   → │A B C D│
```
As you can see, function ```get_grouped_digits_options(4)``` returns 8 options. The diagram isn't absolutely accurate, there aren't shown the calls with the argument 0. It looks like that the function is called in total 8 times, but it's actually called 11 times.

The function returns the options sorted by amount of numbers (the "associative array" with the amount as a key and an array of options as a value). The option is an array, where the number a<sub>_i_</sub> at index _i_ is the number of digits of the _i_<sup>th</sup> number. For example, if the given digits are 1 2 3 4 5 6 7 8 and the option is ```[1, 4, 1, 2]```, the numbers which we'll be working with are ```[1, 2345, 6, 78]```. The function ```get_specific_grouped_digits``` takes generic options returned by ```get_grouped_digits_options``` and inserts given digits instead.
### Phase 2 - ``` get_binary_grouping_options(digits_options) ```

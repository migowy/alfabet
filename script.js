import { all_words } from "./words.js";

console.log(`Words loaded: ${all_words.length}`);

let all_letters = new Set("abcdefghijklmnoprstuwyz"); // "ąćęłńóśźż";

var filtered_words = [];

for (let [word, count] of all_words) {
    var prev = undefined;
    var valid = true;
    for (let c of word) {
	if (! all_letters.has(c)) {
	    valid = false;
	    break;
	}
	if (c == prev) {
	    valid = false;
	    break;
	}
	prev = c;
    }
    if (valid) {
	filtered_words.push([word, count]);
    }
}

// all_words = filtered_words;

console.log(`Filtered words: ${filtered_words.length}`);


// Preload the images
var preloaded = [];

for (let l of all_letters) {
    let img = new Image();
    img.src = `./img/${l}.png`;
    preloaded.push(img);
    console.log(`Preloaded alfabet/${l}.png`);
}


// `chars_by_level` contains, for each level, max number of letters 
// for words at this level
export const Levels = [
    {max_letters: 4, delay: 1000, label: "łatwy (3-4 litery)"},
    {max_letters: 6, delay: 700, label: "średni (5-6 liter)"},
    {max_letters: 9, delay: 400, label: "zaawansowany (7-9 liter)"},
    {max_letters: 12, delay: 300, label: "ekspert (10-12 liter)"}
];

let state = {
    level_no: 0,
};


// `words_by_level` contains, for each level, a map from words
// to their number of occurrences
var words_by_level = [];
// `count_by_level` contains, for each level, the total number
// of occurrences of words from this level
var count_by_level = [];


for (let _lvl in Levels) {
    words_by_level.push(new Map());
    count_by_level.push(0);
}   
for (let [word, cnt] of filtered_words) {
    let len_word = word.length;
    for (let lvl in Levels) {
        if (len_word <= Levels[lvl].max_letters) {
            words_by_level[lvl].set(word, cnt);
            count_by_level[lvl] += cnt
            break;
        }
    }
}

for (let level in Levels) {
    console.log(`Words at level ${level}: ${words_by_level[level].size}`);
    console.log(`Occurrences at level ${level}: ${count_by_level[level]}`);    
}


function choose_word(level) {
    var n = Math.floor(Math.random() * count_by_level[level]);
    var k = 0;
    for (let pair of words_by_level[level]) {
        let [word, cnt] = pair;
        if (k >= n) {
            return word;
        }
        k += cnt;
    }
    console.assert(false);
}


// State
var curr_word = undefined; // choose_word(words, 100);
var curr_index = 0;
var is_playing = false;
var timeout_id = undefined;
var score = 0;


function sign_img() {
    return document.getElementById("hands");
}


function user_input() {
    return document.getElementById("guess");
}


function stop_animation() {
    window.clearTimeout(timeout_id);
    sign_img().src = "./img/blank.png";
    is_playing = false;
}


function hide_emojis() {
    document.getElementById("correct").hidden = 1;
    document.getElementById("incorrect").hidden = 1;
}


function show_correct() {
    sign_img().hidden = 1;
    document.getElementById("correct").hidden = 0;
    document.getElementById("incorrect").hidden = 1;
}


function show_incorrect() {
    sign_img().hidden = 1;
    document.getElementById("correct").hidden = 1;
    document.getElementById("incorrect").hidden = 0;
}


function show_letter(l) {
    if (all_letters.has(l)) {
        sign_img().src = `./img/${l}.png`;
        sign_img().alt = l;
    }
    else {
        console.log(`No image for letter '${l}'`);
    }
}


function show_images() {
    // Display an image for the `curr_index`'s letter of `curr_word`.
    sign_img().hidden = 0;

    if (!is_playing) {
        return;
    }

    if (curr_index >= curr_word.length) {
        stop_animation();
        return;
    }

    show_letter(curr_word.charAt(curr_index));
    curr_index += 1;
    timeout_id = window.setTimeout(show_images, Levels[state.level_no].delay);
}


function blur_buttons() {
    for (let button of document.getElementsByClassName("pure-button")) {
	button.blur();
    }
}


// Exported functions ////////


export function new_word() {
    hide_emojis();
    blur_buttons();
    user_input().value = "";
    curr_word = choose_word(state.level_no);
    console.log(`Nowe słowo ${curr_word}, poziom: ${Levels[state.level_no].label}`);
    repeat_word();
}


export function repeat_word() {
    hide_emojis();
    blur_buttons();
    user_input().value = "";
    curr_index = 0;
    let delay = 0;
    if (is_playing) {
        stop_animation();
        delay = 200;
    }
    is_playing = true;
    setTimeout(show_images, delay);
}


export function check_word() {
    blur_buttons();
    let user_word = user_input().value.toLowerCase();
    stop_animation();
    for (let span of document.getElementsByClassName("answer")) {
	span.textContent = curr_word;
    }
    if (user_word == curr_word) {
	show_correct();
    }
    else {
	show_incorrect();
    }
}


export function reveal_word() {
    blur_buttons();
    if (curr_word != undefined) {
	user_input().value = curr_word;
    }
}


export function set_level(level_no) {
    state.level_no = level_no;
    let lvl_name = document.getElementById("level-name");
    if (lvl_name) {
        lvl_name.textContent = Levels[level_no].label;
    }
    console.log("state =", state);
    console.log("level_no =", state.level_no);
}


export function set_speed(speed_no) {
    state.speed_no = speed_no;
    console.log("state =", state);
    console.log("delay_no =", state.speed_no);
}

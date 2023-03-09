/*eslint no-unused-vars: "warn"*/

import { All_words } from "./words.js";
// export { check_word, new_word, repeat_word };

console.log(`Words loaded: ${All_words.length}`);

const CH_char = '©';
const RZ_char = '®';
const all_letters = 'abcdefghijklmnoprstuwyząćęłńóśźż';


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


const ommited = ['ź', 'ż', 'ch', 'sz', 'cz'];

for (let _lvl in Levels) {
    words_by_level.push(new Map());
    count_by_level.push(0);
}   
for (let pair of All_words) {
    let [word, cnt] = pair;
    var omit = false;
    // Ignore words that we cannot display
    for (var str of ommited) {
        if (word.includes(str)) {
            omit = true;
            break;
        }
    }
    if (omit) {
        continue;
    }
    // Replace 'ch' and 'rz' by a special characters
    word = word.replace('rz', RZ_char);
    word = word.replace('ch', CH_char);

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


function stop_animation() {
    window.clearTimeout(timeout_id);
    let img = sign_img();
    img.src = "./img/blank.png";
    img.style["margin-left"] = 0;
    img.style["margin-top"] = 0;
    is_playing = false;
}


// To describe circular movement:
const r = 25; 
const r3_2 = r * Math.sqrt(3) / 2;

const letter_animations = {
    'ą': [
        [0, 0], [r3_2, r * 0.5], [r3_2, r * 1.5],
        [0, r * 2], [-r3_2, r * 1.5], [-r3_2, r * 0.5],
    ],
    'ch': [[0, 0], [0, 12], [0, 24], [0, 36], [0, 48]],
    'ć': [[0, 0], [0, 12], [0, 24], [0, 36], [0, 48]],
    'ę': [
        [0, 0], [r3_2, r * 0.5], [r3_2, r * 1.5],
        [0, r * 2], [-r3_2, r * 1.5], [-r3_2, r * 0.5],
    ], 
    'h': [[0, 0], [0, 12], [0, 24], [0, 36], [0, 48]],
    'ł': [[15, 0], [0, 0], [-15, 0], [-30, 0], [-45, 0]],
    'ń': [[0, 0], [0, 12], [0, 24], [0, 36], [0, 48]],
    'ó': [[0, 0], [0, 12], [0, 24], [0, 36], [0, 48]],
    'ś': [[0, 0], [0, 12], [0, 24], [0, 36], [0, 48]],
    'z': [
        [0, 1], [18, 4], [36, 7], [54, 10], 
        [36, 40], [18, 70], 
        [0, 100], [18, 103], [36, 106], [54, 109]
    ],
    'rz': [
        [0, 1], [18, 4], [36, 7], [54, 10], 
        [36, 40], [18, 70], 
        [0, 100], [18, 103], [36, 106], [54, 109]
    ]
    // 'ź': 10
    // 'ż': 
}

function show_letter(l) {
    // For animated letter, return the minimal time needed
    // to display all the frames of the letter.
    // For non-animated letters return 0.

    if (l == RZ_char) {
        l = 'rz';
    } 
    else if (l == CH_char) {
        l = 'ch';
    }

    let img = sign_img();
    img.src = `./img/${l}.png`;
    img.alt = l;

    if (l in letter_animations) {
        let positions = letter_animations[l];
        img.style["margin-left"] = `${positions[0][0]}px`;
        img.style["margin-top"] = `${positions[0][1]}px`;

        let frameDelay = 50;  // 300 / positions.length;
        
        for (var i = 1; i < letter_animations[l].length; i++) {
            let pos = positions[i];
            window.setTimeout(
                function() {
                    img.style["margin-left"] = `${pos[0]}px`;
                    img.style["margin-top"] = `${pos[1]}px`;         
                },
                i * frameDelay
            );
    }

        return positions.length * frameDelay;
    }

    img.style["margin-left"] = 0;
    img.style["margin-top"] = 0;
    return 0;
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

    let min_time = show_letter(curr_word.charAt(curr_index));
    curr_index += 1;
    timeout_id = window.setTimeout(
        show_images, 
        Math.max(Levels[state.level_no].delay, min_time)
    );
}


function blur_buttons() {
    for (let button of document.getElementsByClassName("pure-button")) {
	button.blur();
    }
}


// Exported functions ////////


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


export function new_word() {
    blur_buttons();
    user_input().value = "";
    document.getElementById("new-word").blur();
    curr_word = choose_word(state.level_no);
    console.log(`Nowe słowo ${curr_word}, poziom: ${Levels[state.level_no].label}`);
    repeat_word();
}


function normalize(word) {
    return word.replace(RZ_char, 'rz').replace(CH_char, 'ch');
}


export function check_word() {
    blur_buttons();
    let user_word = user_input().value.trim().toLowerCase();
    stop_animation();
    for (let span of document.getElementsByClassName("answer")) {
	    span.textContent = normalize(curr_word);
    }
    if (user_word == normalize(curr_word)) {
	    show_correct();
    }
    else {
	    show_incorrect();
    }
}


export function reveal_word() {
    blur_buttons();
    if (curr_word != undefined) {
	    user_input().value = normalize(curr_word);
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

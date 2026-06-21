// ================= ELEMENTS =================

const input = document.getElementById("inputText");
const output = document.getElementById("outputText");

const language = document.getElementById("targetLanguage");

const historyBox = document.getElementById("history");
const phrasesBox = document.getElementById("phrases");

const themeBtn = document.getElementById("themeBtn");

const swapBtn = document.getElementById("swapBtn");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const speakInputBtn = document.getElementById("speakInput");
const speakOutputBtn = document.getElementById("speakOutput");

const languageSearch = document.getElementById("languageSearch");

const translationsCount = document.getElementById("translationsCount");
const charactersCount = document.getElementById("charactersCount");
const translationSpeed = document.getElementById("translationSpeed");
const wordCount = document.getElementById("wordCount");

// ================= STORAGE =================

let history =
JSON.parse(
localStorage.getItem("history")
) || [];

let translationCount =
parseInt(
localStorage.getItem("translationCount")
) || 0;

let timeout;

let translating = false;

let lastSpeed = 0;

// ================= VOICES =================

const voiceMap = {

en:"en-US",
hi:"hi-IN",
pa:"pa-IN",
ur:"ur-PK",
bn:"bn-BD",

gu:"gu-IN",
mr:"mr-IN",
ta:"ta-IN",
te:"te-IN",
ml:"ml-IN",
kn:"kn-IN",

fr:"fr-FR",
es:"es-ES",
de:"de-DE",

it:"it-IT",
pt:"pt-PT",
nl:"nl-NL",

ru:"ru-RU",
uk:"uk-UA",
pl:"pl-PL",

ar:"ar-SA",
tr:"tr-TR",
fa:"fa-IR",
he:"he-IL",

ja:"ja-JP",
ko:"ko-KR",

"zh-CN":"zh-CN",

th:"th-TH",
vi:"vi-VN",

id:"id-ID",
ms:"ms-MY",

el:"el-GR",

sv:"sv-SE",
fi:"fi-FI",

da:"da-DK",

no:"nb-NO"

};

// ================= QUICK PHRASES =================

const phrases=[

"Hello",

"Thank you",

"Good morning",

"How are you?",

"Where is the station?",

"I need help",

"What time is it?",

"How much does this cost?",

"Where is the airport?",

"Nice to meet you"

];

// ================= INITIALIZE =================

initialize();

function initialize(){

renderPhrases();

renderHistory();

loadTheme();

setupEvents();

updateStats();

}

// ================= EVENTS =================

function setupEvents(){

input.addEventListener(

"input",

()=>{

updateStats();

clearTimeout(timeout);

timeout=setTimeout(

translate,

300

);

}

);

language.addEventListener(

"change",

translate

);

if(languageSearch){

languageSearch.addEventListener(

"input",

filterLanguages

);

}

window.addEventListener(

"online",

()=>{

showToast(

"Online"

);

}

);

window.addEventListener(

"offline",

()=>{

showToast(

"Offline"

);

}

);

}

// ================= TRANSLATE =================

async function translate(){

const text=

input.value.trim();

if(!text){

output.value="";

lastSpeed=0;

updateStats();

return;

}

if(translating){

return;

}

translating=true;

output.value="Translating...";

try{

const response=

await fetch(

"/translate",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

text:text,

language:language.value

})

}

);

if(!response.ok){

throw new Error();

}

const data=

await response.json();

output.value=

data.translation;

lastSpeed=

data.speed || 0;

translationCount++;

localStorage.setItem(

"translationCount",

translationCount

);

saveHistory();

updateStats();

}

catch(error){

output.value=

"Translation failed.";

}

finally{

translating=false;

}

}

// ================= HISTORY =================

function saveHistory(){

if(

!input.value ||

!output.value ||

output.value==="Translating..." ||

output.value==="Translation failed."

){

return;

}

const item={

input:input.value,

output:output.value

};

history=

history.filter(

h=>

!(

h.input===item.input &&

h.output===item.output

)

);

history.unshift(item);

history=

history.slice(

0,

15

);

localStorage.setItem(

"history",

JSON.stringify(history)

);

renderHistory();

}

function renderHistory(){

historyBox.innerHTML="";

history.forEach(item=>{

const chip=

document.createElement(

"div"

);

chip.className=

"chip";

chip.textContent=

`${item.input} → ${item.output}`;

chip.onclick=()=>{

input.value=

item.input;

translate();

updateStats();

};

historyBox.appendChild(

chip

);

});

}

// ================= PHRASES =================

function renderPhrases(){

phrasesBox.innerHTML="";

phrases.forEach(text=>{

const chip=

document.createElement(

"div"

);

chip.className=

"chip";

chip.textContent=text;

chip.onclick=()=>{

input.value=text;

translate();

updateStats();

};

phrasesBox.appendChild(

chip

);

});

}

// ================= LANGUAGE SEARCH =================

function filterLanguages(){

if(!languageSearch){

return;

}

const search=

languageSearch.value.toLowerCase().trim();

const options=

language.options;

for(let option of options){

option.hidden=

!option.text.toLowerCase().includes(

search

);

}

}

// ================= COPY =================

copyBtn.onclick=()=>{

if(

!output.value ||

output.value==="Translating()" ||

output.value==="Translating..."

){

return;

}

navigator.clipboard.writeText(

output.value

);

showToast(

"Copied"

);

};

// ================= CLEAR =================

clearBtn.onclick=()=>{

input.value="";

output.value="";

lastSpeed=0;

updateStats();

};

// ================= SPEAK =================

speakInputBtn.onclick=()=>{

speak(

input.value,

"en"

);

};

speakOutputBtn.onclick=()=>{

speak(

output.value,

language.value

);

};

function speak(text,lang){

if(

!text ||

text==="Translating..." ||

text==="Translation failed."

){

return;

}

speechSynthesis.cancel();

const locale=

voiceMap[lang] ||

"en-US";

const voices=

speechSynthesis.getVoices();

let voice=

voices.find(

v=>

v.lang.toLowerCase()===

locale.toLowerCase()

);

if(!voice){

voice=

voices.find(

v=>

v.lang.startsWith(

locale.split("-")[0]

)

);

}

const utterance=

new SpeechSynthesisUtterance(

text

);

utterance.lang=locale;

utterance.rate=.95;

utterance.pitch=1;

utterance.volume=1;

if(voice){

utterance.voice=

voice;

}

speechSynthesis.speak(

utterance

);

}

// ================= THEME =================

function loadTheme(){

const saved=

localStorage.getItem(

"theme"

);

if(

saved==="light"

){

document.body.classList.add(

"light"

);

}

}

themeBtn.onclick=()=>{

document.body.classList.toggle(

"light"

);

localStorage.setItem(

"theme",

document.body.classList.contains(

"light"

)

?

"light"

:

"dark"

);

};

// ================= SWAP =================

swapBtn.onclick=()=>{

if(

!output.value ||

output.value==="Translating..." ||

output.value==="Translation failed."

){

return;

}

input.value=

output.value;

translate();

updateStats();

};

// ================= DASHBOARD =================

function updateStats(){

if(translationsCount){

translationsCount.textContent=

translationCount;

}

if(charactersCount){

charactersCount.textContent=

input.value.length;

}

if(wordCount){

const words=

input.value.trim()

? input.value.trim().split(/\s+/).length

: 0;

wordCount.textContent=

words;

}

if(translationSpeed){

translationSpeed.textContent=

`${lastSpeed}s`;

}

}

// ================= TOAST =================

function showToast(text){

console.log(text);

}

// ================= SHORTCUTS =================

document.addEventListener(

"keydown",

e=>{

if(

e.ctrlKey &&

e.key==="Enter"

){

e.preventDefault();

translate();

}

if(

e.ctrlKey &&

e.key.toLowerCase()==="l"

){

e.preventDefault();

input.value="";

output.value="";

lastSpeed=0;

updateStats();

}

if(

e.ctrlKey &&

e.key.toLowerCase()==="c"

){

if(output.value){

e.preventDefault();

navigator.clipboard.writeText(

output.value

);

}

}

}

);
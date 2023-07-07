/* eslint-disable no-unused-vars */
/* eslint-disable no-alert */
/* eslint linebreak-style: ["error", "windows"] */
/* eslint max-len: ["error", { "code": 128 }] */

const stack = ['0', '0', '0', '0']; /* стак клалькулятора . регистры T, Z, Y, X. */
const calcdisp = document.getElementById('calcdisplay');
const periodbtn = document.getElementById('periodbutton');
const negbtn = document.getElementById('negativebutton');
const invbtn = document.getElementById('inversebutton');
const sqrtbtn = document.getElementById('sqrtbutton');
const prcbtn = document.getElementById('percentbutton');
const noexpobtn = document.getElementById('noexpobutton');
const divbtn = document.getElementById('dividebutton');
const newbtn = document.getElementById('newbutton');


let periodFlag = false; /* флажок ввода/наличия дробной части. */
let negativeFlag = false; /* флажок ввода/наличия отрицательного числа. */
let cutflag = false; /* флажок режима удаления символов справа. */
let expoflag = false; /* флажок автоматического(!) вывода на "экран" в экспоненциальной(если не лезет)/десятичной форме. */
let newinputflag = true; /* флажок режима ввода чисел. устанавливается для ввода числа "заново" */
let percentflag = false; /* флажок рассчета процента , меняет режим работы '-', '+' и '*'. */
let noexpoflag = false; /* флажок ручного(!) контроля формы вывода числа. */
let rightsideflag = false; /* флажок вывода на экран , начиная с правого символа регистра X (последние 12 символов числа). */
let actionXYdone = false /* совершено арифмитическое действие над двумя регистрами. */
const displaydigits = 12; /* количесво разрядов "экрана" */
/* укоротители длинны строк кода =) */
const xpos = stack.length - 1
const ypos = stack.length - 2
/* укорачиватель кода */
function setbg (element , color) {element.style.backgroundColor = color}  

function displayinit() {
const displaydiv = document.getElementById("calcdisplay");
for (var i = displaydigits-1; i >= 0; i--) {
let digitdiv = document.createElement("div");
digitdiv.setAttribute("class" , "dispdigit");
digitdiv.setAttribute("id" , `d${i}`);
digitdiv.textContent = "";
displaydiv.appendChild(digitdiv);
}
}

displayinit(); /* добавление разрядов в "экран" калькулятора */
refresh(); /* обновление данных "экрана". */

function refresh() {
negative('check')
period('check')
zero('check')
projection()
colorize()
cutflag = false
}

function colorize() {
newinputflag ? setbg(newbtn , 'aquamarine') : setbg(newbtn , 'white')
percentflag ? setbg(prcbtn,'gray') : setbg(prcbtn,'white');
noexpoflag ? setbg(noexpobtn,'gray') : setbg(noexpobtn,'white');
stack[xpos] === '0'? setbg(invbtn,'gray') : setbg(invbtn,'white');
periodFlag ? setbg(periodbtn,'lightcoral') : setbg(periodbtn,'white');
negativeFlag ? setbg(negbtn,'lightcoral')  : setbg(negbtn,'white');
negativeFlag ? setbg(sqrtbtn,'gray') : setbg(sqrtbtn,'white');
(stack[ypos] === '0' && stack[xpos] !== '0') ? setbg(divbtn,'gray') : setbg(divbtn,'white');
}

function expo(x, f) {
return Number.parseFloat(x).toExponential(f);
}

function projection() {
console.log(`Состояние стэка ${stack}`)
let displayString
/* переключение на экспоненциальное отображение ИЗМЕНЕНО */

/* if (stack[xpos].length > displaydigits && !cutflag && !noexpoflag) { */
if (!cutflag && noexpoflag) {
expoflag = true
displayString = expo(stack[xpos],2)
} else {
expoflag = false
displayString = stack[xpos]
}

/* отображение левой или правой части числа ОТКЛЮЧЕНО */

let numberside
rightsideflag = false
/* displayString = stack[xpos] */
if (!rightsideflag) {
numberside = displayString.slice(0,displaydigits).split('').reverse()
} else {
numberside = displayString.slice(-displaydigits).split('').reverse()
}
for (i in numberside)
{
const currdigit = document.getElementById(`d${i}`)
currdigit.innerHTML = numberside[i]
}

/* очистка не занятых ячеек экрана */
for (let i = displaydigits - 1 ; i > displayString.length-1 ; i -- ) {
const currdigit = document.getElementById(`d${i}`)
currdigit.innerText = ''
}   
}

function zero(action) {
switch (action) {
case 'check' :
let junk1 = '-0' /* вот такое заменяем на ноль. */
if (stack[xpos].length === 2 && stack[xpos] === junk1) {
zero ('set')
negative ('check')
}
/* ноль не должен остаться на "экране" при вводе. */
if (stack[xpos][0] === '0' && !isNaN(Number(stack[xpos][1]))) {
stack[xpos] = stack[xpos].substring(1)
}
break;
case 'set' :
stack[xpos]='0'
break;
}
}

function cutone(str,pos) {
/* если не автоматическое экспоненциальное отображение включено или смотрим не на правую часть числа - исправить это , не удалять символ. */
if (expoflag || !rightsideflag) {
expoflag && (cutflag = true)
!rightsideflag && (rightsideflag = true)
projection()
return str
}

cutflag = true

if  (str.length > 1) {
str=str.slice(0,12)
const arr = str.split('')
const popped = arr.pop()
popped === '.' && period('remove')
return arr.join('')
} else {
return '0'
}

}

function period (action) {
switch (action) {
case 'set' :
/* установка знака дробной части. */
periodFlag = true
stack[xpos] = `${stack[xpos]}.`;
break;
case 'remove' :
/* вызывается при удалении знака дробной части только для изменения флага. */
periodFlag = false
break;
case 'check':
/* проверка на дробность (после вычислений). */
if (stack[xpos].includes('.') && !newinputflag) {
periodFlag = true
} else {
period ('remove')
}
break;
}
}

function negative(action) {
switch (action) {

case 'rotate' :
if (negativeFlag) {
/* если уже установлен флаг минуса , то снять , убрать знак. */
negativeFlag = false
stack[xpos]=stack[xpos].substring(1)
} else {
/* если не установлен знак минуса , то установить , но не на ноль. */
if (stack[xpos] !== '0') {
negativeFlag = true
stack[xpos] = `-${stack[xpos]}`
}
}
break;

case 'check' :
stack[xpos][0] === '-' ? negativeFlag = true : negativeFlag = false
break;

}
}

function shiftup () {
/* при выполнении операции : результат содержится в стаке Х , Y <-- Z < -- T = 0. */
for (let i = ypos ; i >= 1 ; i--) {
stack[i]=stack[i-1]
}
}

const swapElements = (array, index1, index2) => {
/* меняет местами два элемента. */
[array[index1], array[index2]] = [array[index2], array[index1]];
};

function calc(action) {
switch (action) {

case Number(action):

if (actionXYdone) {
stack.push(stack[xpos]);
stack.shift();
actionXYdone = false
}

rightsideflag = true

if (newinputflag) {
stack[xpos]='0'
newinputflag = false
}

stack[xpos] = stack[xpos] + action.toString();
refresh()
break;

case 'period':
rightsideflag = true
if (periodFlag === true) {break}

if (newinputflag) {
stack[xpos]='0'
newinputflag = false
}

period('set')
newinputflag=false
refresh()
break;

case 'shift':
stack.push(stack[xpos]);
stack.shift();
newinputflag = true
period('remove')
refresh();
break;

case 'pi':
period('remove')
stack[xpos] = Math.PI.toString()
newinputflag = false
refresh();
break;

case 'cleardisp':
period('remove')
zero('set')
refresh();
/* stack.fill('0',0,stack.length) */
break;

case 'del':
rightsideflag = true
!newinputflag && (stack[xpos] = cutone(stack[xpos],12))
refresh();
break;

case 'negative':
negative('rotate')
refresh();
break;

case 'multiinverse':
newinputflag = true
stack[xpos] != '0' && (stack[xpos] = (1/parseFloat(stack[xpos])).toString());
refresh();
break;

case 'square':
stack[xpos] = bigDecimal.multiply(stack[xpos], stack[xpos])
newinputflag = true
actionXYdone = true
refresh();
break;

case 'squareroot':
!negativeFlag && (stack[xpos] = (Math.sqrt(stack[xpos])).toString())
newinputflag = true
actionXYdone = true
refresh();
break;

case 'plus':
!percentflag && (stack[xpos] = bigDecimal.add(stack[xpos], stack[ypos]))
percentflag && (stack[xpos] = bigDecimal.add(stack[ypos], bigDecimal.multiply((parseFloat(stack[ypos])/100).toString() , stack[xpos]))) && (percentflag = !percentflag)
newinputflag = true
actionXYdone = true
shiftup ()
refresh();
break;

case 'minus':
!percentflag && (stack[xpos] = bigDecimal.subtract(stack[ypos], stack[xpos]))
percentflag && (stack[xpos] = bigDecimal.subtract(stack[ypos], bigDecimal.multiply((parseFloat(stack[ypos])/100).toString() , stack[xpos]))) && (percentflag = !percentflag)
newinputflag = true
actionXYdone = true
shiftup ()
refresh();
break;

case 'multiply':
newinputflag = true
!percentflag && (stack[xpos] = (bigDecimal.multiply(stack[xpos], stack[ypos])))
percentflag && (stack[xpos] = bigDecimal.multiply(stack[xpos], (parseFloat(stack[ypos])/100).toString())) && (percentflag = !percentflag)
actionXYdone = true
shiftup ()
refresh();
break;

case 'divide':
stack[ypos].toString() !== '0' && (stack[xpos] = (stack[ypos] / stack[xpos]).toString())
actionXYdone = true
shiftup ()
refresh();
break;

case 'percent':
percentflag=!percentflag
refresh();
break;

case 'swap':
swapElements(stack, xpos, ypos);
refresh();
break;

case 'expo':
rightsideflag = false
noexpoflag = !noexpoflag
refresh();
break;

case 'rotate':
newinputflag = true
stack.push(stack.shift()) /* кайф! */
refresh();
break;

default:
/* линтер пристаёт */
}
}

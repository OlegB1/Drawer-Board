const socket = io();
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

let startX, startY, mouseX, mouseY, colorPickerWidth, canvasWidth;
let red = 255;
let green = 255;
let blue = 255;
let opacity = 1;
let customColor = `rgba(${red},${green},${blue},${opacity})`;
let isDrow = false;
window.onload = () => {
    socket.emit('drawLine', 'start');
};

colorPickerWidth = window.innerWidth * 0.28 + 'px';
canvasWidth = window.innerWidth * 0.7 + 'px';

document.getElementsByClassName('color-picker')[0].style.width = colorPickerWidth;
document.getElementsByClassName("alphaimg")[0].style.background = customColor;

canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', '400');

canvas.style.background = '#AAA';
ctx.strokeStyle = customColor;
ctx.lineWidth = 10;

socket.on('drawLine', (data) => {
    if (data) {
        data.forEach(item => {
            ctx.beginPath();
            ctx.strokeStyle = item.color;
            ctx.moveTo(item.start.startX, item.start.startY);
            ctx.lineTo(item.and.mouseX, item.and.mouseY);
            ctx.stroke();
            ctx.closePath();
            ctx.stroke();
        })
    } else ctx.clearRect(0, 0, canvas.width, canvas.height);
});

mouseCordinate = (event) => {
    if (!isDrow) return;
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    let line = {start: {startX, startY}, and: {mouseX, mouseY}, color: customColor};
    socket.emit('drawLine', line);
    ctx.strokeStyle = customColor;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(mouseX, mouseY);
    ctx.closePath();
    ctx.stroke();
    startX = mouseX;
    startY = mouseY;

}

canvas.addEventListener('mousedown', (event) => {
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
    isDrow = true;
    this.addEventListener('mousemove', mouseCordinate)
});

window.addEventListener("mouseup", () => {
    isDrow = false;
});

document.querySelectorAll('input[type=range]').forEach((item) => {
    item.addEventListener('mousedown', () => {
        this.addEventListener('mousemove', setColor)
    });
})

document.querySelectorAll('input[type=range]').forEach((item) => {
    item.addEventListener("mouseup", () => {
        this.removeEventListener('mousemove', setColor);
    });
})
clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('drawLine', '');
};

setColor = (ev) => {
    if (ev.target.name == 'red') red = event.target.value;
    if (ev.target.name == 'green') green = event.target.value;
    if (ev.target.name == 'blue') blue = event.target.value;
    setCanvasStyle()
}

setCanvasStyle = () => {
    customColor = `rgba(${red},${green},${blue},${opacity})`;
    document.getElementsByClassName("alphaimg")[0].style.background = customColor;
}

let startX, startY, mouseX, mouseY, colorPickerWidth, canvasWidth;
let red = 255;
let green = 255;
let blue = 255;
let opacity = 1;
let isDrow = false;
let customColor = `rgba(${red},${green},${blue},${opacity})`;
let mouseCordinates = [];
let stage = 0;
const socket = io();
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
window.onload = () => {
    socket.emit('drawLine', 'getData');
};

document.getElementsByClassName("colorImg")[0].style.background = customColor;


canvasWidth = canvas.parentElement.offsetWidth * 0.95 + 'px';
canvasHeight = '500px';

canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

canvas.style.background = '#AAA';

ctx.strokeStyle = customColor;
ctx.lineWidth = 7;

socket.on('drawLine', (data) => {
    if (data.length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (stage) {
            data.splice(data.length - stage, stage);
        }
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                ctx.beginPath();
                ctx.strokeStyle = data[i][j].color;
                ctx.moveTo(data[i][j].start.startX, data[i][j].start.startY);
                ctx.lineTo(data[i][j].and.mouseX, data[i][j].and.mouseY);
                ctx.closePath();
                ctx.stroke();
            }
        }
    } else ctx.clearRect(0, 0, canvas.width, canvas.height);
});

mouseCordinate = (event) => {
    if (!isDrow) return;
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    let points = {start: {startX, startY}, and: {mouseX, mouseY}, color: customColor};
    mouseCordinates.push(points);
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
    canvas.addEventListener('mousemove', mouseCordinate);
});

window.addEventListener("mouseup", () => {
    if (!isDrow) {
        return;
    }
    if (isDrow) {
        if (mouseCordinates.length && !stage) {
            socket.emit('drawLine', mouseCordinates);
        } else {
            socket.emit('restore', {mouseCordinates: mouseCordinates, stage: stage});
        }
        isDrow = false;
        canvas.removeEventListener('mousemove', mouseCordinate);
        mouseCordinates = [];
        stage = 0;
    }
});

setColor = (ev) => {
    if (ev.name == 'red') {
        red = event.target.value;
    }
    if (ev.name == 'green') {
        green = event.target.value;
    }
    if (ev.name == 'blue') {
        blue = event.target.value;
    }
    setCanvasStyle();
};

setCanvasStyle = () => {
    customColor = `rgba(${red},${green},${blue},${opacity})`;
    document.getElementsByClassName("colorImg")[0].style.background = customColor;
};

clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('drawLine', '');
};

backStage = () => {
    stage++;
    socket.emit('drawLine', 'getData');
};

nextStage = () => {
    if (stage > 0) {
        stage--;
    }
    socket.emit('drawLine', 'getData');
};

saveCanvas = () => {
    let a = document.createElement('a');
    a.download = 'canvas.jpg';
    a.setAttribute('href', canvas.toDataURL());
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
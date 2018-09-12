let startX, startY, endX, endY, canvasWidth, rect;
let red = 255;
let green = 255;
let blue = 255;
let opacity = 1;
let isDraw = false;
let customColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
let mouseCordinates = [];
let stage = 0;
const socket = io();
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext("2d");
window.onload = () => {
    socket.emit('drawLine', 'getData');
};

document.getElementsByClassName("colorImg")[0].style.background = customColor;


canvasWidth = canvas.parentElement.offsetWidth - 30 + 'px';
canvasHeight = document.getElementsByClassName('color-picker')[0].offsetHeight + 'px';

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
            if (data[i].length >= 1 && data[i][0].end) {
                for (let j = 0; j < data[i].length; j++) {
                    drawLine(data[i][j].start.startX, data[i][j].start.startY,
                        data[i][j].end.endX, data[i][j].end.endY, data[i][j].color);
                }
            } else if (!data[i][0].end) {
                drawCircle(data[i][0].start.startX, data[i][0].start.startY, data[i][0].color);
            }
        }
    } else ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousedown', (event) => {
    rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
    isDraw = true;
    canvas.addEventListener('mousemove', mouseCordinate);
});

canvas.addEventListener('touchstart', (event) => {
    rect = canvas.getBoundingClientRect();
    startX = event.touches[0].clientX - rect.left;
    startY = event.touches[0].clientY - rect.top;
    isDraw = true;
    canvas.addEventListener('touchmove', mouseCordinate, false);
}, false);

window.addEventListener('touchend', (event) => {
    if (!isDraw) {
        return;
    }
    if (isDraw) {
        if (mouseCordinates.length && !stage) {
            document.body.style.overflowY = 'auto';
            if (mouseCordinates.length > 1) {
                socket.emit('drawLine', mouseCordinates);
            }
        } else if (!mouseCordinates.length) {
            document.body.style.overflowY = 'auto';
            drawCircle(startX, startY, customColor);
            mouseCordinates.push({start: {startX, startY}, color: customColor});
            socket.emit('drawLine', mouseCordinates);
        } else {
            socket.emit('restore', {mouseCordinates: mouseCordinates, stage: stage});
        }
        isDraw = false;
        canvas.removeEventListener('touchmove', mouseCordinate);
        mouseCordinates = [];
        stage = 0;
    }
});


window.addEventListener("mouseup", () => {
    if (!isDraw) {
        return;
    }
    if (isDraw) {
        if (mouseCordinates.length && !stage) {
            if (mouseCordinates.length > 1) {
                socket.emit('drawLine', mouseCordinates);
            }
        } else if (!mouseCordinates.length) {
            drawCircle(startX, startY, customColor);
            mouseCordinates.push({start: {startX, startY}, color: customColor});
            socket.emit('drawLine', mouseCordinates);
        } else {
            socket.emit('restore', {mouseCordinates: mouseCordinates, stage: stage});
        }
        isDraw = false;
        canvas.removeEventListener('mousemove', mouseCordinate);
        mouseCordinates = [];
        stage = 0;
    }
});

mouseCordinate = (event) => {
    if (event.type != 'touchmove') {
        endX = event.clientX - rect.left;
        endY = event.clientY - rect.top;
    }
    if (event.type == 'touchmove') {
        endX = event.touches[0].clientX - rect.left;
        endY = event.touches[0].clientY - rect.top;
        document.body.style.overflowY = 'hidden';
        event.preventDefault();
    }
    let point = {start: {startX, startY}, end: {endX, endY}, color: customColor};
    mouseCordinates.push(point);
    drawLine (startX, startY, endX, endY, customColor);
    [startX, startY] = [endX, endY];
};


drawCircle = (x, y, color) => {
    let radius = ctx.lineWidth / 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.lineWidth = 7;
};

drawLine = (startX, startY, endX, endY, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.closePath();
    ctx.stroke();
}

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
    customColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
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
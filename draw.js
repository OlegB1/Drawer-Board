let startX, startY, mouseX, mouseY, colorPickerWidth, canvasWidth;
let red = 255;
let green = 255;
let blue = 255;
let opacity = 1;
let isDrow = false;
let customColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
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


canvasWidth = canvas.parentElement.offsetWidth -30 + 'px';
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
            if (data[i].length >= 1 && data[i][0].and) {
                for (let j = 0; j < data[i].length; j++) {
                    ctx.beginPath();
                    ctx.strokeStyle = data[i][j].color;
                    ctx.moveTo(data[i][j].start.startX, data[i][j].start.startY);
                    ctx.lineTo(data[i][j].and.mouseX, data[i][j].and.mouseY);
                    ctx.closePath();
                    ctx.stroke();
                }
            } else if (!data[i][0].and) {
                drawCircle(data[i][0].start.startX, data[i][0].start.startY, data[i][0].color);
            }
        }
    } else ctx.clearRect(0, 0, canvas.width, canvas.height);
});

mouseCordinate = (event) => {
    event.preventDefault();
    if (event.type != 'touchmove'){
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    }
    if (event.type == 'touchmove'){
        mouseX = event.touches[0].clientX - rect.left;
        mouseY = event.touches[0].clientY - rect.top;
    }
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

canvas.addEventListener('mousedown', (event) => {
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
    isDrow = true;
    canvas.addEventListener('mousemove', mouseCordinate);
});

canvas.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX - rect.left;
    startY = event.touches[0].clientY - rect.top;
    isDrow = true;
    canvas.addEventListener('touchmove', mouseCordinate,false);
},false);

window.addEventListener('touchend', (event) => {
    if (!isDrow) {
        return;
    }
    if (isDrow) {
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
        isDrow = false;
        canvas.removeEventListener('touchmove', mouseCordinate);
        mouseCordinates = [];
        stage = 0;
    }
});


window.addEventListener("mouseup", () => {
    if (!isDrow) {
        return;
    }
    if (isDrow) {
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
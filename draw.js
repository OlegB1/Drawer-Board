(function () {
    const socket = io();
    const canvas = document.getElementsByTagName('canvas')[0];
    const ctx = canvas.getContext("2d");

    //.row margin 15px
    const canvasWidth = canvas.parentElement.offsetWidth - 30 + 'px';
    const canvasHeight = document.getElementsByClassName('color-picker')[0].offsetHeight + 'px';


    let startX, startY, endX, endY, rect;
    let red = 255;
    let green = 255;
    let blue = 255;
    let opacity = 1;
    let customColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;

    window.onload = () => {
        socket.emit('getData');
    };

    document.getElementsByClassName("colorImg")[0].style.background = customColor;

    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);

    canvas.style.background = '#AAA';

    ctx.strokeStyle = customColor;
    ctx.lineWidth = 7;

    //draw picture after page load
    socket.on('drawLine', coordinates => {
        if (coordinates.length) {
            coordinates.forEach(coordinate => draw(coordinate));
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousedown', event => {
        rect = canvas.getBoundingClientRect();
        startX = event.clientX - rect.left;
        startY = event.clientY - rect.top;
        canvas.addEventListener('mousemove', drawByCoordinate);
    });

    canvas.addEventListener('touchstart', event => {
        const option = false;
        event.preventDefault();
        rect = canvas.getBoundingClientRect();
        startX = event.touches[0].clientX - rect.left;
        startY = event.touches[0].clientY - rect.top;
        canvas.addEventListener('touchmove', drawByCoordinate, option);
    });

    window.addEventListener("mouseup", () => {
        canvas.removeEventListener('mousemove', drawByCoordinate);
    });

    window.addEventListener('touchend', () => {
        canvas.removeEventListener('touchmove', drawByCoordinate);
    });

    function drawByCoordinate(event) {
        if (event.type != 'touchmove') {
            endX = event.clientX - rect.left;
            endY = event.clientY - rect.top;
        }
        if (event.type == 'touchmove') {
            endX = event.touches[0].clientX - rect.left;
            endY = event.touches[0].clientY - rect.top;
        }
        const point = {
            start: {startX, startY},
            end: {endX, endY},
            color: customColor
        };
        sendCoordinateToServer(point);
        const start = {startX, startY};
        const end = {endX, endY};
        draw({start, end, customColor});
        [startX, startY] = [endX, endY];
    };

    function sendCoordinateToServer(point) {
        socket.emit('saveCoordinates', point);
    };

    function draw({start, end, color}) {
        if (end.endX) {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(start.startX, start.startY);
            ctx.lineTo(end.endX, end.endY);
            ctx.closePath();
            ctx.stroke();
            return;
        }
        drawCircle(start,color);
    };

    function drawCircle(start, color) {
        const anticlockwise = false;
        const startAngle = 0;
        const endAngle = 2 * Math.PI;
        const radius = ctx.lineWidth / 2;

        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, startAngle, endAngle, anticlockwise);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.lineWidth = 7;
    };

    window.setColor = event => {
        const {name, value} = event.target;
        switch (name) {
            case 'red' :
                red = value;
                break;
            case 'green' :
                green = value;
                break;
            default :
                blue = value;
                break;
        }
        setCanvasStyle();
    };

    function setCanvasStyle() {
        customColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        document.getElementsByClassName("colorImg")[0].style.background = customColor;
    };

    window.clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('saveCoordinates', '');
    };

    window.saveCanvas = () => {
        let a = document.createElement('a');
        a.download = 'canvas.jpg';
        a.setAttribute('href', canvas.toDataURL());
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}());

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const addTextBtn = document.getElementById('addTextBtn');
const fontSelect = document.getElementById('fontSelect');
const colorPicker = document.getElementById('colorPicker');
const sizeInput = document.getElementById('sizeInput');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const undoStackEl = document.getElementById('undoStack');
const redoStackEl = document.getElementById('redoStack');

let texts = [];
let undoStack = [];
let redoStack = [];
let isDragging = false;
let selectedText = null;
let offsetX, offsetY;

function saveState() {
    undoStack.push(JSON.stringify(texts));
    redoStack = [];
    updateStacksDisplay();
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify(texts));
        texts = JSON.parse(undoStack.pop());
        drawTexts();
        updateStacksDisplay();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify(texts));
        texts = JSON.parse(redoStack.pop());
        drawTexts();
        updateStacksDisplay();
    }
}

function updateStacksDisplay() {
    undoStackEl.innerHTML = undoStack.map((state, index) => 
        `<li>State ${undoStack.length - index}</li>`).join('');
    redoStackEl.innerHTML = redoStack.map((state, index) => 
        `<li>State ${redoStack.length - index}</li>`).join('');
}

function addText() {
    const text = textInput.value;
    const font = fontSelect.value;
    const color = colorPicker.value;
    const size = parseInt(sizeInput.value);

    saveState();
    texts.push({
        text,
        font,
        color,
        size,
        x: Math.random() * (canvas.width - 100),
        y: Math.random() * (canvas.height - 50)
    });

    drawTexts();
    textInput.value = '';
}

function drawTexts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    texts.forEach(t => {
        ctx.font = `${t.size}px ${t.font}`;
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
    });
}

function getTextAt(x, y) {
    for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        ctx.font = `${t.size}px ${t.font}`;
        const metrics = ctx.measureText(t.text);
        if (x >= t.x && x <= t.x + metrics.width &&
            y >= t.y - t.size && y <= t.y) {
            return t;
        }
    }
    return null;
}

function updateSelectedText() {
    if (selectedText) {
        saveState();
        selectedText.font = fontSelect.value;
        selectedText.color = colorPicker.value;
        selectedText.size = parseInt(sizeInput.value);
        drawTexts();
    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedText = getTextAt(x, y);
    if (selectedText) {
        isDragging = true;
        offsetX = x - selectedText.x;
        offsetY = y - selectedText.y;
        
        fontSelect.value = selectedText.font;
        colorPicker.value = selectedText.color;
        sizeInput.value = selectedText.size;
    } else {
        selectedText = null;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && selectedText) {
        const rect = canvas.getBoundingClientRect();
        selectedText.x = e.clientX - rect.left - offsetX;
        selectedText.y = e.clientY - rect.top - offsetY;
        drawTexts();
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        saveState();
    }
    isDragging = false;
});

addTextBtn.addEventListener('click', addText);
fontSelect.addEventListener('change', updateSelectedText);
colorPicker.addEventListener('input', updateSelectedText);
sizeInput.addEventListener('input', updateSelectedText);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

drawTexts();
updateStacksDisplay();
// Event listeners for save, load, and color change
document.getElementById('saveBtn').addEventListener('click', saveFile);
document.getElementById('loadBtn').addEventListener('click', loadFiles);

// Load files on page load
loadFiles(); // Add this line to load files when the app starts

async function saveFile() {
    const name = document.getElementById('fileName').value;
    const content = document.getElementById('editor').innerHTML;

    if (!name) {
        alert('Please enter a file name');
        return;
    }

    // Check if the file already exists by fetching all files first
    const response = await fetch('/api/files');
    const files = await response.json();
    const existingFile = files.find(file => file.name === name);

    let saveResponse;

    if (existingFile) {
        // If the file exists, send a PUT request to update it
        saveResponse = await fetch(`/api/files/${existingFile._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
    } else {
        // If the file does not exist, send a POST request to create it
        saveResponse = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content }),
        });
    }

    if (saveResponse.ok) {
        alert('File saved successfully!');
        loadFiles(); // Load files again to update the list
    } else {
        alert('Failed to save file');
    }
}


async function loadFiles() {
    const response = await fetch('/api/files');
    const files = await response.json();
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Clear the current file list

    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.onclick = () => loadFileContent(file);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = (e) => { e.stopPropagation(); deleteFile(file._id); };
        li.appendChild(deleteBtn);
        fileList.appendChild(li);
    });
}

async function loadFileContent(file) {
    document.getElementById('fileName').value = file.name;
    document.getElementById('editor').innerHTML = file.content;
}

async function deleteFile(id) {
    const response = await fetch(`/api/files/${id}`, { method: 'DELETE' });

    if (response.ok) {
        alert('File deleted successfully!');
        loadFiles(); // Reload the file list after deletion
    } else {
        alert('Failed to delete file');
    }
}

// Text editor style logic
const btns = document.querySelectorAll('button');
const btnsArray = Array.from(btns);

btnsArray.forEach(btn => {
    btn.addEventListener('click', () => {
        switch (btn.innerText) {
            case 'Bold':
                toggleStyle('bold');
                break;
            case 'Italic':
                toggleStyle('italic');
                break;
            case 'Underline':
                toggleStyle('underline');
                break;
            case 'Sup':
                toggleStyle('sup');
                break;
            case 'Sub':
                toggleStyle('sub');
                break;
            case 'Mark':
                toggleHighlight('yellow');
                break;
            case 'Font':
                toggleFontFamily()
                break;
            case 'Color':
                promptForColor(); // Call the function to prompt for a color
                break;
        
            default:
                break;
        }
    });
});

// Function to prompt user for a color and apply it
function promptForColor() {
    const userColor = prompt("Please enter a color (name, hex, or rgb):");

    if (userColor) {
        applyColor(userColor);
    } else {
        alert("No color entered.");
    }
}

// Function to apply the selected color to the highlighted text
function applyColor(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;

    // Create a span element to apply the color
    const span = document.createElement("span");

    // Check if the selected text already has the color applied
    const parentElement = range.startContainer.parentElement;
    if (parentElement.style.color === color) {
        // If the same color is applied, remove it (toggle off)
        parentElement.style.color = '';
    } else {
        // Apply the selected color
        span.style.color = color;
        range.deleteContents();
        span.textContent = selectedText;
        range.insertNode(span);
    }
}

// Function to toggle highlight
function toggleHighlight(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;

    const highlightColor = color;

    // Check if the selection already has highlight
    const parentElement = range.startContainer.parentElement;
    if (parentElement.style.backgroundColor === highlightColor) {
        // Remove highlight
        parentElement.style.backgroundColor = 'transparent';
    } else {
        // Apply highlight
        const span = document.createElement("span");
        span.style.backgroundColor = highlightColor;
        range.deleteContents();
        span.textContent = selectedText;
        range.insertNode(span);
    }
}

// Function to toggle styles (Bold, Italic, etc.)
function toggleStyle(style) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;

    const span = document.createElement("span");
    let hasStyle = false;

    const parentElement = range.startContainer.parentElement;
    if (parentElement.classList.contains(style)) {
        parentElement.classList.remove(style);
        hasStyle = true;
    } else {
        span.className = style;
    }

    range.deleteContents();
    if (hasStyle) {
        range.insertNode(document.createTextNode(selectedText));
    } else {
        span.textContent = selectedText;
        range.insertNode(span);
    }
}


function toggleFontFamily() {
    const userFont = prompt("Please enter one of the following font families:\n- sans-serif\n- serif\n- monospace\n- cursive\n- fantasy").toLowerCase();

    // List of valid font families
    const validFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];

    // Validate user input
    if (!validFonts.includes(userFont)) {
        alert("Invalid font choice. Please enter a valid font family.");
        return;
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    // Create a span for the selected text
    const span = document.createElement("span");
    
    // Remove previously applied font classes/styles
    const parentElement = range.startContainer.parentElement;
    parentElement.classList.remove('arima-beautiful', 'great-vibes-regular'); // Adjust as necessary

    // Apply the selected font family
    if (userFont === 'arima') {
        span.className = 'arima-beautiful';
    } else if (userFont === 'great-vibes-regular') {
        span.className = 'great-vibes-regular';
    } else {
        span.style.fontFamily = userFont; // Apply standard font families directly
    }

    // Delete the selected text and insert the new span
    range.deleteContents();
    span.textContent = selectedText;
    range.insertNode(span);
}


//This is the most current version
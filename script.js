const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileResolution = document.getElementById('fileResolution');
const fileType = document.getElementById('fileType');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const formatSelect = document.getElementById('formatSelect');
const keepAspectRatio = document.getElementById('keepAspectRatio');
const resizeBtn = document.getElementById('resizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const previewImage = document.getElementById('previewImage');
const previewResolution = document.getElementById('previewResolution');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const presetButtons = document.querySelectorAll('.preset-btn');

let originalImage = null;
let originalWidth = 0;
let originalHeight = 0;
let resizedImage = null;

dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('active');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('active');
    
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

presetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const width = button.getAttribute('data-width');
        const height = button.getAttribute('data-height');
        widthInput.value = width;
        heightInput.value = height;
        
        presetButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

widthInput.addEventListener('input', () => {
    if (keepAspectRatio.checked && originalWidth && originalHeight && widthInput.value) {
        const ratio = originalHeight / originalWidth;
        heightInput.value = Math.round(widthInput.value * ratio);
    }
});

heightInput.addEventListener('input', () => {
    if (keepAspectRatio.checked && originalWidth && originalHeight && heightInput.value) {
        const ratio = originalWidth / originalHeight;
        widthInput.value = Math.round(heightInput.value * ratio);
    }
});

resizeBtn.addEventListener('click', resizeImage);

downloadBtn.addEventListener('click', downloadImage);

resetBtn.addEventListener('click', resetApp);

function handleFile(file) {
    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            originalWidth = originalImage.width;
            originalHeight = originalImage.height;
            
            widthInput.value = originalWidth;
            heightInput.value = originalHeight;
            
            fileName.textContent = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileResolution.textContent = `${originalWidth} × ${originalHeight}`;
            fileType.textContent = file.type.split('/')[1].toUpperCase();
            
            fileInfo.classList.add('active');
            
            previewPlaceholder.style.display = 'none';
            previewImage.style.display = 'block';
            previewImage.src = e.target.result;
            previewResolution.textContent = `${originalWidth} × ${originalHeight}`;
            
            resizeBtn.disabled = false;
            
            showNotification('Image uploaded successfully');
        };
        originalImage.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function resizeImage() {
    if (!originalImage) return;
    
    const width = parseInt(widthInput.value) || originalWidth;
    const height = parseInt(heightInput.value) || originalHeight;
    
    if (width < 1 || height < 1) {
        showNotification('Please enter valid dimensions', 'error');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    ctx.drawImage(originalImage, 0, 0, width, height);
    
    let mimeType = 'image/png';
    switch (formatSelect.value) {
        case 'jpeg':
            mimeType = 'image/jpeg';
            break;
        case 'png':
            mimeType = 'image/png';
            break;
        case 'webp':
            mimeType = 'image/webp';
            break;
        case 'original':
            const fileExt = fileName.textContent.split('.').pop().toLowerCase();
            if (fileExt === 'jpg' || fileExt === 'jpeg') {
                mimeType = 'image/jpeg';
            } else if (fileExt === 'png') {
                mimeType = 'image/png';
            } else if (fileExt === 'webp') {
                mimeType = 'image/webp';
            }
            break;
    }
    
    const quality = formatSelect.value === 'jpeg' ? 0.92 : 0.8;
    resizedImage = canvas.toDataURL(mimeType, quality);
    
    previewImage.src = resizedImage;
    previewResolution.textContent = `${width} × ${height}`;
    
    downloadBtn.disabled = false;
    
    showNotification('Image resized successfully');
}

function downloadImage() {
    if (!resizedImage) return;
    
    const a = document.createElement('a');
    a.href = resizedImage;
    a.download = `conv-${widthInput.value}x${heightInput.value}.${getFileExtension(formatSelect.value)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification('Image downloaded successfully');
}

function resetApp() {
    fileInput.value = '';
    fileInfo.classList.remove('active');
    previewPlaceholder.style.display = 'flex';
    previewImage.style.display = 'none';
    previewImage.src = '';
    previewResolution.textContent = '-';
    widthInput.value = '';
    heightInput.value = '';
    formatSelect.value = 'original';
    keepAspectRatio.checked = true;
    resizeBtn.disabled = true;
    downloadBtn.disabled = true;
    
    presetButtons.forEach(btn => btn.classList.remove('active'));
    
    originalImage = null;
    originalWidth = 0;
    originalHeight = 0;
    resizedImage = null;
    
    showNotification('Application reset');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileExtension(format) {
    switch (format) {
        case 'jpeg': return 'jpg';
        case 'png': return 'png';
        case 'webp': return 'webp';
        case 'original': 
            if (!fileName.textContent) return 'png';
            return fileName.textContent.split('.').pop().toLowerCase();
        default: return 'png';
    }
}

function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    
    if (type === 'error') {
        notification.style.borderLeftColor = '#ff4757';
        notification.querySelector('i').className = 'fas fa-exclamation-circle';
    } else {
        notification.style.borderLeftColor = '#4ade80';
        notification.querySelector('i').className = 'fas fa-check-circle';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
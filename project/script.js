document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('imageUpload');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const breedSelector = document.getElementById('breedSelector');
  const resultsSection = document.getElementById('resultsSection');
  const resultImage = document.getElementById('resultImage');
  const heightValue = document.getElementById('heightValue');
  const lengthValue = document.getElementById('lengthValue');
  const scoreValue = document.getElementById('scoreValue');
  const saveBtn = document.getElementById('saveBtn');

  let selectedFile = null;

  // Drag & drop setup
  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#e8f4fc';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFileSelect(e.target.files[0]);
    }
  });

  function handleFileSelect(file) {
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    selectedFile = file;
    analyzeBtn.disabled = false;

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadArea.innerHTML = '<img src="'+e.target.result+'" style="max-width: 100%; max-height: 200px;">';
    };
    reader.readAsDataURL(file);
  }

  // Handle analysis
  analyzeBtn.addEventListener('click', () => {
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('breed', breedSelector.value);

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';

    fetch('/api/analyze', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showResults(data);
      } else {
        alert('Analysis failed. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Analysis failed. Please try again.');
    })
    .finally(() => {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze Image';
    });
  });

  function showResults(data) {
    resultImage.src = data.imageUrl;
    heightValue.textContent = data.measurements.height + ' cm';
    lengthValue.textContent = data.measurements.length + ' cm';
    scoreValue.textContent = data.measurements.score;

    resultImage.onload = function() {
      drawAnnotations();
    };

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  function drawAnnotations() {
    const canvas = document.getElementById('annotationCanvas');
    const img = document.getElementById('resultImage');

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;

    // Height line
    ctx.beginPath();
    ctx.moveTo(img.width * 0.3, img.height * 0.2);
    ctx.lineTo(img.width * 0.3, img.height * 0.8);
    ctx.stroke();

    // Length line
    ctx.beginPath();
    ctx.moveTo(img.width * 0.2, img.height * 0.5);
    ctx.lineTo(img.width * 0.8, img.height * 0.5);
    ctx.stroke();

    // Random keypoints
    ctx.fillStyle = '#e74c3c';
    for (let i = 0; i < 5; i++) {
      const x = img.width * (0.3 + Math.random() * 0.4);
      const y = img.height * (0.3 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fake "Save to BPA"
  saveBtn.addEventListener('click', () => {
    saveBtn.textContent = 'Saving...';
    setTimeout(() => {
      alert('Results successfully saved to Bharat Pashudhan App!');
      saveBtn.textContent = 'Save to BPA';
    }, 1500);
  });
});

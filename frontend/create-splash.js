const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createGradientSplash() {
  // Create canvas (splash screen dimensions)
  const canvas = createCanvas(1080, 1920); // Standard mobile resolution
  const ctx = canvas.getContext('2d');

  // Create gradient similar to reference image
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
  gradient.addColorStop(0, '#ffffff');        // White at top
  gradient.addColorStop(0.6, '#f8f9fa');      // Light gray
  gradient.addColorStop(1, '#007bff');        // Blue at bottom

  // Fill background with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Add bottom curved section (like in reference)
  ctx.beginPath();
  ctx.moveTo(0, 1200);
  ctx.quadraticCurveTo(540, 1100, 1080, 1200);
  ctx.lineTo(1080, 1920);
  ctx.lineTo(0, 1920);
  ctx.closePath();
  
  const bottomGradient = ctx.createLinearGradient(0, 1200, 0, 1920);
  bottomGradient.addColorStop(0, '#007bff');
  bottomGradient.addColorStop(1, '#0056b3');
  ctx.fillStyle = bottomGradient;
  ctx.fill();

  // Add logo placeholder (centered)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(440, 860, 200, 200); // Logo area

  // Add border around logo area
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 4;
  ctx.strokeRect(440, 860, 200, 200);

  // Add company text
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Gensoft', 540, 1150);

  ctx.fillStyle = '#7f8c8d';
  ctx.font = '24px Arial';
  ctx.fillText('ERP System', 540, 1190);

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, 'assets', 'splash.png');
  
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Gradient splash screen created:', outputPath);
}

// Check if canvas is available, if not provide fallback
try {
  createGradientSplash();
} catch (error) {
  console.log('⚠️ Canvas not available, using SVG fallback');
  console.log('Please install canvas: npm install canvas');
}
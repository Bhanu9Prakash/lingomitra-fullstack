import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage } from 'canvas';

async function generateOgImage() {
  console.log('Generating og-image.png...');
  
  // Define paths
  const svgPath = path.join(__dirname, '../client/public/social/og-image.svg');
  const outputPath = path.join(__dirname, '../client/public/social/og-image.png');
  
  // Create a canvas with the same dimensions as our OG image
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1200, 630);
  
  // Draw header rectangle
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(0, 0, 1200, 120);
  
  // Configure text styles
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 102px Nunito, Arial, sans-serif';
  ctx.fillText('LingoMitra', 60, 95);
  
  ctx.fillStyle = '#333333';
  ctx.font = '62px Nunito, Arial, sans-serif';
  ctx.fillText('Learn Languages the Smart Way', 60, 200);
  
  // Draw subtitle
  ctx.fillStyle = '#666666';
  ctx.font = '39px Arial, sans-serif';
  ctx.fillText('Master languages with interactive, pattern-based lessons.', 60, 550);
  ctx.fillText('Choose from German, Spanish, French, Chinese, Japanese, and Hindi.', 60, 600);

  // Save the canvas to a PNG file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`OG Image saved to: ${outputPath}`);
}

generateOgImage().catch(err => {
  console.error('Error generating OG image:', err);
});
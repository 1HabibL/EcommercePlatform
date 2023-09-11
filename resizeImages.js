// resizeImages.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to resize all images in a directory
async function resizeAllImages(inputDir, outputDir, width, height) {
  try {
    // Read the list of files in the input directory
    const files = await fs.promises.readdir(inputDir);

    // Loop through each file
    for (const file of files) {
      // Check if it's an image file (you can add more checks if needed)
      if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.webp')) {
        // Create the full paths for input and output
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);

        // Resize the image and save the resized image
        await sharp(inputPath)
          .resize(width, height)
          .toFile(outputPath);

        console.log('Image resized and saved successfully:', outputPath);
      }
    }
  } catch (error) {
    console.error('Error resizing images:', error);
  }
}

module.exports = { resizeAllImages };
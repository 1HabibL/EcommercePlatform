const { MongoClient, GridFSBucket } = require('mongodb');
const fs = require('fs');


const uri = 'mongodb+srv://commerce1:mongo@ecommerceproject.r3aj6ux.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function storeImage(filePath, fileName) {
  try {
    await client.connect();
    const db = client.db('store'); // Replace with your actual database name
    const bucket = new GridFSBucket(db);

    const readableStream = fs.createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(fileName);

    readableStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error storing image:', error);
  } finally {
    await client.close();
  }
}

async function retrieveImage(imageId, targetFilePath) {
  try {
    await client.connect();
    const db = client.db('store'); // Replace with your actual database name
    const bucket = new GridFSBucket(db);

    const downloadStream = bucket.openDownloadStream(imageId);
    const writeStream = fs.createWriteStream(targetFilePath);

    downloadStream.pipe(writeStream);

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
  } finally {
    await client.close();
  }
}

module.exports = {
  storeImage,
  retrieveImage,
};
const { ImagePool } = require('@squoosh/lib');
const { cpus } = require('os');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');

const imagePool = new ImagePool(1);

/**
 * Compresses an image buffer using mozjpeg.
 * @param {Buffer} buffer
 * @param {number} quality
 * @returns {Promise<Buffer>}
 */
async function compressImageBuffer(buffer, quality = 80) {
  const image = imagePool.ingestImage(buffer);

  await image.encode({
    mozjpeg: { quality },
  });

  const encoded = await image.encodedWith.mozjpeg;
  return Buffer.from(encoded.binary);
}

/**
 * Saves a buffer to disk.
 * @param {Buffer} buffer
 * @param {string} filePath
 * @returns {Promise<void>}
 */
async function saveImageToDisk(buffer, filePath) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, buffer);
}

/**
 * Deletes an image file.
 * @param {string} filePath
 * @returns {Promise<void>}
 */
async function deleteImage(filePath) {
  if (fs.existsSync(filePath)) {
    await fsp.unlink(filePath);
  }
}

/**
 * Renames or moves an image file.
 * @param {string} oldPath
 * @param {string} newPath
 * @returns {Promise<void>}
 */
async function renameImage(oldPath, newPath) {
  await fsp.mkdir(path.dirname(newPath), { recursive: true });
  await fsp.rename(oldPath, newPath);
}

/**
 * Reads an image file as buffer.
 * @param {string} filePath
 * @returns {Promise<Buffer>}
 */
async function readImageAsBuffer(filePath) {
  return await fsp.readFile(filePath);
}

module.exports = {
  compressImageBuffer,
  saveImageToDisk,
  deleteImage,
  renameImage,
  readImageAsBuffer,
};

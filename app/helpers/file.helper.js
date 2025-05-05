// fileUtils.js
const fs = require("fs");
const path = require("path");
const fsp = require("fs/promises");
const { v4: uuidv4 } = require("uuid");

/**
 * Generates a unique filename with UUID.
 * @param {string} originalFilename - Original filename to extract extension
 * @returns {string} Unique filename with original extension
 */
function generateUniqueFilename(originalFilename) {
  const fileExtension = path.extname(originalFilename);
  return `${uuidv4()}${fileExtension}`;
}

/**
 * Saves a buffer to disk.
 * @param {Buffer} buffer - File data
 * @param {string} filePath - Path where to save the file
 * @returns {Promise<boolean>} True if successful
 */
async function saveFileToDisk(buffer, filePath) {
  try {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, buffer);
    return true;
  } catch (error) {
    console.error("Error saving file to disk:", error);
    return false;
  }
}

/**
 * Deletes a file.
 * @param {string} filePath - Path of file to delete
 * @returns {Promise<boolean>} True if successful
 */
async function deleteFile(filePath) {
  try {
    if (await fileExists(filePath)) {
      await fsp.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Checks if a file exists.
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Renames or moves a file.
 * @param {string} oldPath - Current file path
 * @param {string} newPath - New file path
 * @returns {Promise<boolean>} True if successful
 */
async function moveFile(oldPath, newPath) {
  try {
    await fsp.mkdir(path.dirname(newPath), { recursive: true });
    await fsp.rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error("Error moving file:", error);
    return false;
  }
}

/**
 * Reads a file as buffer.
 * @param {string} filePath - Path of file to read
 * @returns {Promise<Buffer|null>} File buffer or null if file doesn't exist
 */
async function readFileAsBuffer(filePath) {
  try {
    if (await fileExists(filePath)) {
      return await fsp.readFile(filePath);
    }
    return null;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

/**
 * Gets file information.
 * @param {string} filePath - Path of file
 * @returns {Promise<Object|null>} Object with file stats or null if error
 */
async function getFileInfo(filePath) {
  try {
    if (await fileExists(filePath)) {
      const stats = await fsp.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isDirectory: stats.isDirectory(),
        extension: path.extname(filePath),
        filename: path.basename(filePath),
        path: filePath
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting file info:", error);
    return null;
  }
}

module.exports = {
  generateUniqueFilename,
  saveFileToDisk,
  deleteFile,
  fileExists,
  moveFile,
  readFileAsBuffer,
  getFileInfo
};

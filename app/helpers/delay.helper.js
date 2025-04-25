exports.delay = async (ms) => {
    // Return a new Promise
    return new Promise(resolve => {
      // Set a timeout that resolves the Promise after 'ms' milliseconds
      setTimeout(resolve, ms);
    });
  }
  
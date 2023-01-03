/**
 * 
 * @param {time in miliseconds} timeout 
 * @returns 
 */

export async function wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }
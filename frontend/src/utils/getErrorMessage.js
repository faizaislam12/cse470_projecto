// Turns an axios error into a clear, specific message instead of a vague
// generic one, so it's obvious whether the backend rejected the request
// (validation, wrong password, etc.) or the request never reached it
// (backend not running, wrong API URL, CORS block).
export const getErrorMessage = (err) => {
  if (err.response) {
    // The backend responded, so it has an opinion — use it.
    return err.response.data?.message || `Request failed (status ${err.response.status})`;
  }
  if (err.request) {
    // The request was sent but no response came back at all.
    return 'Could not reach the server. Is the backend running (npm run dev in /backend)? Check the browser console (F12) Network tab for details.';
  }
  return err.message || 'Something went wrong';
};

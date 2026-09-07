const messages = {
  "auth/email-already-in-use":
    "This email is already registered. Please login instead.",
  "auth/invalid-email": "That email address looks invalid.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/requires-recent-login":
    "This action needs a recent login. Please log out and back in, then try again.",
};

export const getAuthErrorMessage = (error) => {
  // Axios errors from our own API (network failure, 5xx, etc.) rather than
  // a Firebase Auth rejection — give a distinct, non-technical message.
  if (error?.isAxiosError || error?.response) {
    return (
      error.response?.data?.message ||
      "We couldn't reach the server. Please try again in a moment."
    );
  }

  return messages[error?.code] || error?.message || "Something went wrong.";
};

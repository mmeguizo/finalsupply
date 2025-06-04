import { onError } from "@apollo/client/link/error";

// Create a function that can be called from anywhere to handle unauthorized errors
export const handleUnauthorized = () => {
  // Clear cookies
  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  
  // Clear local storage
  localStorage.removeItem("session");
  
  // Clear session storage
  sessionStorage.clear();
  
  // Redirect to sign-in page
  window.location.href = '/sign-in';
};

// Create an error link that catches unauthorized errors
export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.message === 'Unauthorized') {
        console.log('Unauthorized error detected, redirecting to sign-in page');
        handleUnauthorized();
      }
    }
  }
});

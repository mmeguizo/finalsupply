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
export const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      // Add detailed logging to see which operation is failing
      console.log('🚨 GraphQL Error Details:', {
        message: err.message,
        operationName: operation.operationName,
        operationType: operation.query.definitions[0]?.kind,
        variables: operation.variables
      });
      
      if (err.message === 'Unauthorized') {
        console.log('❌ Unauthorized error detected, redirecting to sign-in page');
        console.log('🔍 Failed operation:', operation.operationName);
        handleUnauthorized();
      }
    }
  }
  
  if (networkError) {
    console.log('🌐 Network Error:', networkError);
  }
});

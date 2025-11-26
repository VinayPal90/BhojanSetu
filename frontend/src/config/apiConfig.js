// frontend/src/config/apiConfig.js

// **Zaroori Note:** Deploy hone par is URL ko badalna hoga.
const BASE_BACKEND_URL = 
  process.env.NODE_ENV === 'production'
    // FIX 1: Trailing slash remove kiya. 
    // FIX 2: Backend ke main API prefix '/api/v1' ko joda.
    ? 'https://bhojansetu-backend.onrender.com/api/v1' 
    : 'http://localhost:5000/api/v1'; 

// Humein sirf base URL chahiye abhi.
export default BASE_BACKEND_URL;

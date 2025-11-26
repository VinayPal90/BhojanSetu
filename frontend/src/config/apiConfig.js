// frontend/src/config/apiConfig.js

// **Zaroori Note:** Deploy hone par is URL ko badalna hoga.
const BASE_BACKEND_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://your-deployed-bhojansetu-api.com/api/v1' // <-- DEPLOYMENT URL
    : 'http://localhost:5000/api/v1'; // Local backend URL (Jaise humne backend mein set kiya tha)

// Humein sirf base URL chahiye abhi.
export default BASE_BACKEND_URL;
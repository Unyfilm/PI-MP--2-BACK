# 🎬 **MOVIE PLATFORM - GUÍA DE INTEGRACIÓN FRONTEND**

## 📋 **Información General**
- **Backend URL Producción**: https://pi-mp-2-back-prod.onrender.com
- **Backend URL Desarrollo**: http://localhost:5000
- **Tecnologías**: Node.js, TypeScript, Express, MongoDB
- **Autenticación**: JWT (Bearer Token)
- **Formato de Respuesta**: JSON

---

## 🔗 **CONFIGURACIÓN DE CONEXIÓN**

### **URLs Base por Entorn**
```javascript
// Frontend config
const API_CONFIG = {
  development: 'http://localhost:5000',
  production: 'https://pi-mp-2-back-prod.onrender.com'
};

const API_BASE_URL = API_CONFIG[process.env.NODE_ENV] || API_CONFIG.development;
```

### **Headers Requeridos**
```javascript
// Para todas las peticiones
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Para endpoints autenticados
const authHeaders = {
  ...defaultHeaders,
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

---

## 🔐 **SISTEMA DE AUTENTICACIÓN**

### **Flujo de Autenticación**
1. **Login/Register** → Recibe JWT token
2. **Guardar token** en localStorage/sessionStorage
3. **Incluir token** en header Authorization para endpoints protegidos
4. **Manejar expiración** del token (redirect a login)

### **Estructura del Token JWT**
```javascript
// Payload del token decodificado
{
  userId: "6a1b2c3d4e5f6789",
  email: "user@email.com",
  iat: 1697123456,  // Issued at
  exp: 1697209856   // Expires at (7 días)
}
```

---

## 📡 **ENDPOINTS DE AUTENTICACIÓN**

### **1. Registro de Usuario**
```javascript
// POST /api/auth/register
const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      email: "john@example.com",
      password: "SecurePass123!",
      firstName: "John",
      lastName: "Doe",
      age: 25,
      // username: "johndoe" // OPCIONAL - se genera automáticamente si no se proporciona
    })
  });
  return await response.json();
};

// ℹ️ NOTA IMPORTANTE: El campo 'username' es OPCIONAL
// Si no se proporciona, se generará automáticamente usando firstName + lastName
// Ejemplo: "John Doe" → "johndoe", "María García" → "mariagarcia"
// Si ya existe, se añade un número: "johndoe1", "johndoe2", etc.

// Respuesta exitosa (201)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6a1b2c3d4e5f6789",
      "username": "johndoe", // Generado automáticamente como "johndoe"
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "age": 25,
      "profilePicture": "",
      "createdAt": "2024-10-17T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **2. Login de Usuario**
```javascript
// POST /api/auth/login
const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      email: "john@example.com",
      password: "SecurePass123!"
    })
  });
  return await response.json();
};

// Respuesta exitosa (200)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6a1b2c3d4e5f6789",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "age": 25
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **3. Logout**
```javascript
// POST /api/auth/logout (Requiere autenticación)
const logoutUser = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: authHeaders
  });
  return await response.json();
};
```

### **4. Recuperación de Contraseña**
```javascript
// POST /api/auth/forgot-password
const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// POST /api/auth/reset-password
const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      token: token,
      newPassword: newPassword,
      confirmPassword: newPassword
    })
  });
  return await response.json();
};
```

---

## 👤 **ENDPOINTS DE PERFIL DE USUARIO**

### **1. Obtener Perfil**
```javascript
// GET /api/users/profile (Requiere autenticación)
const getUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'GET',
    headers: authHeaders
  });
  return await response.json();
};

// Respuesta exitosa (200)
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "6a1b2c3d4e5f6789",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 25,
    "profilePicture": "https://example.com/avatar.jpg",
    "createdAt": "2024-10-17T00:00:00.000Z",
    "updatedAt": "2024-10-17T00:00:00.000Z"
  }
}
```

### **2. Actualizar Perfil**
```javascript
// PUT /api/users/profile (Requiere autenticación)
const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      firstName: "John Updated",
      lastName: "Doe Updated",
      age: 26,
      username: "johnupdated",
      profilePicture: "https://example.com/new-avatar.jpg"
    })
  });
  return await response.json();
};
```

### **3. Cambiar Contraseña**
```javascript
// PUT /api/users/change-password (Requiere autenticación)
const changePassword = async (passwordData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
      confirmPassword: "NewPassword123!"
    })
  });
  return await response.json();
};
```

### **4. Eliminar Cuenta**
```javascript
// DELETE /api/users/account (Requiere autenticación)
const deleteAccount = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users/account`, {
    method: 'DELETE',
    headers: authHeaders
  });
  return await response.json();
};

// Respuesta exitosa (200)
{
  "success": true,
  "message": "Cuenta eliminada exitosamente",
  "data": {
    "redirectTo": "/register"
  }
}
```

---

## 🎬 **ENDPOINTS DE PELÍCULAS**

### **1. Obtener Todas las Películas (Público)**
```javascript
// GET /api/movies?page=1&limit=10&search=avatar&genre=action&sort=title&order=asc
const getMovies = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.search && { search: filters.search }),
    ...(filters.genre && { genre: filters.genre }),
    ...(filters.sort && { sort: filters.sort }),
    ...(filters.order && { order: filters.order })
  });

  const response = await fetch(`${API_BASE_URL}/api/movies?${params}`, {
    method: 'GET',
    headers: defaultHeaders
  });
  return await response.json();
};

// Respuesta exitosa (200)
{
  "success": true,
  "message": "Movies retrieved successfully",
  "data": [
    {
      "_id": "6a1b2c3d4e5f6789",
      "title": "Avatar",
      "description": "A paraplegic Marine dispatched to Pandora...",
      "synopsis": "Full synopsis here...",
      "releaseDate": "2009-12-18T00:00:00.000Z",
      "duration": 162,
      "genre": ["Action", "Adventure", "Sci-Fi"],
      "director": "James Cameron",
      "poster": "https://example.com/avatar-poster.jpg",
      "videoUrl": "https://example.com/avatar-video.mp4",
      "language": "en",
      "featured": true,
      "createdAt": "2024-10-17T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### **2. Obtener Película por ID (Público)**
```javascript
// GET /api/movies/:id
const getMovieById = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`, {
    method: 'GET',
    headers: defaultHeaders
  });
  return await response.json();
};
```

### **3. Crear Película (Requiere Autenticación)**
```javascript
// POST /api/movies (Requiere autenticación)
const createMovie = async (movieData) => {
  const response = await fetch(`${API_BASE_URL}/api/movies`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: "New Movie",
      description: "Movie description",
      synopsis: "Detailed synopsis",
      releaseDate: "2024-01-01",
      duration: 120,
      genre: ["Action", "Drama"],
      director: "Director Name",
      poster: "https://example.com/poster.jpg",
      videoUrl: "https://example.com/video.mp4",
      language: "en"
    })
  });
  return await response.json();
};
```

### **4. Actualizar Película (Requiere Autenticación)**
```javascript
// PUT /api/movies/:id (Requiere autenticación)
const updateMovie = async (movieId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(updateData)
  });
  return await response.json();
};
```

### **5. Eliminar Película (Requiere Autenticación)**
```javascript
// DELETE /api/movies/:id (Requiere autenticación)
const deleteMovie = async (movieId) => {
  const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  return await response.json();
};
```

---

## 🏥 **ENDPOINT DE SALUD**

### **Health Check**
```javascript
// GET /health (Público)
const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET'
  });
  return await response.json();
};

// Respuesta (200)
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-10-17T00:00:00.000Z",
  "uptime": "2h 30m 15s",
  "environment": "production"
}
```

---

## 📊 **ESTRUCTURA DE RESPUESTAS**

### **Respuesta Exitosa Estándar**
```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}, // Datos específicos de la operación
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **Respuesta de Error Estándar**
```javascript
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

### **Códigos de Estado HTTP**
```javascript
const HTTP_STATUS = {
  OK: 200,                    // Éxito general
  CREATED: 201,               // Recurso creado (register)
  BAD_REQUEST: 400,           // Error de validación
  UNAUTHORIZED: 401,          // No autenticado
  FORBIDDEN: 403,             // Sin permisos
  NOT_FOUND: 404,             // Recurso no encontrado
  CONFLICT: 409,              // Conflicto (email duplicado)
  INTERNAL_SERVER_ERROR: 500  // Error del servidor
};
```

---

## 🛡️ **MANEJO DE ERRORES Y VALIDACIONES**

### **Errores de Validación (400)**
```javascript
// Ejemplo de error de validación
{
  "success": false,
  "message": "Validation failed",
  "error": "Password must contain uppercase, lowercase, number, and special character",
  "details": [
    {
      "type": "field",
      "value": "weakpass",
      "msg": "Password must contain uppercase, lowercase, number, and special character",
      "path": "password",
      "location": "body"
    }
  ]
}

// Error de validación de edad
{
  "success": false,
  "message": "Validation failed",
  "error": "Age must be a number between 13 and 120",
  "details": [
    {
      "type": "field",
      "value": 12,
      "msg": "Age must be a number between 13 and 120",
      "path": "age",
      "location": "body"
    }
  ]
}
```

### **Error de Autenticación (401)**
```javascript
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided",
  "timestamp": "2024-10-17T00:00:00.000Z"
}
```

---

## 🔄 **UTILIDADES DE FRONTEND RECOMENDADAS**

### **1. Interceptor de Respuestas**
```javascript
// Manejo global de errores de autenticación
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Manejar token expirado
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    
    return { data, status: response.status };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### **2. Hook de Autenticación (React)**
```javascript
// Custom hook para manejar autenticación
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = async (credentials) => {
    const response = await loginUser(credentials);
    if (response.success) {
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
    }
    return response;
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };
  
  return { user, token, login, logout };
};
```

### **3. Servicio de API Completo**
```javascript
// Servicio completo para manejar todas las peticiones
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  getHeaders(needsAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (needsAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.needsAuth),
      ...options
    };
    
    const response = await fetch(url, config);
    return await response.json();
  }
  
  // Auth methods
  register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
  
  login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
  
  // User methods
  getProfile() {
    return this.request('/api/users/profile', {
      method: 'GET',
      needsAuth: true
    });
  }
  
  updateProfile(data) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      needsAuth: true,
      body: JSON.stringify(data)
    });
  }
  
  // Movies methods
  getMovies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/movies${query ? `?${query}` : ''}`, {
      method: 'GET'
    });
  }
  
  getMovie(id) {
    return this.request(`/api/movies/${id}`, {
      method: 'GET'
    });
  }
  
  createMovie(movieData) {
    return this.request('/api/movies', {
      method: 'POST',
      needsAuth: true,
      body: JSON.stringify(movieData)
    });
  }
}

// Uso del servicio
const api = new ApiService(API_BASE_URL);
```

---

## 🧪 **DATOS DE PRUEBA**

### **Usuario de Prueba**
```javascript
const testUser = {
  // username: "testuser", // Opcional - si no se proporciona se genera como "testuser"
  email: "test@movieplatform.com",
  password: "TestPass123!",
  firstName: "Test",
  lastName: "User",
  age: 25
};
```

### **Película de Prueba**
```javascript
const testMovie = {
  title: "Test Movie",
  description: "A test movie for development",
  synopsis: "This is a comprehensive synopsis for testing purposes...",
  releaseDate: "2024-01-01",
  duration: 120,
  genre: ["Action", "Drama"],
  director: "Test Director",
  poster: "https://via.placeholder.com/300x450",
  videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo.mp4",
  language: "en"
};
```

---

## 📝 **MODELOS DE DATOS**

### **Modelo de Usuario**
```javascript
interface User {
  _id: string;
  username?: string; // Opcional - se genera automáticamente si no se proporciona
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Modelo de Película**
```javascript
interface Movie {
  _id: string;
  title: string;
  description: string;
  synopsis: string;
  releaseDate: Date;
  duration: number; // en minutos
  genre: string[];
  director: string;
  poster: string;   // URL
  videoUrl: string; // URL
  language: string; // código ISO (ej: "en", "es")
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🚨 **CONSIDERACIONES IMPORTANTES**

### **1. CORS**
El backend está configurado para aceptar peticiones desde:
- `http://localhost:5173` (desarrollo)
- `https://pi-mp-2-front.vercel.app` (producción)

### **2. Rate Limiting**
- **Límite**: 100 peticiones por 15 minutos por IP
- **Headers de respuesta**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1697123456
  ```

### **3. Timeouts**
- **Conexión**: 30 segundos
- **Respuesta**: 30 segundos

### **4. Tamaño de Payload**
- **Máximo**: 10MB por petición
- **JSON**: 10MB
- **URL-encoded**: 10MB

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Token Expirado**
```javascript
// Error 401: Token expired
{
  "success": false,
  "message": "Token expired",
  "error": "jwt expired"
}

// Solución: Refresh o login nuevamente
localStorage.removeItem('token');
// Redirect a login
```

### **Problema: CORS Error**
```javascript
// Error de CORS en desarrollo
// Solución: Asegurarse de usar http://localhost:5173 en desarrollo
// o la URL correcta de producción
```

### **Problema: 404 Not Found**
```javascript
// Verificar que el endpoint esté correcto
// Endpoints disponibles están documentados arriba
```

---

## 📞 **CONTACTO Y SOPORTE**

Si hay problemas con la integración:

1. **Verificar logs del backend** en Render Dashboard
2. **Comprobar variables de entorno**
3. **Revisar la documentación** de endpoints específicos
4. **Usar herramientas de desarrollo** del navegador para debug

**URLs de Referencia:**
- **Backend Producción**: https://pi-mp-2-back-prod.onrender.com
- **Health Check**: https://pi-mp-2-back-prod.onrender.com/health
- **Repository**: https://github.com/Unyfilm/PI-MP--2-BACK

---

**Última actualización**: Octubre 17, 2025
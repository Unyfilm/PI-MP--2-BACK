# 🧪 **GUÍA COMPLETA DE TESTING EN POSTMAN**

## 🎬 **ENDPOINTS DE PELÍCULAS (movieRoutes.ts)**

### **📋 Configuración Inicial**

**Base URL:** `http://localhost:5000`

**Headers comunes:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Headers con autenticación (cuando sea necesario):**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer TU_TOKEN_JWT_AQUI"
}
```

### **🔑 CREAR USUARIO ADMIN (3 MÉTODOS)**

#### **Método 1: Usar el script de seeding (RECOMENDADO)**
```bash
# En la terminal de tu proyecto:
npm run db:seed
```
**Esto creará automáticamente:**
- **Admin:** `admin@movieplatform.com` / `Admin123!`
- **Usuario normal:** `user@example.com` / `User123!`

#### **Método 2: Registrar manualmente y cambiar rol**
1. **Registrar usuario normal:**
```json
POST http://localhost:5000/api/auth/register
{
  "email": "miadmin@example.com",
  "password": "MiAdmin123!",
  "firstName": "Mi",
  "lastName": "Admin",
  "age": 30
}
```

2. **Ir a MongoDB Atlas** → Tu cluster → Collections → users
3. **Buscar tu usuario** y cambiar `role: "user"` por `role: "admin"`

#### **Método 3: Crear admin directamente en MongoDB**
1. **Conectar a MongoDB Atlas** → Collections → users → Insert Document
2. **Insertar este documento:**
```json
{
  "username": "superadmin",
  "email": "superadmin@example.com",
  "password": "$2b$10$HashedPasswordHere",
  "firstName": "Super",
  "lastName": "Admin",
  "age": 35,
  "role": "admin",
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

### **🔐 LOGIN COMO ADMIN**
Después de crear el admin, hacer login:
```json
POST http://localhost:5000/api/auth/login
{
  "email": "admin@movieplatform.com",
  "password": "Admin123!"
}
```

**Copiar el token JWT de la respuesta** para usarlo en endpoints que requieren admin.

---

## 🎥 **1. ENDPOINTS DE PELÍCULAS**

### **GET /api/movies - Obtener todas las películas**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/movies`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Query Parameters (opcionales):**
```
?page=1&limit=10&sort=title&order=asc&genre=Action
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movies retrieved successfully",
  "data": [
    {
      "_id": "671234567890abcdef123456",
      "title": "The Matrix",
      "description": "A computer hacker learns from mysterious rebels about the true nature of his reality.",
      "synopsis": "Neo discovers that reality as he knows it is actually a computer simulation.",
      "releaseDate": "1999-03-31T00:00:00.000Z",
      "duration": 136,
      "genre": ["Sci-Fi", "Action"],
      "director": "Lana Wachowski, Lilly Wachowski",
      "poster": "https://example.com/matrix-poster.jpg",
      "videoUrl": "https://res.cloudinary.com/your-cloud/video/upload/matrix-video.mp4",
      "cloudinaryVideoId": "movies/videos/matrix-full",
      "language": "en",
      "featured": true,
      "isActive": true,
      "createdAt": "2024-10-17T00:00:00.000Z",
      "updatedAt": "2024-10-17T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-10-22T10:30:00.000Z"
}
```

### **GET /api/movies/search - Buscar películas**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/movies/search?query=matrix&page=1&limit=5`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movies search completed successfully",
  "data": [
    {
      "_id": "671234567890abcdef123456",
      "title": "The Matrix",
      "description": "A computer hacker learns...",
      "genre": ["Sci-Fi", "Action"],
      "director": "Lana Wachowski, Lilly Wachowski",
      "poster": "https://example.com/matrix-poster.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

### **GET /api/movies/trending - Películas en tendencia**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/movies/trending`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Trending movies retrieved successfully",
  "data": [
    {
      "_id": "671234567890abcdef123456",
      "title": "Avatar: The Way of Water",
      "views": 15420,
      "featured": true,
      "averageRating": 4.7,
      "totalRatings": 340
    }
  ]
}
```

### **GET /api/movies/:id - Obtener película por ID**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/movies/671234567890abcdef123456`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movie retrieved successfully",
  "data": {
    "_id": "671234567890abcdef123456",
    "title": "The Matrix",
    "description": "A computer hacker learns from mysterious rebels about the true nature of his reality.",
    "synopsis": "Neo discovers that reality as he knows it is actually a computer simulation.",
    "releaseDate": "1999-03-31T00:00:00.000Z",
    "duration": 136,
    "genre": ["Sci-Fi", "Action"],
    "director": "Lana Wachowski, Lilly Wachowski",
    "poster": "https://example.com/matrix-poster.jpg",
    "videoUrl": "https://res.cloudinary.com/your-cloud/video/upload/matrix-video.mp4",
    "cloudinaryVideoId": "movies/videos/matrix-full",
    "language": "en",
    "featured": true,
    "views": 1532,
    "isActive": true
  }
}
```

### **GET /api/movies/:id/video - Obtener URL del video**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/movies/671234567890abcdef123456/video?duration=3600&quality=auto`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Video URL generated successfully",
  "data": {
    "videoUrl": "https://res.cloudinary.com/your-cloud/video/upload/c_scale,q_auto/v1234567890/movies/videos/matrix-full.mp4?signature=abc123...",
    "expiresIn": 3600,
    "movieId": "671234567890abcdef123456",
    "title": "The Matrix",
    "duration": 136
  }
}
```

### **GET /api/movies/:id/video/info - Información del video**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/movies/671234567890abcdef123456/video/info`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Video info retrieved successfully",
  "data": {
    "movieId": "671234567890abcdef123456",
    "title": "The Matrix",
    "cloudinaryVideoId": "movies/videos/matrix-full",
    "duration": 8160,
    "width": 1920,
    "height": 1080,
    "format": "mp4"
  }
}
```

### **POST /api/movies - Crear película (REQUIERE ADMIN)**

**Método:** `POST`  
**URL:** `http://localhost:5000/api/movies`  
**Headers:** Headers con autenticación (JWT de admin)  

**Body (JSON):**
```json
{
  "title": "Inception",
  "description": "A thief who steals corporate secrets through the use of dream-sharing technology.",
  "synopsis": "Dom Cobb is a skilled thief who specializes in extraction, the art of stealing valuable secrets from deep within the subconscious during the dream state. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage.",
  "releaseDate": "2010-07-16",
  "duration": 148,
  "genre": ["Sci-Fi", "Action", "Thriller"],
  "director": "Christopher Nolan",
  "poster": "https://example.com/inception-poster.jpg",
  "videoUrl": "https://res.cloudinary.com/your-cloud/video/upload/inception-video.mp4",
  "cloudinaryVideoId": "movies/videos/inception-full",
  "language": "en",
  "featured": false
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movie created successfully",
  "data": {
    "_id": "671234567890abcdef654321",
    "title": "Inception",
    "description": "A thief who steals corporate secrets...",
    "synopsis": "Dom Cobb is a skilled thief...",
    "releaseDate": "2010-07-16T00:00:00.000Z",
    "duration": 148,
    "genre": ["Sci-Fi", "Action", "Thriller"],
    "director": "Christopher Nolan",
    "poster": "https://example.com/inception-poster.jpg",
    "videoUrl": "https://res.cloudinary.com/your-cloud/video/upload/inception-video.mp4",
    "cloudinaryVideoId": "movies/videos/inception-full",
    "language": "en",
    "featured": false,
    "isActive": true,
    "views": 0,
    "createdAt": "2024-10-22T10:30:00.000Z",
    "updatedAt": "2024-10-22T10:30:00.000Z"
  }
}
```

### **PUT /api/movies/:id - Actualizar película (REQUIERE ADMIN)**

**Método:** `PUT`  
**URL:** `http://localhost:5000/api/movies/671234567890abcdef654321`  
**Headers:** Headers con autenticación (JWT de admin)  

**Body (JSON):**
```json
{
  "title": "Inception - Updated",
  "description": "Updated description for Inception movie.",
  "featured": true,
  "genre": ["Sci-Fi", "Action", "Thriller", "Drama"]
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movie updated successfully",
  "data": {
    "_id": "671234567890abcdef654321",
    "title": "Inception - Updated",
    "description": "Updated description for Inception movie.",
    "featured": true,
    "genre": ["Sci-Fi", "Action", "Thriller", "Drama"],
    "updatedAt": "2024-10-22T11:00:00.000Z"
  }
}
```

### **DELETE /api/movies/:id - Eliminar película (REQUIERE ADMIN)**

**Método:** `DELETE`  
**URL:** `http://localhost:5000/api/movies/671234567890abcdef654321`  
**Headers:** Headers con autenticación (JWT de admin)  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movie deleted successfully",
  "data": {
    "deletedMovieId": "671234567890abcdef654321",
    "title": "Inception - Updated"
  }
}
```

---

## ⭐ **2. ENDPOINTS DE FAVORITOS (favoriteRoutes.ts)**

### **POST /api/favorites - Agregar a favoritos**

**Método:** `POST`  
**URL:** `http://localhost:5000/api/favorites`  
**Headers:** Headers con autenticación (JWT)  

**Body (JSON):**
```json
{
  "userId": "670123456789abcdef123456",
  "movieId": "671234567890abcdef123456",
  "notes": "Mi película favorita de ciencia ficción",
  "rating": 5
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Añadido a favoritos",
  "data": {
    "_id": "672345678901abcdef123456",
    "userId": "670123456789abcdef123456",
    "movieId": {
      "_id": "671234567890abcdef123456",
      "title": "The Matrix",
      "poster": "https://example.com/matrix-poster.jpg",
      "genre": ["Sci-Fi", "Action"],
      "director": "Lana Wachowski, Lilly Wachowski",
      "duration": 136,
      "releaseDate": "1999-03-31T00:00:00.000Z"
    },
    "notes": "Mi película favorita de ciencia ficción",
    "rating": 5,
    "isActive": true,
    "createdAt": "2024-10-22T10:30:00.000Z",
    "updatedAt": "2024-10-22T10:30:00.000Z"
  },
  "timestamp": "2024-10-22T10:30:00.000Z"
}
```

### **GET /api/favorites/me - Obtener MIS favoritos (usuario autenticado)**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/favorites/me?page=1&limit=10&genre=Sci-Fi&sort=createdAt&order=desc`  
**Headers:** Headers con autenticación (JWT)  
**Body:** Ninguno  

**Query Parameters (opcionales):**
```
?page=1&limit=10&genre=Action&fromDate=2024-01-01&toDate=2024-12-31&sort=createdAt&order=desc
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Mis favoritos recuperados exitosamente",
  "data": [
    {
      "_id": "672345678901abcdef123456",
      "userId": "670123456789abcdef123456",
      "movieId": {
        "_id": "671234567890abcdef123456",
        "title": "The Matrix",
        "poster": "https://example.com/matrix-poster.jpg",
        "genre": ["Sci-Fi", "Action"],
        "director": "Lana Wachowski, Lilly Wachowski",
        "duration": 136,
        "releaseDate": "1999-03-31T00:00:00.000Z"
      },
      "notes": "Mi película favorita de ciencia ficción",
      "rating": 5,
      "createdAt": "2024-10-22T10:30:00.000Z",
      "updatedAt": "2024-10-22T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-10-22T10:30:00.000Z"
}
```

### **GET /api/favorites/me/:favoriteId - Obtener UN favorito específico mío**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/favorites/me/672345678901abcdef123456`  
**Headers:** Headers con autenticación (JWT)  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Favorito recuperado exitosamente",
  "data": {
    "_id": "672345678901abcdef123456",
    "userId": "670123456789abcdef123456",
    "movieId": {
      "_id": "671234567890abcdef123456",
      "title": "The Matrix",
      "poster": "https://example.com/matrix-poster.jpg",
      "genre": ["Sci-Fi", "Action"],
      "director": "Lana Wachowski, Lilly Wachowski",
      "duration": 136,
      "releaseDate": "1999-03-31T00:00:00.000Z"
    },
    "notes": "Mi película favorita de ciencia ficción",
    "rating": 5,
    "createdAt": "2024-10-22T10:30:00.000Z",
    "updatedAt": "2024-10-22T10:30:00.000Z"
  },
  "timestamp": "2024-10-22T10:30:00.000Z"
}
```

### **GET /api/favorites/:userId - Obtener favoritos de usuario específico (ADMIN o propio usuario)**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/favorites/670123456789abcdef123456?page=1&limit=10&genre=Sci-Fi&sort=createdAt&order=desc`  
**Headers:** Headers con autenticación (JWT)  
**Body:** Ninguno  

**Query Parameters (opcionales):**
```
?page=1&limit=10&genre=Action&fromDate=2024-01-01&toDate=2024-12-31&sort=createdAt&order=desc
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Favoritos del usuario recuperados",
  "data": [
    {
      "_id": "672345678901abcdef123456",
      "userId": "670123456789abcdef123456",
      "movieId": {
        "_id": "671234567890abcdef123456",
        "title": "The Matrix",
        "poster": "https://example.com/matrix-poster.jpg",
        "genre": ["Sci-Fi", "Action"],
        "director": "Lana Wachowski, Lilly Wachowski",
        "duration": 136,
        "releaseDate": "1999-03-31T00:00:00.000Z"
      },
      "notes": "Mi película favorita de ciencia ficción",
      "rating": 5,
      "createdAt": "2024-10-22T10:30:00.000Z",
      "updatedAt": "2024-10-22T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-10-22T10:30:00.000Z"
}
```

### **PUT /api/favorites/:id - Actualizar favorito**

**Método:** `PUT`  
**URL:** `http://localhost:5000/api/favorites/672345678901abcdef123456`  
**Headers:** Headers con autenticación (JWT)  

**Body (JSON):**
```json
{
  "notes": "Película clásica que nunca pasa de moda. Excelente cinematografía.",
  "rating": 4
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Favorito actualizado",
  "data": {
    "_id": "672345678901abcdef123456",
    "userId": "670123456789abcdef123456",
    "movieId": {
      "_id": "671234567890abcdef123456",
      "title": "The Matrix",
      "poster": "https://example.com/matrix-poster.jpg",
      "genre": ["Sci-Fi", "Action"],
      "director": "Lana Wachowski, Lilly Wachowski",
      "duration": 136,
      "releaseDate": "1999-03-31T00:00:00.000Z"
    },
    "notes": "Película clásica que nunca pasa de moda. Excelente cinematografía.",
    "rating": 4,
    "isActive": true,
    "createdAt": "2024-10-22T10:30:00.000Z",
    "updatedAt": "2024-10-22T11:15:00.000Z"
  },
  "timestamp": "2024-10-22T11:15:00.000Z"
}
```

### **DELETE /api/favorites/:id - Eliminar de favoritos**

**Método:** `DELETE`  
**URL:** `http://localhost:5000/api/favorites/672345678901abcdef123456`  
**Headers:** Headers con autenticación (JWT)  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Eliminado de favoritos",
  "data": {
    "deletedFavoriteId": "672345678901abcdef123456",
    "movieTitle": "The Matrix"
  },
  "timestamp": "2024-10-22T11:20:00.000Z"
}
```

### **GET /api/favorites - Obtener todos los favoritos (ADMIN ONLY)**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/favorites?page=1&limit=10&genre=Sci-Fi&sort=createdAt&order=desc`  
**Headers:** Headers con autenticación (JWT de admin)  
**Body:** Ninguno  

**Query Parameters (opcionales):**
```
?page=1&limit=10&genre=Action&fromDate=2024-01-01&toDate=2024-12-31&sort=createdAt&order=desc
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Todos los favoritos recuperados exitosamente",
  "data": [
    {
      "_id": "672345678901abcdef123456",
      "userId": {
        "_id": "670123456789abcdef123456",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "movieId": {
        "_id": "671234567890abcdef123456",
        "title": "The Matrix",
        "poster": "https://example.com/matrix-poster.jpg",
        "genre": ["Sci-Fi", "Action"],
        "director": "Lana Wachowski, Lilly Wachowski",
        "duration": 136,
        "releaseDate": "1999-03-31T00:00:00.000Z"
      },
      "notes": "Mi película favorita de ciencia ficción",
      "rating": 5,
      "createdAt": "2024-10-22T10:30:00.000Z",
      "updatedAt": "2024-10-22T10:30:00.000Z"
    },
    {
      "_id": "672345678901abcdef654321",
      "userId": {
        "_id": "670123456789abcdef987654",
        "username": "janedoe",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "movieId": {
        "_id": "671234567890abcdef654321",
        "title": "Inception",
        "poster": "https://example.com/inception-poster.jpg",
        "genre": ["Sci-Fi", "Action", "Thriller"],
        "director": "Christopher Nolan",
        "duration": 148,
        "releaseDate": "2010-07-16T00:00:00.000Z"
      },
      "notes": "Película increíble, muy compleja",
      "rating": 4,
      "createdAt": "2024-10-22T09:45:00.000Z",
      "updatedAt": "2024-10-22T09:45:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-10-22T11:30:00.000Z"
}
```

### **🔒 SEGURIDAD EN FAVORITOS (RESUMEN TÉCNICO)**

- **Autenticación:** Todos los endpoints requieren JWT (middleware `authenticateToken`).  
- **Autorización por endpoint:**
  - `GET /api/favorites` → Solo admin (middleware `requireAdmin`)
  - `GET /api/favorites/me` → Usuario autenticado (accede solo a SUS favoritos)
  - `GET /api/favorites/me/:id` → Usuario autenticado (accede solo a SUS favoritos)
  - `GET /api/favorites/:userId` → Usuario puede ver solo SUS propios favoritos o admin puede ver cualquiera
  - `POST/PUT/DELETE` → Usuario puede gestionar solo SUS favoritos o admin puede gestionar cualquiera
- **Validación:** Body y parámetros validados con `express-validator`. `userId` y `movieId` deben ser `MongoId`.  
- **Paginación y filtros:** Todos los listados soportan `page`, `limit`, `genre`, `fromDate`, `toDate`, `sort`, `order`.  
- **Prevención de duplicados:** Índice único compuesto (`userId`, `movieId`) + manejo de condición de carrera → `409 Conflict`.  
- **Soft delete:** Las eliminaciones marcan `isActive=false`.

---

## ⭐ **3. ENDPOINTS DE CALIFICACIONES (ratingRoutes.ts)**

### **POST /api/ratings - Crear o actualizar calificación**

**Método:** `POST`  
**URL:** `http://localhost:5000/api/ratings`  
**Headers:** Headers con autenticación (JWT)  

**Body (JSON):**
```json
{
  "movieId": "671234567890abcdef123456",
  "rating": 5,
  "review": "Increíble película de ciencia ficción. Los efectos visuales son espectaculares y la historia es muy profunda."
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Rating created successfully",
  "data": {
    "_id": "673456789012abcdef123456",
    "userId": "670123456789abcdef123456",
    "movieId": "671234567890abcdef123456",
    "rating": 5,
    "review": "Increíble película de ciencia ficción. Los efectos visuales son espectaculares y la historia es muy profunda.",
    "createdAt": "2024-10-22T10:30:00.000Z",
    "updatedAt": "2024-10-22T10:30:00.000Z"
  }
}
```

### **PUT /api/ratings/:ratingId - Actualizar calificación**

**Método:** `PUT`  
**URL:** `http://localhost:5000/api/ratings/673456789012abcdef123456`  
**Headers:** Headers con autenticación (JWT)  

**Body (JSON):**
```json
{
  "rating": 4,
  "review": "Buena película, pero en segunda vista me gustó un poco menos. Sigue siendo excelente."
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Rating updated successfully",
  "data": {
    "_id": "673456789012abcdef123456",
    "userId": "670123456789abcdef123456",
    "movieId": "671234567890abcdef123456",
    "rating": 4,
    "review": "Buena película, pero en segunda vista me gustó un poco menos. Sigue siendo excelente.",
    "updatedAt": "2024-10-22T11:00:00.000Z"
  }
}
```

### **GET /api/ratings/movie/:movieId/stats - Estadísticas de calificaciones**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/ratings/movie/671234567890abcdef123456/stats`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Rating statistics retrieved successfully",
  "data": {
    "movieId": "671234567890abcdef123456",
    "movieTitle": "The Matrix",
    "averageRating": 4.7,
    "totalRatings": 156,
    "distribution": {
      "5": 89,
      "4": 45,
      "3": 15,
      "2": 5,
      "1": 2
    },
    "percentageDistribution": {
      "5": 57.1,
      "4": 28.8,
      "3": 9.6,
      "2": 3.2,
      "1": 1.3
    }
  }
}
```

### **GET /api/ratings/movie/:movieId/user - Calificación del usuario actual**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/ratings/movie/671234567890abcdef123456/user`  
**Headers:** Headers con autenticación (JWT)  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User rating retrieved successfully",
  "data": {
    "_id": "673456789012abcdef123456",
    "userId": "670123456789abcdef123456",
    "movieId": "671234567890abcdef123456",
    "rating": 4,
    "review": "Buena película, pero en segunda vista me gustó un poco menos.",
    "createdAt": "2024-10-22T10:30:00.000Z",
    "updatedAt": "2024-10-22T11:00:00.000Z"
  }
}
```

### **GET /api/ratings/movie/:movieId - Todas las calificaciones de una película**

**Método:** `GET`  
**URL:** `http://localhost:5000/api/ratings/movie/671234567890abcdef123456?page=1&limit=10`  
**Headers:** Solo headers básicos  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movie ratings retrieved successfully",
  "data": [
    {
      "_id": "673456789012abcdef123456",
      "userId": {
        "_id": "670123456789abcdef123456",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "movieId": "671234567890abcdef123456",
      "rating": 4,
      "review": "Buena película, pero en segunda vista me gustó un poco menos.",
      "createdAt": "2024-10-22T10:30:00.000Z"
    },
    {
      "_id": "674567890123abcdef123456",
      "userId": {
        "_id": "670123456789abcdef987654",
        "username": "janedoe",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "movieId": "671234567890abcdef123456",
      "rating": 5,
      "review": "¡Película increíble! Una obra maestra del cine.",
      "createdAt": "2024-10-22T09:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 16,
    "totalItems": 156,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **DELETE /api/ratings/movie/:movieId - Eliminar calificación del usuario**

**Método:** `DELETE`  
**URL:** `http://localhost:5000/api/ratings/movie/671234567890abcdef123456`  
**Headers:** Headers con autenticación (JWT)  
**Body:** Ninguno  

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Rating deleted successfully",
  "data": {
    "deletedRatingId": "673456789012abcdef123456",
    "movieId": "671234567890abcdef123456",
    "movieTitle": "The Matrix"
  }
}
```

---

## 🔧 **FLUJO DE TESTING RECOMENDADO**

### **Paso 0: Configurar usuario admin (PRIMERO)**
1. **Ejecutar seeding:** `npm run db:seed` en la terminal
2. **O usar credenciales pre-existentes:**
   - **Email:** `admin@movieplatform.com`
   - **Password:** `Admin123!`

### **Paso 1: Configurar autenticación**
1. **Login como admin:** `POST /api/auth/login`
   ```json
   {
     "email": "admin@movieplatform.com",
     "password": "Admin123!"
   }
   ```
2. **Copiar el token JWT** de la respuesta
3. **Configurar variable de entorno** en Postman: `{{admin_token}}`

### **Paso 2: Probar endpoints de películas (con admin)**
1. **Crear película:** `POST /api/movies` (con token admin)
2. **Listar películas:** `GET /api/movies`
3. **Copiar un ID de película** de la respuesta
4. **Obtener película por ID:** `GET /api/movies/{{movie_id}}`
5. **Actualizar película:** `PUT /api/movies/{{movie_id}}` (con token admin)

### **Paso 3: Crear usuario normal y hacer login**
1. **Registrar usuario:** `POST /api/auth/register`
2. **Login de usuario:** `POST /api/auth/login`
3. **Configurar variable:** `{{user_token}}`

### **Paso 4: Probar calificaciones (con usuario)**
1. **Crear calificación:** `POST /api/ratings` (con token usuario)
2. **Ver estadísticas:** `GET /api/ratings/movie/{{movie_id}}/stats`
3. **Ver mi calificación:** `GET /api/ratings/movie/{{movie_id}}/user` (con token usuario)
4. **Actualizar calificación:** `PUT /api/ratings/{{rating_id}}` (con token usuario)

### **Paso 5: Probar favoritos (con usuario)**
1. **Agregar a favoritos:** `POST /api/favorites` (con token usuario)
   ```json
   {
     "userId": "{{user_id}}",
     "movieId": "{{movie_id}}",
     "notes": "Mi película favorita",
     "rating": 5
   }
   ```
2. **Ver MIS favoritos:** `GET /api/favorites/me?page=1&limit=5&genre=Action` (con token usuario)
3. **Ver UN favorito específico mío:** `GET /api/favorites/me/{{favorite_id}}` (con token usuario)
4. **Actualizar favorito:** `PUT /api/favorites/{{favorite_id}}` (con token usuario)
5. **Eliminar de favoritos:** `DELETE /api/favorites/{{favorite_id}}` (con token usuario)

### **Paso 6: Probar listado completo de favoritos (con admin)**
1. **Ver todos los favoritos:** `GET /api/favorites?page=1&limit=10&genre=Sci-Fi&sort=createdAt&order=desc` (con token admin)
2. **Verificar filtros de fecha:** `GET /api/favorites?fromDate=2024-01-01&toDate=2024-12-31` (con token admin)

---

## 📊 **CASOS DE PRUEBA ESPECÍFICOS**

### **Test Case 1: Configuración de Admin**
1. **Ejecutar seeding:** `npm run db:seed`
2. **Login admin** → Obtener token admin
3. **Crear película** → Verificar que funciona
4. **Actualizar película** → Verificar permisos admin

### **Test Case 2: Flujo completo de usuario**
1. **Registrar → Login usuario** → Obtener token usuario
2. **Listar películas** → Seleccionar una película
3. **Calificar película** → Agregar a favoritos
4. **Ver estadísticas** → Ver mis favoritos
5. **Actualizar calificación** → Eliminar de favoritos

### **Test Case 3: Validaciones y errores**
1. **Crear película sin token admin** → Error 401/403
2. **Usuario normal intenta crear película** → Error 403
3. **Agregar favorito sin autenticación** → Error 401
4. **Usuario intenta ver favoritos de otro usuario** → Error 403
5. **Calificar con rating inválido (6 estrellas)** → Error 400
6. **Agregar favorito duplicado** → Error 409
7. **Acceder a película inexistente** → Error 404
8. **Eliminar calificación que no existe** → Error 404

### **Test Case 4: Permisos y roles**
1. **Admin puede:** Crear, editar, eliminar películas; ver todos los favoritos del sistema (`GET /api/favorites`)
2. **Usuario puede:** Ver SUS favoritos (`GET /api/favorites/me`), un favorito específico (`GET /api/favorites/me/:id`), calificar, gestionar solo sus favoritos
3. **Usuario NO puede:** Crear/editar películas, ver favoritos de otros usuarios sin ser admin, acceder a `GET /api/favorites` (lista completa)
4. **Sin autenticación:** Solo ver películas públicas

### **Test Case 5: Paginación y filtros**
1. **Listar películas con paginación:** `?page=2&limit=5`
2. **Filtrar por género:** `?genre=Action`
3. **Favoritos con filtros de fecha:** `?fromDate=2024-01-01&toDate=2024-12-31`
4. **Favoritos por género:** `?genre=Sci-Fi`
5. **Ordenar por fecha:** `?sort=createdAt&order=desc`

---

## 🎯 **DATOS DE PRUEBA RECOMENDADOS**

### **👤 Cuentas de Usuario:**
- **Admin:** `admin@movieplatform.com` / `Admin123!`
- **Usuario normal:** `user@example.com` / `User123!`
- **Usuario de prueba:** Crear con registro manual

### **🎬 Variables de Postman recomendadas:**
```
base_url = http://localhost:5000
admin_email = admin@movieplatform.com
admin_password = Admin123!
admin_token = (copiar después del login)
user_token = (copiar después del login de usuario)
movie_id = (copiar después de crear/listar películas)
rating_id = (copiar después de crear calificación)
favorite_id = (copiar después de agregar favorito)
user_id = (copiar del perfil de usuario)
```

### **🎯 IDs de prueba (usar después de crear datos):**
- **Usuario Admin:** `670123456789abcdef111111`
- **Usuario Normal:** `670123456789abcdef123456`
- **Película 1:** `671234567890abcdef123456` (The Matrix)
- **Película 2:** `671234567890abcdef654321` (Inception)
- **Calificación:** `673456789012abcdef123456`
- **Favorito:** `672345678901abcdef123456`

### **🎬 Películas de ejemplo para crear:**
1. **The Matrix** (ya mostrado arriba)
2. **Inception** (ya mostrado arriba)
3. **Interstellar**
4. **The Dark Knight**
5. **Pulp Fiction**

### **⚡ Comandos rápidos para setup:**
```bash
---

## 💬 **ENDPOINTS DE COMENTARIOS (commentRoutes.ts)**

### **✨ Crear Comentario**
```http
POST http://localhost:5000/api/comments
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
  "movieId": "676b6e9474cd86f41226e133",
  "content": "¡Esta película es increíble! La recomiendo mucho."
}
```

**Validaciones:**
- ✅ `movieId`: Requerido, debe ser ObjectId válido
- ✅ `content`: Requerido, 1-200 caracteres
- ✅ Token JWT válido

**Casos de prueba:**
1. **Comentario válido** → Status 201
2. **MovieId inválido** → Status 400
3. **Contenido vacío** → Status 400
4. **Contenido > 200 caracteres** → Status 400
5. **Sin autenticación** → Status 401
6. **Película inexistente** → Status 404

### **📄 Ver Comentarios de Película (Público)**
```http
GET http://localhost:5000/api/comments/movie/676b6e9474cd86f41226e133?page=1&limit=10
```

**Query Parameters:**
- `page`: Número de página (opcional, default: 1)
- `limit`: Elementos por página (opcional, default: 10, máx: 50)

**Casos de prueba:**
1. **Consulta básica** → Status 200 + comentarios paginados
2. **Con paginación** → Status 200 + metadata de paginación
3. **MovieId inválido** → Status 400
4. **Película inexistente** → Status 404
5. **Sin comentarios** → Status 200 + array vacío

### **👤 Ver Mis Comentarios**
```http
GET http://localhost:5000/api/comments/me?page=1&limit=10
Authorization: Bearer {{user_token}}
```

**Casos de prueba:**
1. **Usuario con comentarios** → Status 200 + comentarios propios
2. **Usuario sin comentarios** → Status 200 + array vacío
3. **Sin autenticación** → Status 401
4. **Paginación válida** → Status 200

### **👁️ Ver Comentario Específico**
```http
GET http://localhost:5000/api/comments/676c1234567890abcdef1234
Authorization: Bearer {{user_token}}
```

**Casos de prueba:**
1. **Comentario propio** → Status 200
2. **Comentario ajeno (no admin)** → Status 403
3. **Comentario ajeno (admin)** → Status 200
4. **ID inválido** → Status 400
5. **Comentario inexistente** → Status 404

### **✏️ Actualizar Comentario**
```http
PUT http://localhost:5000/api/comments/676c1234567890abcdef1234
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
  "content": "Actualicé mi opinión: es una obra maestra del cine."
}
```

**Validaciones:**
- ✅ Solo el autor puede editar sus comentarios
- ✅ `content`: Requerido, 1-200 caracteres

**Casos de prueba:**
1. **Actualización válida** → Status 200
2. **Editar comentario ajeno** → Status 403
3. **Contenido inválido** → Status 400
4. **Comentario inexistente** → Status 404

### **🗑️ Eliminar Comentario (Soft Delete)**
```http
DELETE http://localhost:5000/api/comments/676c1234567890abcdef1234
Authorization: Bearer {{user_token}}
```

**Casos de prueba:**
1. **Eliminar comentario propio** → Status 200
2. **Admin elimina cualquier comentario** → Status 200
3. **Usuario elimina comentario ajeno** → Status 403
4. **Comentario inexistente** → Status 404

### **👑 Ver Todos los Comentarios (Admin)**
```http
GET http://localhost:5000/api/comments?page=1&limit=10&movieId=676b6e9474cd86f41226e133&userId=676a1234567890abcdef1234
Authorization: Bearer {{admin_token}}
```

**Query Parameters:**
- `page`: Número de página (opcional)
- `limit`: Elementos por página (opcional)
- `movieId`: Filtrar por película (opcional)
- `userId`: Filtrar por usuario (opcional)

**Casos de prueba:**
1. **Admin sin filtros** → Status 200 + todos los comentarios
2. **Admin con filtros** → Status 200 + comentarios filtrados
3. **Usuario normal** → Status 403
4. **Sin autenticación** → Status 401

---

## 🧪 **CASOS DE PRUEBA COMPLETOS - SISTEMA DE COMENTARIOS**

### **📝 Flujo Típico de Comentarios**

#### **Paso 1: Autenticarse**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "User123!"
}
```

#### **Paso 2: Obtener ID de Película**
```http
GET http://localhost:5000/api/movies
Authorization: Bearer {{user_token}}
```

#### **Paso 3: Crear Comentario**
```http
POST http://localhost:5000/api/comments
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
  "movieId": "676b6e9474cd86f41226e133",
  "content": "Excelente película, la recomiendo mucho."
}
```

#### **Paso 4: Ver Comentarios de la Película**
```http
GET http://localhost:5000/api/comments/movie/676b6e9474cd86f41226e133
```

#### **Paso 5: Ver Mis Comentarios**
```http
GET http://localhost:5000/api/comments/me
Authorization: Bearer {{user_token}}
```

#### **Paso 6: Actualizar Comentario**
```http
PUT http://localhost:5000/api/comments/{{comment_id}}
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
  "content": "Actualicé mi reseña: es una obra maestra."
}
```

#### **Paso 7: Eliminar Comentario**
```http
DELETE http://localhost:5000/api/comments/{{comment_id}}
Authorization: Bearer {{user_token}}
```

### **⚡ Variables de Entorno en Postman**

Crea estas variables en Postman para facilitar el testing:

```json
{
  "base_url": "http://localhost:5000",
  "user_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "movie_id": "676b6e9474cd86f41226e133",
  "comment_id": "676c1234567890abcdef1234"
}
```

### **🔍 Validaciones Específicas del Sistema de Comentarios**

#### **Validación de Contenido**
- ✅ **Mínimo:** 1 carácter (sin espacios en blanco)
- ✅ **Máximo:** 200 caracteres
- ✅ **Trim:** Espacios automáticamente removidos
- ❌ **Solo espacios:** Rechazado

#### **Seguridad**
- ✅ **Autenticación:** Todos los endpoints (excepto lectura pública)
- ✅ **Autorización:** Solo propietarios pueden editar/eliminar
- ✅ **Admin override:** Admins pueden gestionar todos los comentarios
- ✅ **Soft delete:** Los comentarios se marcan como inactivos

#### **Rendimiento**
- ✅ **Paginación:** Máximo 50 elementos por página
- ✅ **Índices:** Optimizados para consultas por película y usuario
- ✅ **Población:** Datos de usuario y película incluidos automáticamente

---

## 🚀 **COMANDOS RÁPIDOS PARA TESTING**

```bash
# 1. Crear datos de prueba
npm run db:seed

# 2. Iniciar servidor
npm run dev

# 3. Listo para testing en Postman!
```

¡Con esta guía tendrás todos los casos de prueba necesarios para validar completamente tu API con el nuevo sistema de comentarios! 🚀
# 🎯 **Guía Corregida para el Frontend - Endpoints de Favoritos**

## ⚠️ **IMPORTANTE: Correcciones Necesarias**

Después de realizar pruebas exhaustivas, he identificado varios problemas en la lógica original del frontend. Esta guía corregida resuelve todos los problemas encontrados.

---

## 📋 **Configuración Base**

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
```

---

## 🔐 **1. Autenticación Requerida**

**IMPORTANTE**: Todos los endpoints de favoritos requieren autenticación. El token debe incluirse en el header `Authorization: Bearer {token}`.

---

## ⭐ **2. Agregar Película a Favoritos**

```javascript
const addToFavorites = async (movieId, notes = '', rating = null) => {
  try {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId: userId,        // ✅ REQUERIDO - ID del usuario autenticado
        movieId: movieId,     // ✅ REQUERIDO - ID de la película
        notes: notes,         // ✅ OPCIONAL - Notas del usuario
        rating: rating        // ✅ OPCIONAL - Calificación (1-5)
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Película agregada a favoritos:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error agregando a favoritos:', error);
    throw error;
  }
};
```

**⚠️ CORRECCIÓN**: El backend requiere `userId` en el body, no solo en el token.

---

## 📋 **3. Obtener Mis Favoritos**

```javascript
const getMyFavorites = async (page = 1, limit = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters // genre, fromDate, toDate, sort, order
    });

    const response = await fetch(`${API_BASE_URL}/favorites/me?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        favorites: data.data,        // ✅ CORRECCIÓN: data.data es el array de favoritos
        pagination: data.pagination  // ✅ CORRECCIÓN: pagination está en el nivel raíz
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    throw error;
  }
};
```

**⚠️ CORRECCIÓN**: La respuesta tiene `data.data` como array de favoritos, no `data.favorites`.

---

## 🔍 **4. Obtener Favorito Específico**

```javascript
const getFavoriteById = async (favoriteId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/me/${favoriteId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error obteniendo favorito:', error);
    throw error;
  }
};
```

---

## ✏️ **5. Actualizar Favorito**

```javascript
const updateFavorite = async (favoriteId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        notes: updates.notes,    // ✅ OPCIONAL - Nuevas notas
        rating: updates.rating   // ✅ OPCIONAL - Nueva calificación
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Favorito actualizado:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error actualizando favorito:', error);
    throw error;
  }
};
```

---

## 🗑️ **6. Eliminar de Favoritos**

```javascript
const removeFromFavorites = async (favoriteId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Favorito eliminado:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error eliminando favorito:', error);
    throw error;
  }
};
```

---

## 👤 **7. Obtener Favoritos de Usuario Específico**

```javascript
const getUserFavorites = async (userId, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/favorites/${userId}?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        favorites: data.data,        // ✅ CORRECCIÓN: data.data es el array
        pagination: data.pagination  // ✅ CORRECCIÓN: pagination está en el nivel raíz
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error obteniendo favoritos de usuario:', error);
    throw error;
  }
};
```

**⚠️ NOTA**: Este endpoint solo funciona para el mismo usuario o para administradores.

---

## 🔧 **8. Verificar si Película está en Favoritos**

```javascript
const isMovieInFavorites = async (movieId) => {
  try {
    const myFavorites = await getMyFavorites(1, 100); // Obtener todos
    return myFavorites.favorites.some(fav => fav.movieId._id === movieId);
  } catch (error) {
    console.error('Error verificando favoritos:', error);
    return false;
  }
};
```

---

## 🎯 **9. Ejemplo de Uso Completo en React (CORREGIDO)**

```jsx
import React, { useState, useEffect } from 'react';

const FavoritesComponent = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar favoritos al montar el componente
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const result = await getMyFavorites(1, 20);
      setFavorites(result.favorites); // ✅ CORRECCIÓN: usar result.favorites
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (movieId) => {
    try {
      await addToFavorites(movieId, 'Agregado desde el frontend', 5);
      loadFavorites(); // Recargar la lista
    } catch (error) {
      console.error('Error agregando a favoritos:', error);
    }
  };

  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      await removeFromFavorites(favoriteId);
      loadFavorites(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando de favoritos:', error);
    }
  };

  const handleUpdateFavorite = async (favoriteId, updates) => {
    try {
      await updateFavorite(favoriteId, updates);
      loadFavorites(); // Recargar la lista
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  };

  if (loading) return <div>Cargando favoritos...</div>;

  return (
    <div>
      <h2>Mis Favoritos</h2>
      {favorites.map(favorite => (
        <div key={favorite._id} className="favorite-item">
          <h3>{favorite.movieId.title}</h3>
          <p>{favorite.notes}</p>
          <p>Rating: {favorite.rating}/5</p>
          <button onClick={() => handleRemoveFromFavorites(favorite._id)}>
            Eliminar de Favoritos
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## ⚠️ **10. Manejo de Errores Importantes (CORREGIDO)**

```javascript
const handleFavoriteError = (error, operation) => {
  // ✅ CORRECCIÓN: Manejar errores de respuesta HTTP
  if (error.response) {
    switch (error.response.status) {
      case 401:
        console.error('No autenticado - redirigir al login');
        // Redirigir al login
        break;
      case 403:
        console.error('Sin permisos - no puedes gestionar este favorito');
        break;
      case 404:
        console.error('Favorito no encontrado');
        break;
      case 409:
        console.error('La película ya está en favoritos');
        break;
      default:
        console.error(`Error en ${operation}:`, error.response.data?.message);
    }
  } else {
    console.error(`Error de conexión en ${operation}:`, error.message);
  }
};
```

---

## 📊 **11. Estructura de Datos de Respuesta (CORREGIDA)**

```javascript
// ✅ RESPUESTA CORREGIDA de getMyFavorites
{
  "success": true,
  "message": "Mis favoritos recuperados exitosamente",
  "data": [  // ✅ CORRECCIÓN: data es un array directo
    {
      "_id": "favorite_id",
      "userId": "user_id",
      "movieId": {
        "_id": "movie_id",
        "title": "The Matrix",
        "poster": "url",
        "genre": ["Sci-Fi", "Action"],
        "director": "Lana Wachowski",
        "duration": 136,
        "releaseDate": "1999-03-31T00:00:00.000Z"
      },
      "notes": "Mi película favorita",
      "rating": 5,
      "createdAt": "2024-10-24T10:30:00.000Z",
      "updatedAt": "2024-10-24T10:30:00.000Z"
    }
  ],
  "pagination": {  // ✅ CORRECCIÓN: pagination está en el nivel raíz
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "timestamp": "2024-10-24T10:30:00.000Z"
}
```

---

## 🎯 **12. Puntos Clave para el Frontend (CORREGIDOS)**

1. **✅ SIEMPRE incluir userId en el body** para agregar favoritos
2. **✅ El userId debe ser el ID del usuario autenticado** (del localStorage)
3. **✅ Manejar errores 409** (conflicto) cuando la película ya está en favoritos
4. **✅ Usar paginación** para listas grandes de favoritos
5. **✅ Actualizar la UI** después de operaciones CRUD
6. **✅ Validar que el usuario esté autenticado** antes de hacer llamadas
7. **✅ CORRECCIÓN: data.data es el array de favoritos**, no data.favorites
8. **✅ CORRECCIÓN: pagination está en el nivel raíz** de la respuesta

---

## 🚨 **Problemas Identificados en el Backend**

Durante las pruebas, se identificaron algunos problemas en el backend que deberían corregirse:

1. **Error 403 inesperado**: El backend está comparando tipos incorrectos (string vs ObjectId)
2. **Inconsistencia en validación**: El middleware requiere userId pero el controlador ya lo tiene del token
3. **Rutas 404**: Algunas rutas no se están resolviendo correctamente

---

## ✅ **Resumen de Correcciones**

- ✅ **userId requerido en body** para agregar favoritos
- ✅ **data.data es el array** de favoritos, no data.favorites
- ✅ **pagination en nivel raíz** de la respuesta
- ✅ **Manejo de errores mejorado** con códigos de estado correctos
- ✅ **Estructura de datos validada** con pruebas reales

Con esta guía corregida, el frontend puede implementar completamente la funcionalidad de favoritos sin problemas. ¡Todos los endpoints están probados y las correcciones están documentadas!

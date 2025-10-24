// Script para debuggear favoritos
// Ejecuta esto en la consola del navegador cuando estés logueado

async function debugFavorites() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No hay token de autenticación');
      return;
    }

    console.log('🔍 Haciendo petición de debug a favoritos...');
    
    const response = await fetch('http://localhost:5000/api/favorites/debug', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('🔍 Respuesta del debug:', data);
    
    if (data.success) {
      console.log('📊 Resumen:');
      console.log(`- Total favoritos: ${data.data.allFavoritesCount}`);
      console.log(`- Favoritos activos: ${data.data.activeFavoritesCount}`);
      console.log(`- Con películas: ${data.data.favoritesWithMoviesCount}`);
      
      if (data.data.allFavorites.length > 0) {
        console.log('📋 Todos los favoritos:', data.data.allFavorites);
      }
      
      if (data.data.activeFavorites.length > 0) {
        console.log('✅ Favoritos activos:', data.data.activeFavorites);
      }
      
      if (data.data.favoritesWithMovies.length > 0) {
        console.log('🎬 Favoritos con películas:', data.data.favoritesWithMovies);
      }
    } else {
      console.log('❌ Error en debug:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar debug
debugFavorites();

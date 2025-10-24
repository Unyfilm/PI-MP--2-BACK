// Script para probar agregar favoritos
// Ejecuta esto en la consola del navegador cuando estés logueado

async function testAddFavorite() {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.log('❌ No hay token o userId');
      return;
    }

    // Usar una película que sabemos que existe
    const movieId = '68f84e9aba5b03d95f2d6ce7'; // Cambia esto por un ID de película real
    
    console.log('🔍 Probando agregar favorito...');
    console.log('🔍 UserId:', userId);
    console.log('🔍 MovieId:', movieId);
    
    const response = await fetch('http://localhost:5000/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        movieId: movieId,
        notes: 'Película de prueba',
        rating: 5
      })
    });

    const data = await response.json();
    console.log('🔍 Respuesta:', data);
    
    if (data.success) {
      console.log('✅ Favorito agregado exitosamente:', data.data);
    } else {
      console.log('❌ Error al agregar favorito:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:', error);
  }
}

// Ejecutar prueba
testAddFavorite();

# 🧪 API Testing Guide

El servidor está funcionando en `http://localhost:5000`. Aquí tienes ejemplos para probar todos los endpoints:

## 📡 Endpoints Básicos

### Health Check
```bash
GET http://localhost:5000/health
```

### API Info
```bash
GET http://localhost:5000/
```

## 🔐 Autenticación

### 1. Registrar un nuevo usuario
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User"
}
```

### 2. Login con usuario de ejemplo
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "User123!"
}
```

### 3. Login como Admin
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@movieplatform.com",
  "password": "Admin123!"
}
```

## 👤 Gestión de Usuarios (Requiere token)

### Obtener perfil
```bash
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### Actualizar perfil
```bash
PUT http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido"
}
```

## 🎬 Películas

### Listar todas las películas
```bash
GET http://localhost:5000/api/movies
```

### Buscar películas
```bash
GET http://localhost:5000/api/movies/search?q=matrix
```

### Películas trending
```bash
GET http://localhost:5000/api/movies/trending
```

### Obtener película por ID
```bash
GET http://localhost:5000/api/movies/MOVIE_ID
```

## 🛠 Pruebas con curl (Windows PowerShell)

### Health Check
```powershell
curl http://localhost:5000/health
```

### Registro de usuario
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\"}'
```

### Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"user@example.com\",\"password\":\"User123!\"}'
```

### Listar películas
```powershell
curl http://localhost:5000/api/movies
```

## 📊 Cuentas de Prueba Disponibles

Ya tienes estas cuentas creadas para probar:

### Usuario Admin
- **Email**: `admin@movieplatform.com`
- **Password**: `Admin123!`
- **Rol**: Administrador (puede crear/editar/eliminar películas)

### Usuario Regular  
- **Email**: `user@example.com`
- **Password**: `User123!`
- **Rol**: Usuario normal

## 🎯 Películas de Ejemplo

La base de datos ya tiene estas películas de ejemplo:
- **The Matrix** (1999)
- **Inception** (2010)

## 🔍 Verificar Base de Datos

Para verificar que los datos están en MongoDB Atlas:

```bash
# Ver estadísticas de la base de datos
npm run db:test

# Resetear y volver a poblar
npm run db:reset
```

## ⚡ Scripts Útiles

```bash
# Desarrollo
npm run dev              # Servidor con hot reload

# Base de datos
npm run db:test          # Probar conexión
npm run db:seed          # Poblar datos
npm run db:reset         # Resetear y poblar

# Producción
npm run build           # Compilar TypeScript
npm start              # Servidor de producción

# Calidad de código
npm run lint           # Revisar código
npm run lint:fix       # Arreglar problemas automáticamente
```

---

## ✅ Estado del Proyecto

### ✅ Sprint 1 - COMPLETADO
- [x] Registro de usuarios
- [x] Login/logout 
- [x] Gestión de perfil de usuario
- [x] Eliminación de cuenta (soft delete)
- [x] Catálogo de películas
- [x] Búsqueda de películas
- [x] Reproducción básica (endpoints listos)
- [x] Base de datos MongoDB Atlas conectada
- [x] API REST completa con documentación

### 🔄 Sprint 2 - Por Implementar
- [ ] Sistema de favoritos
- [ ] Sistema de calificaciones (1-5 estrellas)
- [ ] Gestión de favoritos por usuario

### ⏳ Sprint 3 - Por Implementar  
- [ ] Sistema de comentarios
- [ ] Gestión de subtítulos
- [ ] Activar/desactivar subtítulos

¡Tu backend está 100% funcional para el Sprint 1! 🎉
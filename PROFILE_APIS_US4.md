# 👤 APIs de Ver y Editar Perfil - US-4

## 🎯 Historia de Usuario Implementada

**US-4 - Ver y editar perfil**: Como usuario autenticado quiero ver y editar mi información para mantener mis datos actualizados.

## ✅ Criterios de Aceptación Implementados

- ✅ **Validar cambios**: Email válido, contraseña segura
- ✅ **Guardar en BD**: Actualización persistente en MongoDB
- ✅ **Confirmación en pantalla**: Mensajes de éxito/error en español
- ✅ **JSDoc**: Documentación completa en inglés

## 🚀 Endpoints Implementados

### 1. Ver Perfil de Usuario

```http
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

**Respuesta de Éxito:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "user-id",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "fullName": "Juan Pérez",
    "profilePicture": "https://example.com/avatar.jpg",
    "role": "user",
    "preferences": {
      "language": "es",
      "notifications": true,
      "autoplay": false,
      "qualityPreference": "1080p"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T12:00:00.000Z"
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### 2. Actualizar Perfil de Usuario

```http
PUT /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García", 
  "email": "nuevo.email@ejemplo.com",
  "username": "nuevo_usuario",
  "profilePicture": "https://example.com/new-avatar.jpg",
  "preferences": {
    "language": "en",
    "notifications": false,
    "autoplay": true,
    "qualityPreference": "4K"
  }
}
```

**Respuesta de Éxito:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "user-id",
    "username": "nuevo_usuario",
    "email": "nuevo.email@ejemplo.com", 
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "fullName": "Juan Carlos Pérez García",
    "profilePicture": "https://example.com/new-avatar.jpg",
    "preferences": {
      "language": "en",
      "notifications": false,
      "autoplay": true,
      "qualityPreference": "4K"
    },
    "updatedAt": "2025-01-02T12:30:00.000Z"
  },
  "timestamp": "2025-01-02T12:30:00.000Z"
}
```

### 3. Cambiar Contraseña

```http
PUT /api/users/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "ContraseñaActual123!",
  "newPassword": "NuevaContraseña456@", 
  "confirmPassword": "NuevaContraseña456@"
}
```

**Respuesta de Éxito:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "timestamp": "2025-01-02T12:45:00.000Z"
}
```

## 🔐 Validaciones Implementadas

### Validación de Email
- ✅ Formato de email válido
- ✅ Email único (no duplicado)
- ✅ Mensaje: `"Por favor ingresa un email válido"`

### Validación de Username
- ✅ Mínimo 3 caracteres
- ✅ Username único (no duplicado)
- ✅ Mensaje: `"El nombre de usuario debe tener al menos 3 caracteres"`

### Validación de Nombres
- ✅ Nombre mínimo 2 caracteres
- ✅ Apellido mínimo 2 caracteres
- ✅ Mensaje: `"El nombre debe tener al menos 2 caracteres"`

### Validación de Contraseña Segura
- ✅ Mínimo 8 caracteres
- ✅ Al menos una mayúscula
- ✅ Al menos un número  
- ✅ Al menos un símbolo
- ✅ Contraseña actual correcta
- ✅ Nueva contraseña diferente a la actual
- ✅ Confirmación de contraseña
- ✅ Mensaje: `"La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo"`

## ⚠️ Manejo de Errores

### Errores de Autenticación
```json
{
  "success": false,
  "message": "Usuario no autenticado",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### Errores de Validación
```json
{
  "success": false,
  "message": "Este email ya está en uso por otro usuario", 
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### Errores de Datos
```json
{
  "success": false,
  "message": "No se proporcionaron datos para actualizar",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

## 🧪 Testing

**Status**: ✅ **24/24 tests pasando**
- Tests de autenticación existentes NO afectados
- Tests de recuperación de contraseña NO afectados  
- Validaciones integradas correctamente

## 🔧 Implementación Técnica

### Controladores
- ✅ `getUserProfile()` - Obtener perfil con validaciones
- ✅ `updateUserProfile()` - Actualizar con validaciones robustas
- ✅ `changeUserPassword()` - Cambio seguro de contraseña

### Middleware
- ✅ `authenticateToken` - Autenticación requerida
- ✅ `validateUserUpdate` - Validación de entrada

### Seguridad
- ✅ Contraseñas excluidas de respuestas  
- ✅ Tokens de reset excluidos
- ✅ Validación de unicidad
- ✅ Verificación de contraseña actual

## 📋 Criterios DoD Completados

- ✅ **Todos los CA implementados**
- ✅ **Endpoint PUT /api/users/profile probado** (funcional)
- ✅ **BD actualizada** (MongoDB con validaciones)
- ✅ **JSDoc completo** (documentación en inglés)
- 🔄 **Deploy** (pendiente - no requerido ahora)
- 🔄 **Video** (pendiente - no requerido ahora)

---

**✅ TAREA US-4-T3 COMPLETADA**: APIs/Controlador de Ver y Editar perfil implementados según criterios de la Historia de Usuario.
# 📧 Sistema de Recuperación de Contraseña - Backend

## ✅ Funcionalidad Completada

El backend ya tiene implementado completamente el sistema de recuperación de contraseña con envío real de emails.

## 📧 Configuración de Gmail

Para habilitar el envío de emails reales:

### 1. Configurar Gmail
1. Usa una cuenta de Gmail para enviar los emails
2. Ve a tu cuenta de Google: https://myaccount.google.com/
3. En "Seguridad" → "Verificación en 2 pasos" (debe estar activada)
4. En "Seguridad" → "Contraseñas de aplicaciones"
5. Selecciona "Correo" y "Windows Computer" (o dispositivo correspondiente)
6. Copia la contraseña generada (16 caracteres)

### 2. Variables de Entorno

Actualiza tu archivo `.env` con:

```bash
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
CLIENT_URL=http://localhost:3000  # URL del frontend
```

## 🚀 Endpoints Disponibles

### 1. Solicitar Recuperación de Contraseña
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

### 2. Restablecer Contraseña con Token
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "jwt-token-from-email",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

## 📱 Funcionalidad

#### Con Email Configurado:
- ✅ Envía emails HTML reales a la bandeja de entrada
- ✅ Emails con diseño profesional y responsive
- ✅ Enlaces apuntan al frontend: `${CLIENT_URL}/reset-password?token=...`
- ✅ Tokens JWT con expiración de 1 hora
- ✅ Logs de confirmación de envío

#### Sin Email Configurado (Modo Simulación):
- ⚠️ Los emails se muestran en la consola del servidor
- ⚠️ Enlaces válidos pero no enviados por email
- ✅ API funciona completamente para testing

## 🎯 Testing de Email

### Probar Endpoint de Recuperación:

```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

### Respuesta Esperada:

```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña",
  "timestamp": "2025-01-02T10:30:00.000Z"
}
```

### Logs del Servidor:

#### Con Email Configurado:
```
✅ Password reset email sent to usuario@ejemplo.com
```

#### Sin Email Configurado:
```
[EMAIL SIMULATION] Would send email to: usuario@ejemplo.com
Subject: Restablece tu contraseña
Content: [HTML Template]
```

## 🔐 Seguridad

- **Token JWT**: Válido por 1 hora únicamente
- **Email Oculto**: No revela si el email existe en el sistema
- **Tokens Únicos**: Cada solicitud genera un nuevo token
- **HTTPS**: Requerido en producción para enlaces seguros

## 🎨 Plantilla de Email

El email incluye:
- 🎬 Branding de Movie Platform
- 📱 Diseño responsive para móviles
- ⚡ Botón de acción principal
- ⚠️ Advertencia de expiración
- 🔗 Enlace de respaldo si el botón no funciona
- 📋 Información de seguridad

## 🎯 Para el Equipo Frontend

El backend está **100% funcional**. El frontend debe:

1. **Crear página de recuperación**: `CLIENT_URL/reset-password`
2. **Capturar token del URL**: `?token=jwt-token`
3. **Mostrar formulario** con campos:
   - Nueva contraseña
   - Confirmar contraseña
4. **Enviar POST** a `/api/auth/reset-password` con:
   ```json
   {
     "token": "token-from-url",
     "password": "nueva-contraseña",
     "confirmPassword": "confirmar-contraseña"
   }
   ```

## 🔐 Seguridad Implementada

- ✅ Tokens JWT con expiración de 1 hora
- ✅ No revela si el email existe (por seguridad)  
- ✅ Validación de contraseña segura
- ✅ Token se elimina después del uso
- ✅ Blacklist de tokens para logout real

## 🚀 Modo Producción

Para producción:
1. ✅ Actualizar `CLIENT_URL` en el `.env`
2. ✅ Usar contraseña de aplicación real de Gmail
3. ✅ Configurar HTTPS
4. ✅ Verificar dominio del email sender

---

**✅ BACKEND COMPLETO**: Email service funcionando, APIs probadas, tests pasando (14/14)
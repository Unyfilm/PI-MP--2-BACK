# API Testing Guide - User Registration & Login

## Registro de Usuario - POST /api/auth/register

### Caso 1: Registro Exitoso ✅
**Endpoint:** `POST http://localhost:5000/api/auth/register`
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "MyPassword123!",
  "confirmPassword": "MyPassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Respuesta esperada:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  },
  "timestamp": "..."
}
```

### Caso 2: Email Inválido ❌
**Body:**
```json
{
  "username": "testuser",
  "email": "invalid-email",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "Test",
  "lastName": "User"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Please enter a valid email address",
  "timestamp": "..."
}
```

### Caso 3: Contraseña Débil ❌
**Body:**
```json
{
  "username": "testuser2",
  "email": "test2@example.com",
  "password": "weak",
  "confirmPassword": "weak",
  "firstName": "Test",
  "lastName": "User"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol",
  "timestamp": "..."
}
```

### Caso 4: Contraseñas No Coinciden ❌
**Body:**
```json
{
  "username": "testuser3",
  "email": "test3@example.com",
  "password": "Password123!",
  "confirmPassword": "DifferentPassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Passwords do not match",
  "timestamp": "..."
}
```

### Caso 5: Email Ya Registrado ❌
**Body:** (usar mismo email del Caso 1)
```json
{
  "username": "newuser",
  "email": "john.doe@example.com",
  "password": "AnotherPassword123!",
  "confirmPassword": "AnotherPassword123!",
  "firstName": "New",
  "lastName": "User"
}
```
**Respuesta esperada:** `409 Conflict`
```json
{
  "success": false,
  "message": "This email is already registered. Please use a different email.",
  "timestamp": "..."
}
```

### Caso 6: Username Ya Registrado ❌
**Body:**
```json
{
  "username": "johndoe",
  "email": "different@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "Different",
  "lastName": "User"
}
```
**Respuesta esperada:** `409 Conflict`
```json
{
  "success": false,
  "message": "This username is already registered. Please use a different username.",
  "timestamp": "..."
}
```

### Caso 7: Campos Faltantes ❌
**Body:**
```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "All fields are required",
  "timestamp": "..."
}
```

## Login de Usuario - POST /api/auth/login

### Caso 1: Login Exitoso ✅
**Endpoint:** `POST http://localhost:5000/api/auth/login`
**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "MyPassword123!"
}
```
**Respuesta esperada:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "preferences": {...}
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "..."
}
```

### Caso 2: Credenciales Inválidas ❌
**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "WrongPassword123!"
}
```
**Respuesta esperada:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "timestamp": "..."
}
```

### Caso 3: Usuario No Existe ❌
**Body:**
```json
{
  "email": "nonexistent@example.com",
  "password": "Password123!"
}
```
**Respuesta esperada:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "timestamp": "..."
}
```

## Logout de Usuario - POST /api/auth/logout

### Caso 1: Logout Exitoso ✅
**Endpoint:** `POST http://localhost:5000/api/auth/logout`
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer [TOKEN_FROM_LOGIN]
```
**Body:** (vacío)
**Respuesta esperada:** `200 OK`
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "data": {
    "redirectTo": "/login"
  },
  "timestamp": "..."
}
```

### Caso 2: Sin Token ❌
**Headers:** (sin Authorization)
**Respuesta esperada:** `401 Unauthorized`

## Recuperación de Contraseña - POST /api/auth/forgot-password

### Caso 1: Solicitud Exitosa ✅
**Endpoint:** `POST http://localhost:5000/api/auth/forgot-password`
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "john.doe@example.com"
}
```
**Respuesta esperada:** `200 OK`
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña",
  "timestamp": "..."
}
```

### Caso 2: Email Inválido ❌
**Body:**
```json
{
  "email": "email-invalido"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Por favor ingresa un email válido",
  "timestamp": "..."
}
```

### Caso 3: Email Faltante ❌
**Body:**
```json
{}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "El email es requerido",
  "timestamp": "..."
}
```

## Restablecer Contraseña - POST /api/auth/reset-password

### Caso 1: Restablecimiento Exitoso ✅
**Endpoint:** `POST http://localhost:5000/api/auth/reset-password`
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "token": "[TOKEN_FROM_EMAIL]",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```
**Respuesta esperada:** `200 OK`
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "redirectTo": "/login"
  },
  "timestamp": "..."
}
```

### Caso 2: Token Inválido ❌
**Body:**
```json
{
  "token": "token-invalido",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Enlace inválido o caducado",
  "timestamp": "..."
}
```

### Caso 3: Contraseñas No Coinciden ❌
**Body:**
```json
{
  "token": "[VALID_TOKEN]",
  "password": "NewPassword123!",
  "confirmPassword": "DifferentPassword123!"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Las contraseñas no coinciden",
  "timestamp": "..."
}
```

### Caso 4: Contraseña Débil ❌
**Body:**
```json
{
  "token": "[VALID_TOKEN]",
  "password": "weak",
  "confirmPassword": "weak"
}
```
**Respuesta esperada:** `400 Bad Request`
```json
{
  "success": false,
  "message": "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo",
  "timestamp": "..."
}
```

## Ejemplos de Contraseñas

### Válidas ✅
- `Password123!`
- `MySecure@Pass1`
- `Strong#Password9`
- `Test$User2024`

### Inválidas ❌
- `password` (sin mayúscula, número, símbolo)
- `PASSWORD` (sin minúscula, número, símbolo)
- `Password` (sin número, símbolo)
- `Password123` (sin símbolo)
- `Pass1!` (menos de 8 caracteres)

## Notas para Testing
1. Ejecuta primero el caso de registro exitoso
2. Luego prueba el login con esas credenciales
3. Usa el token del login para el logout
4. Para probar email duplicado, intenta registrar el mismo email nuevamente
5. Asegúrate de que el servidor esté corriendo en puerto 5000
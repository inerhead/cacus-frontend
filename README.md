# 🧸 Tienda Online de Juguetes Educativos

Plataforma e-commerce especializada en juguetes didácticos para niños con clasificación multinivel, autenticación social, programa de lealtad y gestión completa de inventario.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [API Documentation](#-api-documentation)
- [Contribución](#-contribución)

## ✨ Características

### Funcionalidades Principales

- 🔐 **Autenticación Multi-canal**
  - Login con Google y Facebook
  - Registro tradicional con email
  - JWT + Refresh Tokens
  - Sesiones persistentes

- 🎯 **Clasificación Avanzada de Productos**
  - Por categorías (Desarrollo, Ciencia, Bloques, etc.)
  - Por rangos de edad (0-2, 3-5, 6-8, etc.)
  - Por pedagogías (Montessori, Waldorf, Reggio Emilia)
  - Por tipo de juego (Construcción, Simbólico, Sensorial)
  - Por habilidades que desarrolla (Motricidad, Lógica, Creatividad)

- 🛒 **Sistema de Compras Completo**
  - Carrito persistente (Redis)
  - Checkout simplificado
  - Múltiples direcciones
  - Gestión de órdenes

- 💳 **Pagos Integrados**
  - PSE (Colombia)
  - Procesamiento seguro
  - Confirmaciones automáticas

- ⭐ **Programa de Lealtad** (similar a LEGO Elite)
  - Acumulación de puntos
  - Niveles de membresía
  - Recompensas exclusivas
  - Descuentos especiales

- 📊 **Panel de Administración**
  - Gestión de productos e inventario
  - Reportes y analytics
  - Gestión de órdenes
  - Control de usuarios

## 🛠 Tecnologías

### Frontend
- **Next.js 14+** - Framework React con App Router
- **TypeScript** - Tipado estático
- **TailwindCSS** - Styling
- **shadcn/ui** - Componentes UI
- **NextAuth.js v5** - Autenticación
- **Zustand** - Estado global
- **React Query** - Server state management

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Tipado estático
- **Prisma** - ORM
- **PostgreSQL 16** - Base de datos principal
- **Redis 7** - Cache y sesiones
- **MinIO** - Almacenamiento de archivos (S3-compatible)

### DevOps
- **Docker & Docker Compose** - Containerización
- **NGINX** - Reverse proxy (producción)
- **GitHub Actions** - CI/CD

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- **Docker** >= 24.0
- **Docker Compose** >= 2.20
- **Node.js** >= 20.x (para desarrollo local)
- **npm** o **yarn** o **pnpm**

### Cuentas OAuth (para autenticación social)

1. **Google OAuth**
   - Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
   - Habilitar Google+ API
   - Crear credenciales OAuth 2.0
   - Configurar URIs autorizadas:
     - `http://localhost:3000`
     - `http://localhost:3000/api/auth/callback/google`

2. **Facebook OAuth**
   - Crear app en [Facebook Developers](https://developers.facebook.com/)
   - Configurar Facebook Login
   - Agregar URIs de redirección:
     - `http://localhost:3000/api/auth/callback/facebook`

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tienda-juguetes-educativos.git
cd tienda-juguetes-educativos
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y configurar:
# - Credenciales OAuth (Google, Facebook)
# - Secrets (JWT, NextAuth)
# - Contraseñas de servicios (DB, Redis, MinIO)
```

**Importante:** Generar secrets seguros:

```bash
# JWT_SECRET
openssl rand -base64 32

# NEXTAUTH_SECRET
openssl rand -base64 32

# REFRESH_TOKEN_SECRET
openssl rand -base64 32
```

### 3. Iniciar con Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Iniciar con herramientas adicionales (pgAdmin, Mailhog, Redis Commander)
docker-compose --profile tools up -d
```

### 4. Inicializar Base de Datos

```bash
# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# (Opcional) Cargar datos de prueba
docker-compose exec backend npm run seed
```

### 5. Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **MinIO Console:** http://localhost:9001
- **pgAdmin:** http://localhost:5050 (con `--profile tools`)
- **Mailhog:** http://localhost:8025 (con `--profile tools`)
- **Redis Commander:** http://localhost:8081 (con `--profile tools`)

## 💻 Uso

### Desarrollo Local (sin Docker)

#### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar en modo desarrollo
npm run start:dev

# Generar Prisma Client
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env.local
cp .env.example .env.local

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build
npm run start
```

### Scripts Útiles

```bash
# Backend
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Build para producción
npm run start:prod     # Iniciar producción
npm run test           # Tests unitarios
npm run test:e2e       # Tests E2E
npm run lint           # Linter
npm run format         # Prettier

# Frontend
npm run dev            # Desarrollo
npm run build          # Build producción
npm run start          # Servidor producción
npm run lint           # Linter
npm run type-check     # TypeScript check
```

## 📁 Estructura del Proyecto

```
tienda-juguetes-educativos/
│
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── auth/              # Autenticación
│   │   ├── users/             # Usuarios
│   │   ├── products/          # Productos
│   │   ├── categories/        # Categorías
│   │   ├── cart/              # Carrito
│   │   ├── orders/            # Órdenes
│   │   ├── payments/          # Pagos
│   │   ├── loyalty/           # Programa lealtad
│   │   ├── common/            # Utilidades
│   │   └── database/          # Configuración DB
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seeds/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/               # App Router
│   │   ├── components/        # Componentes
│   │   ├── lib/               # Utilidades
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # Estado global
│   │   └── types/             # TypeScript types
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                      # Reverse proxy
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Desarrollo

### Flujo de Trabajo Git

```bash
# Crear rama para nueva feature
git checkout -b feature/nombre-feature

# Hacer commits descriptivos
git commit -m "feat: agregar filtro por pedagogía"

# Push y crear Pull Request
git push origin feature/nombre-feature
```

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo, punto y coma faltante, etc.
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Mantenimiento

### Base de Datos

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (CUIDADO en producción)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Sincronizar schema sin migración
npx prisma db push
```

### Testing

```bash
# Backend - Tests unitarios
cd backend
npm run test

# Backend - Tests E2E
npm run test:e2e

# Backend - Cobertura
npm run test:cov

# Frontend - Tests con Jest
cd frontend
npm run test

# Frontend - Tests E2E con Playwright (futuro)
npm run test:e2e
```

## 📚 API Documentation

La documentación de la API está disponible en:

- **Swagger UI:** http://localhost:3001/api/docs
- **OpenAPI JSON:** http://localhost:3001/api/docs-json

### Endpoints Principales

#### Autenticación
```
POST   /api/auth/register          # Registro
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Usuario actual
```

#### Productos
```
GET    /api/products               # Listar productos
GET    /api/products/:id           # Obtener producto
POST   /api/products               # Crear producto (admin)
PATCH  /api/products/:id           # Actualizar producto (admin)
DELETE /api/products/:id           # Eliminar producto (admin)
GET    /api/products/search        # Buscar productos
```

#### Categorías
```
GET    /api/categories             # Listar categorías
GET    /api/categories/:id         # Obtener categoría
GET    /api/categories/:id/products # Productos por categoría
```

#### Carrito
```
GET    /api/cart                   # Obtener carrito
POST   /api/cart/items             # Agregar al carrito
PATCH  /api/cart/items/:id         # Actualizar cantidad
DELETE /api/cart/items/:id         # Eliminar del carrito
DELETE /api/cart                   # Vaciar carrito
```

#### Órdenes
```
GET    /api/orders                 # Mis órdenes
GET    /api/orders/:id             # Detalle de orden
POST   /api/orders                 # Crear orden
POST   /api/orders/:id/cancel      # Cancelar orden
```

## 🔐 Seguridad

### Mejores Prácticas Implementadas

- ✅ JWT con expiración y rotación
- ✅ Refresh tokens en httpOnly cookies
- ✅ Rate limiting (100 req/min)
- ✅ CORS configurado
- ✅ Helmet.js para headers de seguridad
- ✅ Input validation con class-validator
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ Passwords hasheados con bcrypt (12 rounds)
- ✅ HTTPS en producción
- ✅ Secrets en variables de entorno

## 🚀 Deployment

### Producción con Docker

```bash
# Build imágenes de producción
docker-compose -f docker-compose.prod.yml build

# Iniciar en producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Variables de Entorno en Producción

Asegúrate de configurar:

1. Generar nuevos secrets seguros
2. Configurar HTTPS/SSL
3. Actualizar CORS origins
4. Configurar backup automático
5. Habilitar monitoring (Sentry, etc.)
6. Configurar email SMTP real
7. Usar S3 o Cloudinary en lugar de MinIO local

## 📝 Próximos Pasos

### Fase 1 (MVP) - 6 semanas
- [x] Setup inicial Docker
- [ ] Autenticación OAuth
- [ ] CRUD Productos
- [ ] Sistema de categorías
- [ ] Carrito de compras
- [ ] Checkout básico

### Fase 2 - 6 semanas
- [ ] Integración PSE
- [ ] Clasificación avanzada
- [ ] Sistema de búsqueda
- [ ] Gestión de inventario

### Fase 3 - 6 semanas
- [ ] Programa de lealtad
- [ ] Panel admin completo
- [ ] Analytics
- [ ] Optimizaciones

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📧 Contacto

- **Email:** contacto@tiendaeducativa.com
- **Website:** https://www.tiendaeducativa.com

---

**Desarrollado con ❤️ para el aprendizaje de los niños**

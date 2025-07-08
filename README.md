# Code Arena - Frontend

A modern, responsive Angular frontend for the Code Arena gaming platform. This application provides a complete user interface for real-time competitive programming games, user management, and social features.

## 🚀 Features

### 🎮 Gaming Platform
- **Real-time Multiplayer Games**: Support for multiple concurrent game sessions
- **Game Types**:
  - **Sudoku**: Full-featured Sudoku puzzles with multiple difficulty levels
  - **Crossword**: Interactive crossword puzzles with programming-themed clues
  - **Word Search**: Dynamic word search grids with programming vocabulary
  - **Math Puzzles**: Arithmetic and algebra challenges with progressive difficulty
  - **Code Challenges**: Programming problem-solving competitions (extensible)

### 👤 User Management
- **Authentication**: Secure JWT-based login and registration
- **User Profiles**: Comprehensive user statistics and game history
- **Dashboard**: Personal performance metrics and quick access to games

### 🏆 Social & Competition
- **Room System**: Create and join game rooms with customizable settings
- **Real-time Chat**: In-game communication during multiplayer sessions
- **Leaderboards**: Track performance and compete with other players
- **Achievement System**: Progress tracking and rewards

### 🎨 UI/UX
- **Material Design**: Modern Angular Material components
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: WebSocket integration for live game state synchronization
- **Dark/Light Theme**: Adaptive theming support

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18.19.0 or higher)
- **npm** (v10.2.0 or higher)
- **Angular CLI** (v20.0.4)

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AnderssonProgramming/code-arena-rt-front.git
   cd code-arena-rt-front
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   - Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
   - Update the API endpoints to match your backend configuration:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api',
     wsUrl: 'ws://localhost:8080/ws'
   };
   ```

4. **Start the development server**:
   ```bash
   ng serve
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:4200/`
   - The application will automatically reload when you modify source files

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                     # Core services and utilities
│   │   ├── guards/              # Route guards (auth, guest)
│   │   ├── interceptors/        # HTTP interceptors (JWT auth)
│   │   ├── models/              # TypeScript interfaces and types
│   │   └── services/            # Core business services
│   │       ├── auth.service.ts       # Authentication management
│   │       ├── room.service.ts       # Room/lobby management
│   │       ├── game-history.service.ts # Game history tracking
│   │       └── websocket.service.ts  # Real-time communication
│   ├── features/                # Feature modules
│   │   ├── auth/               # Authentication (login/register)
│   │   ├── dashboard/          # User dashboard
│   │   ├── rooms/              # Room browsing and creation
│   │   ├── game/               # Game session management
│   │   │   └── games/          # Individual game implementations
│   │   │       ├── sudoku/
│   │   │       ├── crossword/
│   │   │       ├── word-search/
│   │   │       ├── math-puzzle/
│   │   │       └── code-challenge/
│   │   └── profile/            # User profile management
│   ├── shared/                 # Shared components and utilities
│   └── app.routes.ts          # Application routing configuration
├── assets/                     # Static assets
└── styles.scss               # Global styles
```

## 🎮 Game Components

### Sudoku Game
- **Library**: `sudoku-gen` for puzzle generation
- **Features**: Multiple difficulty levels, hint system, validation
- **Real-time**: Multiplayer synchronization support

### Crossword Puzzle
- **Implementation**: Custom grid-based crossword engine
- **Content**: Programming and technology-themed clues
- **Features**: Interactive grid, word highlighting, progress tracking

### Word Search
- **Algorithm**: Dynamic grid generation with word placement
- **Features**: Multi-directional word finding, selection highlighting
- **Vocabulary**: Computer science and programming terms

### Math Puzzles
- **Types**: Arithmetic, algebra, and basic geometry problems
- **Difficulty**: Adaptive difficulty scaling
- **Features**: Step-by-step hints, progress tracking, grading system

## 🔧 Available Scripts

### Development
```bash
# Start development server
ng serve

# Start with specific port
ng serve --port 4201

# Start with host binding
ng serve --host 0.0.0.0
```

### Building
```bash
# Development build
ng build

# Production build
ng build --configuration production

# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/code-arena/stats.json
```

### Testing
```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run e2e tests
ng e2e
```

### Code Quality
```bash
# Lint code
ng lint

# Format code
npx prettier --write src/**/*.{ts,html,scss}
```

## 🌐 API Integration

The frontend integrates with a Spring Boot backend through:

### REST API Endpoints
- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users/me`, `/api/users/{id}`
- **Rooms**: `/api/rooms`, `/api/rooms/{id}`
- **Games**: `/api/games`, `/api/games/{id}`
- **History**: `/api/game-history`

### WebSocket Connections
- **Game Sessions**: Real-time game state updates
- **Chat**: In-game messaging
- **Room Events**: Player join/leave notifications
- **Lobby Updates**: Room list changes

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Login/Register**: Credentials sent to backend
2. **Token Storage**: JWT stored in localStorage
3. **HTTP Interceptor**: Automatic token attachment to requests
4. **Route Guards**: Protected routes require valid authentication
5. **Auto-refresh**: Token validation and refresh handling

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Desktop**: 1024px and above (full features)
- **Tablet**: 768px - 1023px (adapted layouts)
- **Mobile**: 320px - 767px (mobile-optimized interface)

## 🔧 Configuration

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  appName: 'Code Arena',
  version: '1.0.0'
};
```

### Angular Material Theme
The application uses a custom theme based on Angular Material. You can modify colors in `src/styles.scss`:

```scss
$primary-palette: mat.define-palette(mat.$indigo-palette);
$accent-palette: mat.define-palette(mat.$pink-palette);
$warn-palette: mat.define-palette(mat.$red-palette);
```

## 🚀 Deployment

### Development Deployment
```bash
ng build
# Serve dist/ folder with any static file server
```

### Production Deployment
```bash
ng build --configuration production
# Deploy dist/ folder to your web server
```

### Docker Deployment
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ng build --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/code-arena /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend CORS configuration allows frontend origin
   - Check browser developer tools for specific CORS errors

2. **WebSocket Connection Failures**:
   - Verify WebSocket URL in environment configuration
   - Check that backend WebSocket endpoint is accessible

3. **Authentication Issues**:
   - Clear localStorage and try logging in again
   - Verify JWT token format and expiration

4. **Build Errors**:
   - Delete `node_modules` and `package-lock.json`, then run `npm install`
   - Ensure Angular CLI version compatibility

### Debug Mode
Enable debug logging by setting `localStorage.setItem('debug', 'true')` in browser console.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write unit tests for new components
- Document complex logic with comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Angular Team** - For the amazing framework
- **Material Design** - For the design system
- **sudoku-gen** - For Sudoku puzzle generation
- **Spring Boot Backend** - For robust API services

---

For backend setup and API documentation, see the [backend README](../code-arena-rt/README.md).

For questions or support, please open an issue in the repository.

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

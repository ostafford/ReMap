# ReMap: Your Interactive Memory Atlas

**ReMap is a mobile-first location memory app that transforms your experiences into an interactive, personal atlas while letting you discover authentic stories from others.**

ReMap is essentially a spatial storytelling platform where geography becomes the organizing principle for memories. Instead of scrolling through chronological feeds or searching through folders, you navigate experiences the way you actually lived them - by place.

## 🎯 Core Concept

Think of it as **"Instagram meets Google Maps meets personal diary"** - but stripped of the performative social media aspects. The app combines your phone's GPS and camera to create geotagged memory entries (photos, videos, text, audio, mood tags) that appear as pins on an interactive map.

### What Makes It Unique

The key differentiator is the **authenticity-first approach**. By removing likes, ratings, and follower counts, ReMap shifts focus from social validation to genuine memory preservation, selective sharing, and meaningful discovery. It's designed for authentic connections rather than broad social influence.

## ✨ The Experience

### Personal Memory Creation
- Use your phone's location to pin memories exactly where they happened
- Capture moments with photos, text, or voice notes attached to specific coordinates
- Build a personal atlas of your life experiences over time

### Community Discovery
- Explore others' authentic experiences at locations you're visiting or planning to visit
- Search for stories and memories tied to specific places
- Discover genuine, place-based content from real people

### Privacy Control
Users can keep their memory maps completely private, share with intimate social circles, or make select pins public. The result is a more intentional, less cluttered way to document and rediscover life experiences through the lens of place while contributing to a community-driven map of authentic local stories.

## 🏗️ Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL (with future Supabase integration)
- **Infrastructure**: Docker & Docker Compose
- **Location Services**: Expo Location API
- **Development**: TypeScript, ESLint, Health Monitoring

## 🚀 Quick Start (For Team Members)

### Prerequisites
- Docker Desktop installed and running
- Git for version control
- Mobile device with Expo Go app

### One-Command Setup

**macOS/Linux:**
```bash
./start-dev.sh
```

**Windows:**
```batch
start-dev.bat
```

**Manual IP Configuration (if auto-detection fails):**
```bash
./start-dev.sh 192.168.1.22  # Replace with your IP
```

That's it! The script will:
- 🔍 Auto-detect your network IP address
- 🐳 Build and start Docker containers
- 📦 Install all dependencies
- 🚀 Launch the Expo development server
- 📱 Display QR code for mobile testing

### What You'll See

Once running, you'll have access to:
- **Mobile App**: Scan QR code with Expo Go
- **Backend API**: `http://your-ip:3000`
- **Health Monitor**: Built-in system diagnostics
- **Web Interface**: `http://localhost:8081`

## 📱 Development Features

### Comprehensive Health Monitoring
The app includes professional-grade health monitoring that verifies:
- ✅ Backend API connectivity
- ✅ Database integration
- ✅ Location services functionality
- ✅ Device compatibility
- ✅ Network configuration

### Automatic Network Configuration
- Cross-platform IP detection (Windows, macOS, Linux)
- Zero-configuration mobile device connectivity
- Automatic container orchestration
- Environment-specific optimizations

### Mobile-First Development
- Real-time location tracking and mapping
- GPS-based memory creation interface
- Location-based memory discovery
- Comprehensive mobile debugging tools

## 🛠️ Project Structure

```
ReMap/
├── backend/
│   ├── src/
│   │   └── server.js          # Express.js API server
│   ├── package.json           # Backend dependencies
│   └── Dockerfile             # Backend container config
├── frontend/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx      # Memory map interface
│   │   │   ├── health.tsx     # System health monitor
│   │   │   ├── explore.tsx    # Memory discovery
│   │   │   └── profile.tsx    # User profile
│   │   └── services/
│   │       └── health.ts      # Backend integration service
│   ├── components/            # Reusable UI components
│   ├── constants/             # App configuration
│   ├── package.json           # Frontend dependencies
│   ├── dev-start.sh          # Development startup script
│   └── app.json              # Expo configuration
├── docker-compose.yml         # Container orchestration
├── start-dev.sh              # Cross-platform startup script
├── start-dev.bat             # Windows startup script
└── README.md                 # This file
```

## 🔧 Manual Setup (Advanced)

If you prefer manual setup or need to troubleshoot:

### 1. Environment Setup
```bash
# Clone the repository
git clone [repository-url]
cd ReMap

# Copy environment configuration
cp .env.example .env
```

### 2. Start Backend Services
```bash
# Build and start containers
docker-compose up -d

# Verify services are healthy
docker-compose ps
```

### 3. Start Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Get your network IP
# Windows: ipconfig
# macOS/Linux: ifconfig

# Start Expo with your IP
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.22
npm start
```

## 📊 Development Workflow

### Health Monitoring
The built-in health monitor provides real-time system diagnostics:
- Navigate to the "Health" tab in the mobile app
- View comprehensive system status
- Test backend connectivity
- Verify location services
- Check device compatibility

### Memory Development
The main interface demonstrates core ReMap functionality:
- Location-based memory creation
- GPS coordinate tracking
- Memory discovery and exploration
- Backend API integration

### API Testing
Backend endpoints are available at:
- `GET /health` - System health check
- `GET /api` - API information
- `GET /api/memories` - Memory data (placeholder)

## 🌐 Network Configuration

The development environment automatically handles network configuration across different platforms:

### Automatic IP Detection
- **Windows**: Uses `ipconfig` and PowerShell methods
- **macOS**: Uses `ifconfig` with network interface detection
- **Linux**: Uses `ip route` and hostname resolution
- **WSL**: Special handling for Windows Subsystem for Linux

### Mobile Device Connection
- Containers expose ports for Expo development server
- Automatic hostname resolution for mobile devices
- Cross-platform QR code generation for easy device pairing

## 🐳 Docker Configuration

### Services
- **Backend Container**: Node.js/Express.js API server
- **Database Container**: PostgreSQL with health checks
- **Shared Volumes**: Code synchronization and dependency caching

### Development Benefits
- Consistent environment across team members
- Automatic dependency management
- Zero-configuration database setup
- Professional container orchestration

## 🔍 Troubleshooting

### Common Issues

**Mobile device can't connect:**
- Ensure your device and computer are on the same network
- Check if your firewall is blocking ports 3000, 8081, 19000-19002
- Try running with explicit IP: `./start-dev.sh YOUR_IP_ADDRESS`

**Docker containers won't start:**
- Verify Docker Desktop is running
- Check for port conflicts: `docker ps` and `netstat -an`
- Try rebuilding: `docker-compose down && docker-compose up --build`

**Backend health check fails:**
- Check container logs: `docker logs remap-backend`
- Verify database connectivity: `docker logs remap-postgres`
- Test direct API access: `curl http://localhost:3000/health`

### Getting Help
1. Check the health monitor in the mobile app
2. Review container logs: `docker-compose logs`
3. Verify network connectivity with provided diagnostic tools
4. Use the built-in troubleshooting features

## 🚦 Development Status

### ✅ Completed Features
- Complete containerized development environment
- Cross-platform automatic network detection
- Comprehensive health monitoring system
- Location services integration
- Backend API with database connectivity
- Mobile-first user interface
- Professional development workflow

### 🔄 In Progress
- Interactive memory map implementation
- Photo/video capture integration
- User authentication system
- Social sharing features

### 📋 Planned Features
- Supabase integration for production database
- Advanced memory filtering and search
- Offline memory synchronization
- Enhanced privacy controls
- Community discovery algorithms

## ⚖️ License

This project is licensed under the ISC License - see the package.json files for details.

## 🤝 Contributing

We welcome contributions! Our development environment is designed for easy onboarding:

1. **Fork the repository**
2. **Run the setup script**: `./start-dev.sh`
3. **Make your changes**: All changes sync automatically
4. **Test on mobile**: Use the health monitor to verify functionality
5. **Submit a pull request**: Include screenshots of mobile testing

The zero-configuration development environment means you can start contributing immediately without complex setup procedures.

---

## 📱 For Mobile Testing

1. **Install Expo Go** on your iOS or Android device
2. **Run our startup script** on your development machine
3. **Scan the QR code** that appears in your terminal
4. **Test ReMap features** including location services and backend connectivity

The app includes comprehensive debugging information and health monitoring to help you understand how all the pieces work together.

**Ready to start building your interactive memory atlas? Run `./start-dev.sh` and let's go! 🗺️**
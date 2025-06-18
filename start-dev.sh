<<<<<<< HEAD
#!/bin/bash
# ReMap Team Development Script
# Complete setup for new team members with dependency verification

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 ReMap Development Environment Setup${NC}"
echo -e "${CYAN}====================================${NC}"

# Function to detect the host machine's network IP across all platforms
detect_host_ip() {
    echo -e "${YELLOW}🔍 Detecting your computer's network IP address...${NC}" >&2
    
    # Method 1: Windows (including WSL)
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]] || grep -q Microsoft /proc/version 2>/dev/null; then
        echo -e "${BLUE}🪟 Detected Windows environment${NC}" >&2
        
        # Try Windows ipconfig command first
        if command -v ipconfig.exe &> /dev/null; then
            DETECTED_IP=$(ipconfig.exe | grep -A 5 "Wireless LAN adapter Wi-Fi\|Ethernet adapter" | grep "IPv4 Address" | head -1 | sed 's/.*: //' | tr -d '\r\n' | grep -oE '192\.168\.[0-9]{1,3}\.[0-9]{1,3}|10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}')
            if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                echo -e "${GREEN}✅ Detected IP (Windows): $DETECTED_IP${NC}" >&2
                echo $DETECTED_IP
                return 0
            fi
        fi
        
        # Alternative Windows method using PowerShell
        if command -v powershell.exe &> /dev/null; then
            DETECTED_IP=$(powershell.exe -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' -or ($_.IPAddress -like '172.*' -and [int]($_.IPAddress.Split('.')[1]) -ge 16 -and [int]($_.IPAddress.Split('.')[1]) -le 31)} | Select-Object -First 1 -ExpandProperty IPAddress" 2>/dev/null | tr -d '\r\n')
            if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                echo -e "${GREEN}✅ Detected IP (Windows PowerShell): $DETECTED_IP${NC}" >&2
                echo $DETECTED_IP
                return 0
            fi
        fi
        
        # WSL method
        if grep -q Microsoft /proc/version 2>/dev/null; then
            DETECTED_IP=$(ip route | grep default | awk '{print $3}' | head -1)
            if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                echo -e "${GREEN}✅ Detected IP (WSL): $DETECTED_IP${NC}" >&2
                echo $DETECTED_IP
                return 0
            fi
        fi
    fi
    
    # Method 2: macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}🍎 Detected macOS environment${NC}" >&2
        DETECTED_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep -v "172\." | awk '{print $2}' | head -1)
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (macOS): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    # Method 3: Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${BLUE}🐧 Detected Linux environment${NC}" >&2
        DETECTED_IP=$(ip route get 8.8.8.8 2>/dev/null | awk -F"src " 'NR==1{split($2,a," ");print a[1]}')
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (Linux): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    # Method 4: General Unix systems (fallback)
    if command -v ifconfig &> /dev/null; then
        echo -e "${BLUE}🔧 Using generic Unix method${NC}" >&2
        DETECTED_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep -v "172\." | grep -v "169\.254\." | awk '{print $2}' | head -1)
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (Unix): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    # Method 5: Cross-platform fallback using hostname
    if command -v hostname &> /dev/null; then
        echo -e "${BLUE}🔧 Trying hostname resolution${NC}" >&2
        DETECTED_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (hostname): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Could not automatically detect your network IP${NC}" >&2
    echo -e "${YELLOW}💡 Common troubleshooting steps:${NC}" >&2
    echo -e "${YELLOW}   Windows: Check 'ipconfig' output for your network adapter${NC}" >&2
    echo -e "${YELLOW}   macOS: Check 'ifconfig' output for en0 or similar${NC}" >&2
    echo -e "${YELLOW}   Linux: Try 'ip addr show' or 'hostname -I'${NC}" >&2
    return 1
}

# Function to ensure containers are built and running (cross-platform)
setup_containers() {
    echo -e "${BLUE}🐳 Setting up Docker containers...${NC}"
    
    # Check if Docker is running (cross-platform)
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running.${NC}"
        
        # Platform-specific Docker Desktop suggestions
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]]; then
            echo -e "${YELLOW}💡 Windows: Please start Docker Desktop from the Start Menu${NC}"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo -e "${YELLOW}💡 macOS: Please start Docker Desktop from Applications${NC}"
        else
            echo -e "${YELLOW}💡 Linux: Please start Docker service: sudo systemctl start docker${NC}"
        fi
        
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        echo -e "${RED}❌ Docker Compose is not available${NC}"
        echo -e "${YELLOW}💡 Please install Docker Desktop which includes Docker Compose${NC}"
        exit 1
    fi
    
    # Use docker compose or docker-compose based on availability
    DOCKER_COMPOSE_CMD="docker-compose"
    if docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    fi
    
    # Build containers if needed
    if ! docker images | grep -q ReMap; then
        echo -e "${YELLOW}🔨 Building containers for the first time (this may take a few minutes)...${NC}"
        $DOCKER_COMPOSE_CMD build
    fi
    
    # Start containers
    if ! docker ps | grep -q remap-container; then
        echo -e "${YELLOW}🚀 Starting containers...${NC}"
        $DOCKER_COMPOSE_CMD up -d
        
        echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
        sleep 10
        
        # Wait for backend to be healthy
        echo -e "${YELLOW}🔍 Checking backend health...${NC}"
        for i in {1..30}; do
            if docker exec remap-container curl -f http://localhost:3000/health >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Backend is healthy!${NC}"
                break
            fi
            sleep 2
            echo -n "."
        done
        echo ""
    else
        echo -e "${GREEN}✅ Containers are already running${NC}"
    fi
}

# Function to install frontend dependencies if missing
ensure_frontend_dependencies() {
    echo -e "${BLUE}📦 Verifying frontend dependencies...${NC}"
    
    # Check if node_modules exists and has the right packages
    if ! docker exec remap-container bash -c "cd /workspace/frontend && [ -f node_modules/expo/package.json ]"; then
        echo -e "${YELLOW}📥 Installing frontend dependencies...${NC}"
        docker exec remap-container bash -c "cd /workspace/frontend && npm install"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Frontend dependencies installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Frontend dependencies are ready${NC}"
    fi
}

prompt_cache_reset() {
    echo ""
    echo -e "${BLUE}🔄 Development Options:${NC}"
    echo -e "${YELLOW}   Reset cache? This helps if you're experiencing build issues${NC}"
    echo -e "${YELLOW}   or components aren't updating properly.${NC}"
    echo ""
    echo -e "${CYAN}Reset Expo/Metro cache? (y/N): ${NC}"
    
    # Read user input with timeout
    read -t 10 -n 1 reset_choice
    echo ""
    
    # Handle the response
    if [[ $reset_choice =~ ^[Yy]$ ]]; then
        EXPO_CACHE_FLAG="--clear"
        echo -e "${GREEN}✅ Will reset cache - this may take a bit longer${NC}"
        echo -e "${BLUE}💡 Cache reset helps with: outdated components, build errors, hot reload issues${NC}"
    elif [[ -z $reset_choice ]]; then
        # Timeout occurred
        EXPO_CACHE_FLAG=""
        echo -e "${GREEN}✅ Using existing cache (timed out - continuing normally)${NC}"
    else
        EXPO_CACHE_FLAG=""
        echo -e "${GREEN}✅ Using existing cache for faster startup${NC}"
    fi
    
    echo ""
}

# Main setup function
main() {
    # Get IP address
    if [ $# -eq 1 ]; then
        HOST_IP=$1
        echo -e "${BLUE}📍 Using provided IP address: $HOST_IP${NC}"
    else
        HOST_IP=$(detect_host_ip)
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}Please run: $0 YOUR_IP_ADDRESS${NC}"
            echo -e "${YELLOW}Example: $0 192.168.1.22${NC}"
            exit 1
        fi
    fi

    # Validate IP format
    if ! [[ $HOST_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        echo -e "${RED}❌ Invalid IP address format: $HOST_IP${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Using IP address: $HOST_IP${NC}"
    echo ""

    # Setup containers
    setup_containers
    
    # Ensure dependencies are installed
    ensure_frontend_dependencies

    prompt_cache_reset
    
    echo ""
    echo -e "${CYAN}📱 Starting Expo development server...${NC}"
    echo -e "${BLUE}📊 Configuration:${NC}"
    echo -e "   🌐 Host IP: $HOST_IP"
    echo -e "   📱 Expo URL: exp://$HOST_IP:8081"
    echo -e "   🔗 Backend URL: http://$HOST_IP:3000"
    echo -e "   🌐 Web URL: http://localhost:8081"
    echo ""
    echo -e "${YELLOW}📱 Instructions:${NC}"
    echo -e "   1. Open Expo Go app on your mobile device"
    echo -e "   2. Scan the QR code that appears below"
    echo -e "   3. Your ReMap app will load on your device"
    echo ""
    echo -e "${CYAN}🚀 Starting development server...${NC}"
    echo ""

    # Start Expo with proper environment configuration
    docker exec -it remap-container bash -c "
        cd /workspace/frontend && 
        export REACT_NATIVE_PACKAGER_HOSTNAME=$HOST_IP && 
        export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 && 
        echo 'Environment configured:' &&
        echo '  REACT_NATIVE_PACKAGER_HOSTNAME='$HOST_IP &&
        echo '  EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0' &&
        echo '' &&
        npx expo start --host lan $EXPO_CACHE_FLAG
    "
}

# Handle script arguments
case "${1:-main}" in
    "help"|"-h"|"--help")
        echo "ReMap Development Environment Setup"
        echo ""
        echo "Usage: $0 [IP_ADDRESS]"
        echo ""
        echo "Commands:"
        echo "  $0              Auto-detect IP and start development server"
        echo "  $0 192.168.1.22 Use specific IP address"
        echo "  $0 help         Show this help message"
        echo ""
        echo "This script will:"
        echo "  - Detect your network IP automatically"
        echo "  - Build and start Docker containers"
        echo "  - Install any missing dependencies"
        echo "  - Start Expo development server"
        echo "  - Configure everything for mobile development"
        ;;
    *)
        main "$@"
        ;;
=======
#!/bin/bash
# ReMap Team Development Script
# Complete setup for new team members with dependency verification

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 ReMap Development Environment Setup${NC}"
echo -e "${CYAN}====================================${NC}"

# Function to detect the host machine's network IP across all platforms
detect_host_ip() {
    echo -e "${YELLOW}🔍 Detecting your computer's network IP address...${NC}" >&2
    
    # Method 1: Windows (including WSL)
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]] || grep -q Microsoft /proc/version 2>/dev/null; then
        echo -e "${BLUE}🪟 Detected Windows environment${NC}" >&2
        
        # Try Windows ipconfig command first
        if command -v ipconfig.exe &> /dev/null; then
            DETECTED_IP=$(ipconfig.exe | grep -A 5 "Wireless LAN adapter Wi-Fi\|Ethernet adapter" | grep "IPv4 Address" | head -1 | sed 's/.*: //' | tr -d '\r\n' | grep -oE '192\.168\.[0-9]{1,3}\.[0-9]{1,3}|10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}')
            if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                echo -e "${GREEN}✅ Detected IP (Windows): $DETECTED_IP${NC}" >&2
                echo $DETECTED_IP
                return 0
            fi
        fi
        
        # Alternative Windows method using PowerShell
        if command -v powershell.exe &> /dev/null; then
            DETECTED_IP=$(powershell.exe -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' -or ($_.IPAddress -like '172.*' -and [int]($_.IPAddress.Split('.')[1]) -ge 16 -and [int]($_.IPAddress.Split('.')[1]) -le 31)} | Select-Object -First 1 -ExpandProperty IPAddress" 2>/dev/null | tr -d '\r\n')
            if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                echo -e "${GREEN}✅ Detected IP (Windows PowerShell): $DETECTED_IP${NC}" >&2
                echo $DETECTED_IP
                return 0
            fi
        fi
        
        # WSL method
        if grep -q Microsoft /proc/version 2>/dev/null; then
            DETECTED_IP=$(ip route | grep default | awk '{print $3}' | head -1)
            if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                echo -e "${GREEN}✅ Detected IP (WSL): $DETECTED_IP${NC}" >&2
                echo $DETECTED_IP
                return 0
            fi
        fi
    fi
    
    # Method 2: macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}🍎 Detected macOS environment${NC}" >&2
        DETECTED_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep -v "172\." | awk '{print $2}' | head -1)
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (macOS): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    # Method 3: Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${BLUE}🐧 Detected Linux environment${NC}" >&2
        DETECTED_IP=$(ip route get 8.8.8.8 2>/dev/null | awk -F"src " 'NR==1{split($2,a," ");print a[1]}')
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (Linux): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    # Method 4: General Unix systems (fallback)
    if command -v ifconfig &> /dev/null; then
        echo -e "${BLUE}🔧 Using generic Unix method${NC}" >&2
        DETECTED_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep -v "172\." | grep -v "169\.254\." | awk '{print $2}' | head -1)
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (Unix): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    # Method 5: Cross-platform fallback using hostname
    if command -v hostname &> /dev/null; then
        echo -e "${BLUE}🔧 Trying hostname resolution${NC}" >&2
        DETECTED_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
        if [[ $DETECTED_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo -e "${GREEN}✅ Detected IP (hostname): $DETECTED_IP${NC}" >&2
            echo $DETECTED_IP
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Could not automatically detect your network IP${NC}" >&2
    echo -e "${YELLOW}💡 Common troubleshooting steps:${NC}" >&2
    echo -e "${YELLOW}   Windows: Check 'ipconfig' output for your network adapter${NC}" >&2
    echo -e "${YELLOW}   macOS: Check 'ifconfig' output for en0 or similar${NC}" >&2
    echo -e "${YELLOW}   Linux: Try 'ip addr show' or 'hostname -I'${NC}" >&2
    return 1
}

# Function to ensure containers are built and running (cross-platform)
setup_containers() {
    echo -e "${BLUE}🐳 Setting up Docker containers...${NC}"
    
    # Check if Docker is running (cross-platform)
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running.${NC}"
        
        # Platform-specific Docker Desktop suggestions
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]]; then
            echo -e "${YELLOW}💡 Windows: Please start Docker Desktop from the Start Menu${NC}"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo -e "${YELLOW}💡 macOS: Please start Docker Desktop from Applications${NC}"
        else
            echo -e "${YELLOW}💡 Linux: Please start Docker service: sudo systemctl start docker${NC}"
        fi
        
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        echo -e "${RED}❌ Docker Compose is not available${NC}"
        echo -e "${YELLOW}💡 Please install Docker Desktop which includes Docker Compose${NC}"
        exit 1
    fi
    
    # Use docker compose or docker-compose based on availability
    DOCKER_COMPOSE_CMD="docker-compose"
    if docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    fi
    
    # Build containers if needed
    if ! docker images | grep -q ReMap; then
        echo -e "${YELLOW}🔨 Building containers for the first time (this may take a few minutes)...${NC}"
        $DOCKER_COMPOSE_CMD build
    fi
    
    # Start containers
    if ! docker ps | grep -q remap-container; then
        echo -e "${YELLOW}🚀 Starting containers...${NC}"
        $DOCKER_COMPOSE_CMD up -d
        
        echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
        sleep 10
        
        # Wait for backend to be healthy
        echo -e "${YELLOW}🔍 Checking backend health...${NC}"
        for i in {1..30}; do
            if docker exec remap-container curl -f http://localhost:3000/health >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Backend is healthy!${NC}"
                break
            fi
            sleep 2
            echo -n "."
        done
        echo ""
    else
        echo -e "${GREEN}✅ Containers are already running${NC}"
    fi
}

# Function to install frontend dependencies if missing
ensure_frontend_dependencies() {
    echo -e "${BLUE}📦 Verifying frontend dependencies...${NC}"
    
    # Check if node_modules exists and has the right packages
    if ! docker exec remap-container bash -c "cd /workspace/frontend && [ -f node_modules/expo/package.json ]"; then
        echo -e "${YELLOW}📥 Installing frontend dependencies...${NC}"
        docker exec remap-container bash -c "cd /workspace/frontend && npm install"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Frontend dependencies installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Frontend dependencies are ready${NC}"
    fi
}

# Main setup function
main() {
    # Get IP address
    if [ $# -eq 1 ]; then
        HOST_IP=$1
        echo -e "${BLUE}📍 Using provided IP address: $HOST_IP${NC}"
    else
        HOST_IP=$(detect_host_ip)
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}Please run: $0 YOUR_IP_ADDRESS${NC}"
            echo -e "${YELLOW}Example: $0 192.168.1.22${NC}"
            exit 1
        fi
    fi

    # Validate IP format
    if ! [[ $HOST_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        echo -e "${RED}❌ Invalid IP address format: $HOST_IP${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Using IP address: $HOST_IP${NC}"
    echo ""

    # Setup containers
    setup_containers
    
    # Ensure dependencies are installed
    ensure_frontend_dependencies
    
    echo ""
    echo -e "${CYAN}📱 Starting Expo development server...${NC}"
    echo -e "${BLUE}📊 Configuration:${NC}"
    echo -e "   🌐 Host IP: $HOST_IP"
    echo -e "   📱 Expo URL: exp://$HOST_IP:8081"
    echo -e "   🔗 Backend URL: http://$HOST_IP:3000"
    echo -e "   🌐 Web URL: http://localhost:8081"
    echo ""
    echo -e "${YELLOW}📱 Instructions:${NC}"
    echo -e "   1. Open Expo Go app on your mobile device"
    echo -e "   2. Scan the QR code that appears below"
    echo -e "   3. Your ReMap app will load on your device"
    echo ""
    echo -e "${CYAN}🚀 Starting development server...${NC}"
    echo ""

    # Start Expo with proper environment configuration
    docker exec -it remap-container bash -c "
        cd /workspace/frontend && 
        export REACT_NATIVE_PACKAGER_HOSTNAME=$HOST_IP && 
        export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 && 
        echo 'Environment configured:' &&
        echo '  REACT_NATIVE_PACKAGER_HOSTNAME='$HOST_IP &&
        echo '  EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0' &&
        echo '' &&
        npx expo start --host lan
    "
}

# Handle script arguments
case "${1:-main}" in
    "help"|"-h"|"--help")
        echo "ReMap Development Environment Setup"
        echo ""
        echo "Usage: $0 [IP_ADDRESS]"
        echo ""
        echo "Commands:"
        echo "  $0              Auto-detect IP and start development server"
        echo "  $0 192.168.1.22 Use specific IP address"
        echo "  $0 help         Show this help message"
        echo ""
        echo "This script will:"
        echo "  - Detect your network IP automatically"
        echo "  - Build and start Docker containers"
        echo "  - Install any missing dependencies"
        echo "  - Start Expo development server"
        echo "  - Configure everything for mobile development"
        ;;
    *)
        main "$@"
        ;;
>>>>>>> origin/backend
esac
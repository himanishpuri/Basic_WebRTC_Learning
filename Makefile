.PHONY: install-all start-all build-all client-dev server-dev client-build server-build

# Install all dependencies
install-all:
	cd server && npm install
	cd client && npm install

# Start development servers
start-all:
	make -j 2 client-dev server-dev

# Build both client and server
build-all:
	cd client && npm run build
	cd server && npm run build

# Start client in dev mode
client-dev:
	cd client && npm run dev

# Start server in dev mode
server-dev:
	cd server && npm run dev

# Build client
client-build:
	cd client && npm run build

# Build server
server-build:
	cd server && npm run build

# Start production server
start-prod:
	cd server && npm start
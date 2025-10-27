# RMD Admin Dashboard Backend

Backend API for the RMD Admin Dashboard application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env` file and update database credentials

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Grants
- `GET /api/grants` - Get all grants
- `GET /api/grants/:type` - Get grants by type (GIA, IDIG, LAKAS, PCARI, SALIKHA, DARETO, NAFES)
- `POST /api/grants/upload` - Upload CSV data

### NAFES
- `GET /api/nafes/overview` - Get overview statistics
- `GET /api/nafes/priority-area` - Get priority area data
- `GET /api/nafes/yearly-trends` - Get yearly trends data
- `GET /api/nafes/region` - Get region data
- `GET /api/nafes/hei-type` - Get HEI type data
- `GET /api/nafes/status` - Get status distribution

## Tech Stack
- Node.js
- Express.js
- MySQL
- CORS enabled for frontend integration

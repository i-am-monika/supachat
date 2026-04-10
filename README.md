# SupaChat 🤖

A conversational analytics app that lets you query a blog analytics database in natural language.

## Architecture
User → Nginx (port 80)
├── / → Next.js Frontend (port 3001)
└── /api → Node.js Backend (port 3000)
└── Supabase PostgreSQL
Prometheus (port 9090) → scrapes backend /metrics
Grafana (port 3002) → visualizes Prometheus data
## Tech Stack

- **Frontend**: Next.js + Recharts
- **Backend**: Node.js + Express
- **Database**: Supabase PostgreSQL
- **Reverse Proxy**: Nginx
- **Containers**: Docker + docker-compose
- **CI/CD**: GitHub Actions → GHCR
- **Monitoring**: Prometheus + Grafana

## Setup

### 1. Clone the repo
git clone https://github.com/i-am-monika/supachat
cd supachat/supachat

### 2. Add environment variables
Create backend/.env with:
- PORT=3000
- SUPABASE_URL=your-supabase-url
- SUPABASE_ANON_KEY=your-anon-key
- DATABASE_URL=your-connection-string
- GEMINI_API_KEY=your-gemini-key

### 3. Run locally
cd supachat/supachat
docker-compose up --build

App runs at:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Nginx: http://localhost:80
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin / supachat123)

## Example Queries

- "Show top 3 articles by likes"
- "Compare engagement by topic"
- "Show views trend"
- "List articles by author"

## CI/CD

Every push to main triggers GitHub Actions:
1. Install dependencies
2. Build frontend
3. Build Docker images
4. Push to GitHub Container Registry (ghcr.io)

## Monitoring

- Prometheus scrapes /metrics every 15 seconds
- Grafana visualizes request latency, CPU, memory
- Default Grafana login: admin / supachat123

## AI Tools Used

- Claude (Anthropic) — backend scaffolding, docker-compose, CI/CD pipeline
- GitHub Copilot — frontend component suggestions
- Warp terminal — debugging assistance

## Known Limitations

- NL→SQL uses keyword matching (AI API integration ready, pending credits)
- Loki log aggregation planned for next iteration
- RLS disabled for development; would be enabled in production
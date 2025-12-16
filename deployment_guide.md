# Egypt Market Intelligence AI - Deployment Guide

This guide explains how to deploy the application using Docker.

## Prerequisites
-   **Docker Desktop** installed and running.
-   **Git** installed.

## Quick Start

1.  **Clone the Repository** (if not already done):
    ```bash
    git clone <repository-url>
    cd egypt_market_intelligence
    ```

2.  **Configure Environment Variables**:
    Ensure `backend/.env` exists and contains your API keys:
    ```env
    GEMINI_API_KEY=your_gemini_key
    GOOGLE_SHEET_ID=your_google_sheet_csv_url
    ```

3.  **Build and Run**:
    Open a terminal in the project root and run:
    ```bash
    docker-compose up --build
    ```

4.  **Access the App**:
    -   **Frontend**: Open [http://localhost:3000](http://localhost:3000)
    -   **Backend API**: [http://localhost:8000](http://localhost:8000)
    -   **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Troubleshooting

-   **Port Conflicts**: If ports 3000 or 8000 are in use, edit `docker-compose.yml` to map to different host ports (e.g., `"3002:3000"`).
-   **Database**: The current version uses an in-memory database. Data is lost when containers restart. For production, connect to a persistent database (PostgreSQL/MongoDB).
-   **Hot Reloading**: The `volumes` configuration in `docker-compose.yml` enables hot reloading for the backend during development.

## Stopping the App
Press `Ctrl+C` in the terminal, or run:
```bash
docker-compose down
```

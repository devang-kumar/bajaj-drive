# Hierarchy Analyzer

A full-stack application that analyzes hierarchical relationships from parent-child edge data and generates structured hierarchy outputs.

## Features

- Builds hierarchical tree structures
- Detects cyclic relationships
- Identifies duplicate edges
- Validates input format
- Handles multi-parent nodes using the first-parent-wins rule
- Generates hierarchy summaries

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

## Live Demo

Frontend: https://bajaj-drive-mu.vercel.app/

Backend API: https://bajaj-drive.onrender.com/bfhl

## Input Format

Enter edges as a comma-separated list:

```text
A->B,A->C,B->D
```

## API Endpoint

```http
POST /bfhl
```

Example Request:

```json
{
  "data": [
    "A->B",
    "A->C",
    "B->D"
  ]
}
```

## Deployment

- Frontend hosted on Vercel
- Backend hosted on Render

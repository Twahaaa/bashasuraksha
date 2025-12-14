# BhashaSuraksha 🛡️🗣️

> **Preserving India's Linguistic Heritage through AI**

BhashaSuraksha is an open-source platform designed to document, preserve, and analyze endangered and low-resource Indian languages. It leverages advanced speech processing, machine learning, and geospatial visualization to create a living digital archive of India's diverse linguistic landscape.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

- **🎙️ Audio Collection**: Secure upload and recording interface for gathering speech samples from diverse regions.
- **🤖 AI-Powered Analysis**:
  - **Transcription**: Automatic speech-to-text using **OpenAI Whisper**.
  - **Dialect Identification**: Acoustic embedding extraction using **wav2vec2**.
  - **Semantic Analysis**: Keyword extraction and cultural context analysis using **Google Gemini AI**.
- **🔍 Unsupervised Clustering**: Automatically groups unknown or undocumented dialects using **DBSCAN** and **Cosine Similarity** on acoustic embeddings.
- **🗺️ Geospatial Heatmap**: Interactive visualization of language distribution and dialect clusters using **MapLibre**.
- **☁️ Scalable Architecture**: Built on **Azure Blob Storage** and **PostgreSQL** for robust data handling.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (React)
- **Styling**: Tailwind CSS, Framer Motion
- **Maps**: MapLibre GL JS
- **State Management**: React Hooks

### Backend (ML Service)

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **ML Models**:
  - `openai/whisper` (Transcription)
  - `facebook/wav2vec2-large-xlsr-53` (Embeddings)
  - `scikit-learn` (Clustering)
- **Processing**: Librosa, NumPy, PyTorch

### Infrastructure & Data

- **Database**: PostgreSQL (with Prisma ORM)
- **Storage**: Azure Blob Storage
- **AI Services**: Google Gemini API
- **Containerization**: Docker

## 🏗️ Architecture

The system consists of two main microservices:

1. **Frontend (Next.js)**: Handles user interaction, audio recording, and visualization. It communicates directly with Azure for uploads and the ML service for processing.
2. **ML Service (FastAPI)**: Processes audio files to extract transcripts and embeddings, performs clustering, and manages the vector database.

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL
- Azure Storage Account
- Google Gemini API Key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Twahaaa/bashasuraksha.git
   cd bashasuraksha
   ```

2. **Setup Frontend**

   ```bash
   cd frontend
   npm install

   # Create .env file
   cp .env.example .env.local
   # Update .env.local with your credentials

   npm run dev
   ```

3. **Setup ML Service**

   ```bash
   cd ml
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt

   # Create .env file
   cp .env.example .env
   # Update .env with your credentials

   uvicorn app.main:app --reload --port 8000
   ```

## 🧪 Environment Variables

### Frontend (.env)

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_AZURE_STORAGE_SAS_URL="..."
GEMINI_API_KEY="..."
```

### ML Service (.env)

```env
DATABASE_URL="postgresql://..."
AZURE_STORAGE_CONNECTION_STRING="..."
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

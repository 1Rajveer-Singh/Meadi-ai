# 🧠 MONAI Agent Dockerfile

FROM python:3.11-slim

# Install system dependencies for medical imaging
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgdcm-tools \
    dcmtk \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY . .

# Create non-root user
RUN groupadd -r monai && useradd -r -g monai monai
RUN chown -R monai:monai /app
USER monai

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=60s --retries=3 \
    CMD python -c "import torch; print('MONAI Agent healthy, GPU:', torch.cuda.is_available())"

# Run the agent
CMD ["python", "monai_agent.py"]
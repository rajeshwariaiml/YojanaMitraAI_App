# Models Directory

This directory stores embedding model configurations and weights.

## Production Setup

To use full sentence-transformer embeddings:

```bash
pip install sentence-transformers
```

The model `all-MiniLM-L6-v2` will be auto-downloaded on first use (~80MB).

## Demo Mode

In demo mode, the pipeline uses a lightweight character-ngram hashing
function that requires no external model downloads. See `config.json`
for configuration details.

"""
Semantic Similarity Search Module
==================================
Uses sentence-transformer embeddings to compute cosine similarity
between user intent text and scheme descriptions, enabling semantic
matching beyond keyword overlap.

Supports two backends:
1. ChromaDB (vector database) for persistent indexed search
2. In-memory NumPy fallback for lightweight demo environments

Pipeline Stage: 3 (Semantic Matching)
"""

import json
import os
import math
from typing import Dict, Any, List, Optional


def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two vectors (pure Python)."""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _simple_embedding(text: str, dim: int = 128) -> List[float]:
    """
    Lightweight deterministic text embedding for demo purposes.
    Uses character-level hashing to create a fixed-dimension vector.

    In production, replace with:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = model.encode(text)

    Args:
        text: Input text string.
        dim: Embedding dimension.

    Returns:
        Normalized float vector of length `dim`.
    """
    text = text.lower().strip()
    vec = [0.0] * dim

    # Character n-gram hashing
    for i, ch in enumerate(text):
        idx = (ord(ch) * (i + 1)) % dim
        vec[idx] += 1.0

    # Bigram features
    words = text.split()
    for i in range(len(words) - 1):
        bigram = words[i] + " " + words[i + 1]
        idx = hash(bigram) % dim
        vec[abs(idx)] += 0.5

    # Normalize to unit vector
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]

    return vec


class SemanticSimilaritySearch:
    """
    Performs semantic similarity matching between user queries
    and scheme descriptions using vector embeddings.

    Pipeline Stage: 3

    Architecture:
    ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
    │  User Query   │────▶│  Embedding Model  │────▶│  Query Vector  │
    └──────────────┘     └──────────────────┘     └───────┬────────┘
                                                          │
    ┌──────────────┐     ┌──────────────────┐     ┌───────▼────────┐
    │  Scheme Desc  │────▶│  Embedding Model  │────▶│ Cosine Sim.    │
    └──────────────┘     └──────────────────┘     └────────────────┘

    In production, use sentence-transformers + ChromaDB:
        pip install sentence-transformers chromadb
    """

    def __init__(self, use_chromadb: bool = False, embedding_dim: int = 128):
        """
        Args:
            use_chromadb: Whether to use ChromaDB for vector storage.
            embedding_dim: Dimension of embedding vectors.
        """
        self.embedding_dim = embedding_dim
        self.use_chromadb = use_chromadb
        self.scheme_embeddings: Dict[str, List[float]] = {}
        self.scheme_texts: Dict[str, str] = {}
        self.collection = None

        if use_chromadb:
            self._init_chromadb()

    def _init_chromadb(self):
        """Initialize ChromaDB collection for vector storage."""
        try:
            import chromadb
            client = chromadb.Client()
            self.collection = client.get_or_create_collection(
                name="scheme_embeddings",
                metadata={"hnsw:space": "cosine"},
            )
            print("✓ ChromaDB initialized successfully")
        except ImportError:
            print("⚠ ChromaDB not installed. Using in-memory fallback.")
            print("  Install with: pip install chromadb")
            self.use_chromadb = False

    def index_schemes(self, schemes: List[Dict[str, Any]]) -> None:
        """
        Build vector index from scheme data.

        For each scheme, creates a composite text representation combining
        name, category, target group, benefits, and description fields,
        then computes and stores its embedding vector.

        Args:
            schemes: List of scheme dictionaries from the database.
        """
        for scheme in schemes:
            scheme_id = str(scheme.get("id", ""))
            # Create composite text for better semantic representation
            text_parts = [
                scheme.get("scheme_name", ""),
                scheme.get("category", ""),
                scheme.get("target_group", ""),
                scheme.get("benefits", ""),
                scheme.get("description", "") or "",
                f"state {scheme.get('state', 'All India')}",
                f"for {scheme.get('gender', 'All')}",
            ]
            composite_text = " ".join(filter(None, text_parts))
            self.scheme_texts[scheme_id] = composite_text

            embedding = _simple_embedding(composite_text, self.embedding_dim)
            self.scheme_embeddings[scheme_id] = embedding

            if self.use_chromadb and self.collection is not None:
                self.collection.upsert(
                    ids=[scheme_id],
                    embeddings=[embedding],
                    documents=[composite_text],
                    metadatas=[{"scheme_name": scheme.get("scheme_name", "")}],
                )

        print(f"✓ Indexed {len(schemes)} schemes for semantic search")

    def search(
        self, query: str, top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find top-k most semantically similar schemes to the query.

        Args:
            query: User's natural language query or profile description.
            top_k: Number of results to return.

        Returns:
            List of dicts with keys: scheme_id, similarity_score, scheme_text
        """
        query_embedding = _simple_embedding(query, self.embedding_dim)

        if self.use_chromadb and self.collection is not None:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, len(self.scheme_embeddings)),
            )
            return [
                {
                    "scheme_id": sid,
                    "similarity_score": round(1 - dist, 4),
                    "scheme_text": doc,
                }
                for sid, dist, doc in zip(
                    results["ids"][0],
                    results["distances"][0],
                    results["documents"][0],
                )
            ]

        # In-memory cosine similarity search
        scores = []
        for scheme_id, scheme_emb in self.scheme_embeddings.items():
            sim = _cosine_similarity(query_embedding, scheme_emb)
            scores.append(
                {
                    "scheme_id": scheme_id,
                    "similarity_score": round(sim, 4),
                    "scheme_text": self.scheme_texts.get(scheme_id, ""),
                }
            )

        scores.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scores[:top_k]


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    searcher = SemanticSimilaritySearch(use_chromadb=False)

    sample_schemes = [
        {"id": "1", "scheme_name": "PM Kisan Samman Nidhi", "category": "Agriculture",
         "target_group": "Farmers", "benefits": "₹6,000 per year direct transfer",
         "state": "All India", "gender": "All", "description": "Income support for farmers"},
        {"id": "2", "scheme_name": "Beti Bachao Beti Padhao", "category": "Women & Child",
         "target_group": "Girls", "benefits": "Education and welfare support for girl child",
         "state": "All India", "gender": "Female", "description": "Girl child education scheme"},
        {"id": "3", "scheme_name": "PM Awas Yojana", "category": "Housing",
         "target_group": "BPL Families", "benefits": "₹2.67 lakh housing subsidy",
         "state": "All India", "gender": "All", "description": "Affordable housing for poor"},
    ]

    searcher.index_schemes(sample_schemes)

    query = "I am a farmer looking for income support"
    results = searcher.search(query, top_k=3)

    print(f"\nQuery: {query}\n")
    for r in results:
        print(f"  {r['scheme_id']}: similarity={r['similarity_score']:.4f}")

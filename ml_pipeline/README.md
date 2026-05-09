# YojanaMitraAI — ML Recommendation Pipeline

## Overview

This directory contains the complete machine learning pipeline for the
YojanaMitraAI Government Scheme Recommendation System. The pipeline uses
a hybrid approach combining NLP entity extraction, rule-based filtering,
semantic similarity search, weighted eligibility scoring, and explainable AI.

## Architecture

```
User Input (text or form)
       │
       ▼
┌─────────────────────┐
│  NLP Entity          │  Stage 1: Extract demographics from natural language
│  Extractor           │  (age, gender, income, state, occupation, etc.)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Rule-Based          │  Stage 2: Filter schemes by hard eligibility rules
│  Filter              │  (age range, income cap, gender, state, occupation)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Semantic Similarity │  Stage 3: Vector similarity between user intent
│  Search              │  and scheme descriptions (cosine similarity)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Eligibility Score   │  Stage 4: Weighted attribute matching to compute
│  Calculator          │  percentage eligibility (0–100%)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Scheme Ranker       │  Stage 5: Hybrid ranking combining rule score (60%),
│                      │  semantic score (30%), and bonus factors (10%)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Explainability      │  Stage 6: Generate human-readable explanations
│  Engine              │  for each recommendation
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Gap Analyzer        │  Stage 7: Identify missing criteria and suggest
│                      │  improvement steps
└─────────┬───────────┘
          ▼
     JSON Output
```

## Modules

| Module | File | Purpose |
|--------|------|---------|
| NLP Entity Extractor | `nlp_entity_extractor.py` | Regex + keyword NLP to extract demographics |
| Rule-Based Filter | `rule_based_filter.py` | Deterministic eligibility rule evaluation |
| Semantic Search | `semantic_similarity_search.py` | Cosine similarity with vector embeddings |
| Score Calculator | `eligibility_score_calculator.py` | Weighted multi-attribute scoring |
| Scheme Ranker | `scheme_ranker.py` | Hybrid ranking (rule + semantic + bonus) |
| Explainability Engine | `explainability_engine.py` | Natural language explanation generation |
| Gap Analyzer | `eligibility_gap_analyzer.py` | Gap identification + improvement suggestions |
| Pipeline Orchestrator | `recommendation_pipeline.py` | End-to-end pipeline combining all modules |

## Scoring Strategy

### Attribute Weights
| Attribute | Weight | Rationale |
|-----------|--------|-----------|
| Age | 20 | Primary eligibility determinant |
| Income | 20 | Key financial threshold |
| State | 15 | Geographic restriction |
| Education | 15 | Qualification requirement |
| Gender | 10 | Demographic targeting |
| Occupation | 10 | Occupational targeting |
| Category | 10 | Social category targeting |

### Hybrid Ranking Formula
```
final_score = 0.6 × rule_score + 0.3 × semantic_score + 0.1 × bonus
```

### Eligibility Status Thresholds
- **Eligible** (≥70%): Strong match — user meets most criteria
- **Partial** (40–69%): Some criteria met — gaps exist
- **Not Eligible** (<40%): Major disqualifying factors

## Semantic Matching

The semantic search module supports two backends:

1. **Production**: `sentence-transformers/all-MiniLM-L6-v2` + ChromaDB
2. **Demo**: Character n-gram hashing with in-memory cosine similarity

Install production dependencies:
```bash
pip install sentence-transformers chromadb
```

## Running Locally

```bash
# Install minimal dependencies (demo mode — no GPU needed)
pip install numpy

# Run the full pipeline demo
python -m ml_pipeline.recommendation_pipeline

# Run individual modules
python -m ml_pipeline.nlp_entity_extractor
python -m ml_pipeline.rule_based_filter
python -m ml_pipeline.eligibility_score_calculator
```

## Output Format

```json
{
  "scheme_name": "PM Kisan Samman Nidhi",
  "match_percentage": 82.5,
  "eligibility_status": "eligible",
  "missing_criteria": [],
  "explanation": "This scheme is highly recommended. It matches your age range, income level, geographic location, and occupation type.",
  "gap_analysis": {
    "gaps": [],
    "improvement_steps": [],
    "achievable": true
  }
}
```

## Integration with Backend

The Edge Function `recommend-schemes` implements the same logic as this
pipeline in TypeScript/Deno for serverless deployment. This Python pipeline
serves as the reference implementation for academic evaluation and local
demonstration.

To run the pipeline as a standalone API:
```bash
pip install fastapi uvicorn
uvicorn ml_pipeline.api_server:app --reload --port 8000
```

## Directory Structure

```
ml_pipeline/
├── __init__.py                    # Package init
├── README.md                      # This documentation
├── nlp_entity_extractor.py        # Stage 1: NLP parsing
├── rule_based_filter.py           # Stage 2: Rule filtering
├── semantic_similarity_search.py  # Stage 3: Semantic search
├── eligibility_score_calculator.py # Stage 4: Scoring
├── scheme_ranker.py               # Stage 5: Ranking
├── explainability_engine.py       # Stage 6: Explanations
├── eligibility_gap_analyzer.py    # Stage 7: Gap analysis
├── recommendation_pipeline.py     # Orchestrator
├── models/
│   ├── config.json                # Model configuration
│   └── README.md                  # Model setup guide
├── dataset/
│   └── schemes_sample.json        # Sample scheme data
└── utils/
    ├── __init__.py
    └── preprocessing.py           # Text cleaning utilities
```

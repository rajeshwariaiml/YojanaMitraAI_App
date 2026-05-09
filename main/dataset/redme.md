📊 Dataset & Data Engineering
This project is powered by a curated dataset of 527 government welfare schemes, specifically designed to bridge the information gap for digitally underserved citizens.
1. Dataset Overview
Total Schemes: 527 (Central and Karnataka State Government).
Categories: Education, Healthcare, Agriculture, Women & Child Development, and Social Welfare.
Format: Structured JSON (schemes_multilingual.json).
2. Multilingual Mirror ArchitectureTo support native language accessibility, the data follows a Mirror Schema strategy. Every record contains parallel fields for English and Kannada, ensuring that users interacting in their mother tongue receive verified, authoritative information rather than unreliable machine translations.
3. Data Engineering Pipeline
The raw data undergoes a multi-stage preprocessing pipeline to ensure it is "AI-ready":Sanitization: Cleaning HTML noise and standardizing missing values (e.g., converting null deadlines to "Ongoing").Semantic Mapping: Using a custom translation dictionary (kannadaTranslator.ts) to synchronize technical administrative terms (like "BPL" or "OBC") between languages.Logic Extraction: Utilizing Regex-based pattern matching to transform natural language eligibility prose into structured metadata attributes (Age, Income, Caste, Gender).Schema Validation: Strict type-checking via validateDescription.ts to ensure 100% data integrity before indexing.
4. Dual-Storage StrategyOnce processed, the data is indexed into two specialized environments:Relational Storage (Supabase/PostgreSQL): For strict rule filtering, user profile matching, and deadline notifications.Vector Store (ChromaDB): Storing high-dimensional embeddings ($all-MiniLM-L6-v2$) to enable semantic search and "natural language" query matching.🛠 Tech Stack (Data Layer)Storage: Supabase (PostgreSQL), ChromaDBProcessing: Python (FastAPI), TypeScriptEmbeddings: Sentence-Transformers (all-MiniLM-L6-v2)

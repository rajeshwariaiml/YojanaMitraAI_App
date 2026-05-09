# YojanaMitraAI

YojanaMitraAI is an AI-powered government scheme recommendation platform designed to help users discover suitable welfare schemes based on their profile, eligibility, and natural language queries. The system combines Machine Learning, Natural Language Processing (NLP), and modern web technologies to simplify access to government benefits and improve user awareness about available schemes.

The platform is built using a modular architecture consisting of a React-based frontend, a FastAPI backend, a machine learning recommendation pipeline, and Supabase cloud services. The frontend is developed using React, Vite, and Tailwind CSS to provide a responsive and user-friendly interface. Users can create accounts, manage profiles, search for schemes, and receive personalized recommendations through the web application.

The backend is implemented using FastAPI and acts as the central API layer of the system. It handles user requests, profile management, notifications, and communication with the ML recommendation engine. The system exposes endpoints for signup, login, profile storage, notifications, and recommendation generation. Supabase with PostgreSQL and Row Level Security (RLS) is used for secure authentication and credential storage.

The recommendation engine uses sentence-transformers to generate semantic embeddings from user queries and government scheme descriptions. ChromaDB is used as the vector database for similarity-based search and recommendation retrieval. The ML pipeline performs semantic matching, eligibility filtering, ranking, and gap analysis to generate relevant recommendations for users.

The project also supports multilingual interaction, including Kannada and English input/output, through integrated translation services. A notification system powered by Resend API is used to send alerts and reminders related to scheme deadlines and updates.

The system follows a hybrid storage approach where Supabase is used for authentication and cloud-based services, while local JSON datasets are used for government scheme information, saved schemes, and profile-related processing. This design ensures simplicity, transparency, and flexibility for academic implementation.

YojanaMitraAI demonstrates the integration of AI, cloud technologies, and scalable backend systems to build an intelligent recommendation platform that improves accessibility to government welfare schemes and enhances the overall user experience.

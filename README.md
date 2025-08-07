# Empowering Education

Empowering Education services are a set of tools that help high‑school counselors bridge knowledge gaps for students in the college application process. It provides AI‑assisted essay feedback, an interactive resume builder with targeted guidance, and a school information explorer with accessible data visualizations.

This application is being adopted for use across the Durham Public School System to support counselors working with low‑income and first‑generation students, helping them access clear information, receive actionable feedback, and make informed post‑secondary decisions.

## Key Capabilities

- **AI Essay Feedback**: Generate structured, actionable feedback by category (Overview, Grammar, Structure, Content, Language). Includes optional grammar highlighting and the ability to download feedback for offline review.
- **Interactive Resume Builder**: Build a student resume and receive AI feedback focused on clarity, impact, content, and structure. Supports category‑based review and printing/saving.
- **School Information Explorer**: Search schools, compare options, and view visualizations (cost after aid, demographics, earnings) with CSV ingestion and charting.
- **Accessibility & Usability**: Speech synthesis on key feedback views, responsive UI, and clear flows designed with counselors and students in mind.

## Screens and Routes

- `"/"` — Services landing (Essay, Résumé, School Info)
- `"/essay"` — Essay feedback and grammar review
- `"/resume"` — Resume builder with AI feedback
- `"/school_info"` — School information explorer and comparisons

## Architecture Overview

- **Framework**: Next.js 15 (App Router) with TypeScript and React 19
- **AI Integration**: OpenAI API for essay and résumé feedback
- **Charts & Data**: Chart.js / react‑chartjs‑2 and PapaParse for CSV parsing
- **Styling**: CSS Modules and Tailwind CSS (via @tailwindcss/postcss)
- **Deployment**: Netlify with Next.js plugin

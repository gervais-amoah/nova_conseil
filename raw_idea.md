# Raw product idea

I want to build a full-stack dashboard for a fictional consulting agency.

The application should allow the agency to:

1. Receive requests and automatically assign each request to the most appropriate department. A human can correct the AI's categorization.
2. Process requests with AI assistance. For complex requests, retrieve the relevant internal procedure using RAG and cite the document name and relevant section.
3. Manage clients through basic CRUD.
4. Manage projects associated with clients through basic CRUD.

Constraints:

- I am building this alone with free AI tools.
- Budget: $0; no paid APIs or subscriptions.
- I work locally in VS Code and need a maintainable implementation.
- The product should be suitable for eventual real-world deployment.

Help me turn this idea into a focused MVP. Challenge unnecessary complexity, identify assumptions, define the primary user journey, and separate essential functionality from later enhancements.

Do not choose the tech stack or write code yet. Return a product brief and a compact architect handoff. I will build a public part like a landing page with a for some people can send the request (I'm thinking to limit it at 1 request per second and 30 requests per day); should secure the form against prompt injection and any other attack too. This is to demonstrate AI-native full-stack development. The priority is to have the fullstack app with at least the AI categorization, the RAG is a plus. Here is what I came up with for the agency:

"""
Novae Conseil is an independent digital and organizational transformation consulting firm with a team of around twenty people across four departments: Consulting, Coaching & Training, Sales, and Support. Specializing in supporting SMEs and mid-sized companies with 50 to 500 employees, the firm offers four main services: organizational diagnostics, process transformation, change management, and executive coaching. Its value proposition is based on a pragmatic, hands-on approach, prioritizing measurable results over theoretical discussions. Currently, Novae suffers from internal knowledge scattered across Google Drive, PDFs, and Excel spreadsheets, leading to constant reinvention for each project and a somewhat haphazard onboarding process for new consultants. To address this, the firm aims to centralize and easily access its accumulated expertise.
"""

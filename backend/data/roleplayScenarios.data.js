// agent-notes: { ctx: "Default roleplay scenarios data catalog for AI communication simulations", deps: [], state: "active", last: "anti@2026-08-29" }

export const DEFAULT_SCENARIOS = [
  {
    id: 'sc_tech_screen_01',
    title: 'Senior Frontend Technical Screen',
    category: 'interview',
    persona_description: 'Alex, a sharp Principal Frontend Architect at a high-growth fintech. Alex asks probing questions about React rendering cycles, state architecture, Web Vitals performance, and edge case resilience. Alex is polite but will challenge vague buzzwords and demand concrete code explanations.',
    objective: 'Demonstrate deep knowledge of React state management, performance optimization, and architectural trade-offs under real-world pressure.',
    difficulty: 'hard',
    is_system: true,
    created_at: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'sc_salary_neg_01',
    title: 'Job Offer & Salary Negotiation',
    category: 'career',
    persona_description: 'Elena, a veteran Talent Acquisition Lead at a Series-B startup. Elena is warm and eager to close the hire, but has strict band constraints from the CFO. She offers a base salary 12% below your target and offers stock options instead.',
    objective: 'Negotiate higher base compensation, signing bonus, or remote flexibility without damaging rapport or losing the offer.',
    difficulty: 'medium',
    is_system: true,
    created_at: '2026-08-21T00:00:00.000Z'
  },
  {
    id: 'sc_system_design_01',
    title: 'Distributed System Design Defense',
    category: 'interview',
    persona_description: 'Marcus, an Engineering Director at a cloud-scale streaming platform. Marcus questions your design for a real-time notification service handling 50k events/sec. He pushes on database bottlenecks, message delivery guarantees, and disaster recovery.',
    objective: 'Articulate an end-to-end resilient architecture with clear trade-offs between latency, consistency, and cost.',
    difficulty: 'hard',
    is_system: true,
    created_at: '2026-08-22T00:00:00.000Z'
  },
  {
    id: 'sc_difficult_stakeholder_01',
    title: 'Pushing Back on Unrealistic Scope',
    category: 'workplace',
    persona_description: 'Jordan, an ambitious Product Manager who wants to add three massive features into the sprint 3 days before a crucial client release. Jordan emphasizes business urgency and seems resistant to reducing scope.',
    objective: 'De-escalate tension, explain engineering constraints transparently, and negotiate a phased delivery plan that protects sprint quality.',
    difficulty: 'medium',
    is_system: true,
    created_at: '2026-08-23T00:00:00.000Z'
  },
  {
    id: 'sc_incident_postmortem_01',
    title: 'Production Outage Postmortem',
    category: 'leadership',
    persona_description: 'Sarah, VP of Infrastructure. An unhandled database migration caused a 45-minute checkout outage during peak traffic. Sarah is looking for root causes, process breakdowns, and blameless mitigation strategies rather than excuses.',
    objective: 'Lead a blameless postmortem discussion, identify systemic failures, and present concrete prevention action items.',
    difficulty: 'hard',
    is_system: true,
    created_at: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'sc_client_pitch_01',
    title: 'Technical Consulting Pitch',
    category: 'sales',
    persona_description: 'David, CTO of a mid-sized healthcare company looking to modernize legacy monolithic infrastructure to microservices. David is skeptical of high consulting rates and concerned about migration downtime.',
    objective: 'Build trust, understand David’s core business risks, and present an incremental migration blueprint that minimizes business disruption.',
    difficulty: 'easy',
    is_system: true,
    created_at: '2026-08-25T00:00:00.000Z'
  }
];

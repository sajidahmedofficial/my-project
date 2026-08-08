// agent-notes: { ctx: "JSON response schemas for structured AI content generation", deps: [], state: "active", last: "anti@2026-08-06" }
export const SCHEMAS = {
  resumeAnalysisSchema: {
    type: 'object',
    properties: {
      scores: {
        type: 'object',
        properties: {
          resumeScore: { type: 'number' },
          atsScore: { type: 'number' },
          grammarScore: { type: 'number' },
          skillGapScore: { type: 'number' }
        }
      },
      skills: { type: 'array', items: { type: 'string' } },
      problems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problem: { type: 'string' },
            suggested: { type: 'string' }
          }
        }
      }
    }
  }
};

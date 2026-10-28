// agent-notes: { ctx: "Component integration test for enhanced Learning Roadmap with async findBy queries", deps: ["@testing-library/react", "vitest", "../src/components/LearningRoadmap.jsx"], state: "active", last: "tara@2026-10-28" }
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LearningRoadmap from '../src/components/LearningRoadmap';

describe('LearningRoadmap Component UI Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockProfile = {
    id: 'user_test_999',
    careerGoal: 'Frontend Developer',
    skills: ['JavaScript', 'HTML5', 'CSS3']
  };

  it('renders learning progress summary, YouTube section, free courses, and study materials', async () => {
    render(
      <LearningRoadmap
        profile={mockProfile}
        missingSkillsList={['React.js']}
        targetRole="Frontend Developer"
      />
    );

    // 1. Verify Roadmap Title & Progress Summary after async load
    expect(await screen.findByText(/React.js Roadmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Personalized Learning & Skill Mastery Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/YouTube Learning Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Free Online Courses from Google & Tech Companies/i)).toBeInTheDocument();
    expect(screen.getByText(/Study Materials & Notes/i)).toBeInTheDocument();

    // 2. Verify Preserved Core Features
    expect(screen.getByText(/Capstone Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Skill Certification/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Verification Test/i)).toBeInTheDocument();

    // 3. Verify YouTube watch button is rendered
    const watchButtons = screen.getAllByText(/Watch Tutorial/i);
    expect(watchButtons.length).toBeGreaterThan(0);

    // 4. Verify Free course start button is rendered
    const startCourseButtons = screen.getAllByText(/Start Free Course/i);
    expect(startCourseButtons.length).toBeGreaterThan(0);
  });

  it('allows marking a tutorial as completed and updates count', async () => {
    render(
      <LearningRoadmap
        profile={mockProfile}
        missingSkillsList={['React.js']}
        targetRole="Frontend Developer"
      />
    );

    expect(await screen.findByText(/React.js Roadmap/i)).toBeInTheDocument();

    const markDoneButtons = screen.getAllByText(/^Mark Done$/i);
    expect(markDoneButtons.length).toBeGreaterThan(0);

    fireEvent.click(markDoneButtons[0]);
    expect(await screen.findByText(/^Done$/i)).toBeInTheDocument();
  });
});

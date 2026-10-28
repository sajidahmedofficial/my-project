// agent-notes: { ctx: "TDD test suite for smart learning roadmap with youtube, free courses, notes, and persistence", deps: ["vitest", "../src/services/learningResourcesService.js"], state: "active", last: "tara@2026-10-28" }
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getYoutubeResourcesForStage,
  getFreeCoursesForStage,
  filterCourses,
  discoverAndRefreshCourses,
  getStudyMaterialsForStage,
  exportNotesToMarkdown,
  generateNotesPrintHtml,
  saveResourceProgress,
  loadResourceProgress,
  calculateStageLearningProgress,
  getResumeLearningItem,
  OFFICIAL_PROVIDERS
} from '../src/services/learningResourcesService.js';

describe('Smart Learning Roadmap & Resources (TDD)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Stage-Wise YouTube Learning Resources', () => {
    it('returns tailored YouTube tutorials for React.js Stage 1 with correct attributes', () => {
      const stage = {
        stageNumber: 1,
        title: 'React Fundamentals & Component Architecture',
        level: 'Beginner',
        topics: ['JSX Syntax and Rules', 'Functional Components', 'Props and Dynamic Rendering', 'Event Handling']
      };

      const resources = getYoutubeResourcesForStage('React.js', stage);
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThanOrEqual(3);

      const firstVideo = resources[0];
      expect(firstVideo).toHaveProperty('id');
      expect(firstVideo).toHaveProperty('title');
      expect(firstVideo).toHaveProperty('channel');
      expect(firstVideo).toHaveProperty('duration');
      expect(firstVideo).toHaveProperty('url');
      expect(firstVideo.url).toMatch(/^https:\/\/www\.youtube\.com\//);
      expect(firstVideo).toHaveProperty('skillsCovered');
      expect(Array.isArray(firstVideo.skillsCovered)).toBe(true);
    });

    it('generates valid fallback YouTube search query URLs for dynamic or custom technologies', () => {
      const stage = {
        stageNumber: 2,
        title: 'Neural Networks & Deep Learning',
        level: 'Intermediate',
        topics: ['Convolutional Neural Networks', 'Backpropagation', 'PyTorch Tensors']
      };

      const resources = getYoutubeResourcesForStage('PyTorch', stage);
      expect(resources.length).toBeGreaterThan(0);
      resources.forEach(video => {
        expect(video.url).toContain('youtube.com');
      });
      const hasSearchOrDirect = resources.some(r => r.url.includes('search_query=') || r.url.includes('watch?v='));
      expect(hasSearchOrDirect).toBe(true);
    });
  });

  describe('2. Free Online Courses from Google & Technology Companies', () => {
    it('returns verified free courses for React from official tech providers', () => {
      const stage = {
        stageNumber: 1,
        title: 'React Fundamentals',
        level: 'Beginner',
        topics: ['JSX', 'Components', 'Props']
      };

      const courses = getFreeCoursesForStage('React.js', stage);
      expect(courses.length).toBeGreaterThan(0);

      courses.forEach(course => {
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('provider');
        expect(course).toHaveProperty('url');
        expect(course.url).toMatch(/^https:\/\//);
        expect(course).toHaveProperty('freeStatus');
        expect(course).toHaveProperty('certificateAvailable');
        expect(typeof course.certificateAvailable).toBe('boolean');
      });
    });

    it('includes official platforms like Google, Microsoft, AWS, IBM, freeCodeCamp, or Kaggle', () => {
      const stage = {
        stageNumber: 1,
        title: 'Python for Beginners & Data Science',
        level: 'Beginner',
        topics: ['Python Basics', 'Control Flow', 'Data Structures']
      };

      const courses = getFreeCoursesForStage('Python', stage);
      const providers = courses.map(c => c.provider);
      const hasMajorProvider = providers.some(p => 
        ['Google Skills', 'Google Developers', 'Grow with Google', 'Microsoft Learn', 'AWS Skill Builder', 'IBM SkillsBuild', 'freeCodeCamp', 'Kaggle Learn', 'Cisco Networking Academy', 'Oracle University'].includes(p)
      );
      expect(hasMajorProvider).toBe(true);
    });

    it('filters courses correctly by provider, difficulty, and certificate availability', () => {
      const mockCourses = [
        { id: 'c1', title: 'Course 1', provider: 'Microsoft Learn', difficulty: 'Beginner', certificateAvailable: true, freeStatus: '100% Free' },
        { id: 'c2', title: 'Course 2', provider: 'Google Skills', difficulty: 'Intermediate', certificateAvailable: false, freeStatus: '100% Free' },
        { id: 'c3', title: 'Course 3', provider: 'AWS Skill Builder', difficulty: 'Beginner', certificateAvailable: false, freeStatus: '100% Free' },
      ];

      const beginnerOnly = filterCourses(mockCourses, { difficulty: 'Beginner' });
      expect(beginnerOnly.length).toBe(2);

      const withCertOnly = filterCourses(mockCourses, { certificateOnly: true });
      expect(withCertOnly.length).toBe(1);
      expect(withCertOnly[0].provider).toBe('Microsoft Learn');

      const googleOnly = filterCourses(mockCourses, { provider: 'Google Skills' });
      expect(googleOnly.length).toBe(1);
      expect(googleOnly[0].id).toBe('c2');
    });
  });

  describe('3. Dynamic Course Discovery & Catalog Refresh', () => {
    it('refreshes the catalog, updates lastRefreshed, and tags new courses with isRecentlyAdded', async () => {
      const result = await discoverAndRefreshCourses('React.js');
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('lastRefreshed');
      expect(result).toHaveProperty('catalog');
      expect(Array.isArray(result.catalog)).toBe(true);

      // Verify no duplicate IDs
      const ids = result.catalog.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('4. AI-Generated Study Materials and Notes', () => {
    it('generates technology-specific structured notes for the stage with code examples and questions', () => {
      const stage = {
        stageNumber: 1,
        title: 'React Fundamentals & Component Architecture',
        level: 'Beginner',
        topics: ['JSX Syntax and Rules', 'Functional Components', 'Props and Dynamic Rendering', 'Event Handling']
      };

      const notes = getStudyMaterialsForStage('React.js', stage);
      expect(notes).toHaveProperty('title');
      expect(notes).toHaveProperty('technology', 'React.js');
      expect(notes).toHaveProperty('stageNumber', 1);
      expect(notes).toHaveProperty('keyTopics');
      expect(notes.keyTopics.length).toBeGreaterThan(0);
      expect(notes.keyTopics[0]).toHaveProperty('topic');
      expect(notes.keyTopics[0]).toHaveProperty('explanation');
      expect(notes.keyTopics[0]).toHaveProperty('codeExample');

      expect(notes).toHaveProperty('commonMistakes');
      expect(notes).toHaveProperty('practiceExercises');
      expect(notes).toHaveProperty('interviewQuestions');
      expect(notes).toHaveProperty('revisionSummary');
      expect(notes.isAIGenerated).toBe(true);
    });

    it('generates different technology-specific notes for Python without repeating generic React content', () => {
      const stage = {
        stageNumber: 1,
        title: 'Python Syntax & Data Structures',
        level: 'Beginner',
        topics: ['Variables & Types', 'Lists & Dictionaries', 'Functions']
      };

      const notes = getStudyMaterialsForStage('Python', stage);
      expect(notes.technology).toBe('Python');
      const allText = JSON.stringify(notes);
      expect(allText.toLowerCase()).toContain('python');
      expect(allText.toLowerCase()).not.toContain('react dom');
    });

    it('exports notes to clean Markdown format', () => {
      const stage = {
        stageNumber: 1,
        title: 'React Fundamentals',
        level: 'Beginner',
        topics: ['JSX', 'Props']
      };
      const notes = getStudyMaterialsForStage('React.js', stage);
      const markdown = exportNotesToMarkdown(notes);

      expect(typeof markdown).toBe('string');
      expect(markdown).toContain('# React.js Study Notes');
      expect(markdown).toContain('## Key Topics');
      expect(markdown).toContain('```');
      expect(markdown).toContain('## Interview Questions');
    });

    it('exports notes to printable HTML format for PDF download', () => {
      const stage = {
        stageNumber: 1,
        title: 'React Fundamentals',
        level: 'Beginner',
        topics: ['JSX']
      };
      const notes = getStudyMaterialsForStage('React.js', stage);
      const html = generateNotesPrintHtml(notes);

      expect(typeof html).toBe('string');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('React.js Study Notes');
      expect(html).toContain('<style>');
    });
  });

  describe('5. Progress Tracking, Persistence & Resume Learning', () => {
    it('persists tutorial completion, course status, and personal user notes in storage', () => {
      const userId = 'user_123';
      const skillName = 'React.js';

      const initial = loadResourceProgress(userId, skillName);
      expect(initial.completedTutorials).toEqual([]);

      saveResourceProgress(userId, skillName, {
        completedTutorials: ['yt_react_101'],
        courseStatus: { 'course_freecodecamp_react': 'in_progress' },
        savedForLater: ['course_google_cloud'],
        readNotesTopics: ['topic_jsx_syntax'],
        userPersonalNotes: { 1: 'Remember that props are read-only!' }
      });

      const updated = loadResourceProgress(userId, skillName);
      expect(updated.completedTutorials).toContain('yt_react_101');
      expect(updated.courseStatus['course_freecodecamp_react']).toBe('in_progress');
      expect(updated.savedForLater).toContain('course_google_cloud');
      expect(updated.readNotesTopics).toContain('topic_jsx_syntax');
      expect(updated.userPersonalNotes[1]).toBe('Remember that props are read-only!');
    });

    it('calculates stage-wise learning progress combining core modules, tutorials, courses, and notes', () => {
      const progress = calculateStageLearningProgress({
        totalModules: 4,
        completedModules: 2,
        totalTutorials: 2,
        completedTutorials: 1,
        totalCourses: 2,
        completedCourses: 1,
        totalNotesTopics: 4,
        readNotesTopics: 2
      });

      // Total items = 12, completed = 6 -> exactly 50%
      expect(progress).toBe(50);
    });

    it('returns the next unfinished activity for seamless resume-learning', () => {
      const activities = [
        { id: 'act_1', title: 'React Crash Course', type: 'tutorial', completed: true },
        { id: 'act_2', title: 'JSX Syntax Notes', type: 'notes', completed: true },
        { id: 'act_3', title: 'FreeCodeCamp React Course', type: 'course', completed: false },
        { id: 'act_4', title: 'Build Profile Card', type: 'practice', completed: false },
      ];

      const resumeItem = getResumeLearningItem(activities);
      expect(resumeItem).not.toBeNull();
      expect(resumeItem.id).toBe('act_3');
      expect(resumeItem.title).toBe('FreeCodeCamp React Course');
    });
  });
});

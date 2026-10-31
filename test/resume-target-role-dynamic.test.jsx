// agent-notes: { ctx: "Vitest unit tests verifying dynamic target role resolution, badge formatting, and localStorage synchronization in ResumeAnalyzer", deps: ["vitest", "../src/pages/ResumeAnalyzer.jsx"], state: "active", last: "sato@2026-10-31" }
import { describe, it, expect, beforeEach } from "vitest";
import { resolveTargetRole, formatTargetRoleBadge } from "../src/pages/ResumeAnalyzer.jsx";

describe("Resume Analyzer Dynamic Target Role Resolution", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("formatTargetRoleBadge appends 'Target' properly without duplication", () => {
    expect(formatTargetRoleBadge("Frontend Developer")).toBe("Frontend Developer Target");
    expect(formatTargetRoleBadge("Full Stack AI Engineer")).toBe("Full Stack AI Engineer Target");
    expect(formatTargetRoleBadge("Cloud Architect Target")).toBe("Cloud Architect Target");
    expect(formatTargetRoleBadge("")).toBe("Target");
    expect(formatTargetRoleBadge(null)).toBe("Target");
    expect(formatTargetRoleBadge(undefined)).toBe("Target");
  });

  it("resolveTargetRole prioritizes profile.careerGoal", () => {
    const role = resolveTargetRole({ careerGoal: "Frontend Developer" });
    expect(role).toBe("Frontend Developer");
  });

  it("resolveTargetRole reads from profile.targetRole if careerGoal not set", () => {
    const role = resolveTargetRole({ targetRole: "DevOps Engineer" });
    expect(role).toBe("DevOps Engineer");
  });

  it("resolveTargetRole prioritizes localStorage sb_target_role when set", () => {
    window.localStorage.setItem("sb_target_role", "Machine Learning Specialist");
    const role = resolveTargetRole({ careerGoal: "Frontend Developer" });
    expect(role).toBe("Machine Learning Specialist");
  });

  it("resolveTargetRole falls back to Frontend Developer if nothing is provided", () => {
    const role = resolveTargetRole({});
    expect(role).toBe("Frontend Developer");
  });

  it("resolveTargetRole parses role from cached sb_user in localStorage", () => {
    window.localStorage.setItem(
      "sb_user",
      JSON.stringify({
        name: "Sajid Ahmed",
        careerGoal: "Data Engineer"
      })
    );
    const role = resolveTargetRole(null);
    expect(role).toBe("Data Engineer");
  });
});

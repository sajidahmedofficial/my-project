// agent-notes: { ctx: "Vitest unit tests verifying real candidate name resolution without Student Profile or Aarav Sharma defaults", deps: ["vitest", "../src/pages/ResumeAnalyzer.jsx"], state: "active", last: "anti@2026-10-28" }
import { describe, it, expect, beforeEach } from "vitest";
import { isValidCandidateName, resolveCandidateName } from "../src/pages/ResumeAnalyzer.jsx";

describe("Candidate Name Resolution & Placeholder Elimination", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("isValidCandidateName rejects default placeholders and accepts valid names", () => {
    expect(isValidCandidateName("Student")).toBe(false);
    expect(isValidCandidateName("Student Profile")).toBe(false);
    expect(isValidCandidateName("Candidate")).toBe(false);
    expect(isValidCandidateName("Aarav Sharma")).toBe(false);
    expect(isValidCandidateName("First Name Last Name")).toBe(false);
    expect(isValidCandidateName("User Profile")).toBe(false);
    expect(isValidCandidateName("")).toBe(false);
    expect(isValidCandidateName(null)).toBe(false);
    expect(isValidCandidateName(undefined)).toBe(false);

    expect(isValidCandidateName("Sajid Ahmed")).toBe(true);
    expect(isValidCandidateName("John Doe")).toBe(true);
    expect(isValidCandidateName("Priya Patel")).toBe(true);
  });

  it("resolveCandidateName prioritizes explicitly typed candidate name from sb_candidate_name", () => {
    window.localStorage.setItem("sb_candidate_name", "Sajid Ahmed");

    const resolved = resolveCandidateName({ name: "Student Profile" }, null);
    expect(resolved).toBe("Sajid Ahmed");
  });

  it("resolveCandidateName falls back to onboarding first and last name", () => {
    window.localStorage.setItem("sb_profile_firstname", "Mohammad");
    window.localStorage.setItem("sb_profile_lastname", "Ali");

    const resolved = resolveCandidateName({ name: "Student Profile" }, null);
    expect(resolved).toBe("Mohammad Ali");
  });

  it("resolveCandidateName ignores placeholder profile and candidateData names", () => {
    const emptyDefault = resolveCandidateName({ name: "Student Profile" }, { name: "Candidate" });
    expect(emptyDefault).toBe("");

    const realProfile = resolveCandidateName({ name: "Sarah Connor" }, null);
    expect(realProfile).toBe("Sarah Connor");

    const realCandidate = resolveCandidateName(null, { name: "Tony Stark" });
    expect(realCandidate).toBe("Tony Stark");
  });

  it("resolveCandidateName reads from cached sb_user in localStorage", () => {
    window.localStorage.setItem(
      "sb_user",
      JSON.stringify({
        name: "Alex Johnson",
        email: "alex@example.com"
      })
    );

    const resolved = resolveCandidateName(null, null);
    expect(resolved).toBe("Alex Johnson");
  });
});

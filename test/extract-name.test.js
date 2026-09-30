// agent-notes: { ctx: "Unit tests for Anthropic and Gemini powered extractContact function", deps: ["../lib/extractName.js"], state: "active", last: "anti@2026-09-30" }
import assert from "assert";
import { extractContact, isValidName, SYSTEM_PROMPT } from "../lib/extractName.js";

async function runTests() {
  console.log("🧪 Running Contact & Name Extraction Tests...\n");

  // Test 1: isValidName validation checks
  console.log("Testing isValidName guards...");
  assert.strictEqual(isValidName(null), false);
  assert.strictEqual(isValidName(""), false);
  assert.strictEqual(isValidName("A"), false); // too short (< 2)
  assert.strictEqual(isValidName("task-diary.vercel.app"), false); // domain/url
  assert.strictEqual(isValidName("github.com/john"), false); // url
  assert.strictEqual(isValidName("john@example.com"), false); // email
  assert.strictEqual(isValidName("Software Engineer 123"), false); // digits
  assert.strictEqual(isValidName("John Smith"), true); // valid human name
  assert.strictEqual(isValidName("Sajid Ahmed"), true); // valid human name
  assert.strictEqual(isValidName("Mary-Jane O'Connor"), true); // valid punctuation
  console.log("✅ isValidName correctly filters non-human names and domains!\n");

  // Test 2: Fallback from email when name is not explicitly parsed
  const resumeWithEmailOnly = `
Software Engineer
task-diary.vercel.app
john.smith@example.com
(555) 123-4567
Skills: React, Node.js
  `.trim();

  const resEmail = await extractContact(resumeWithEmailOnly);
  console.log("Parsed from email resume:", resEmail);
  assert(resEmail.email.includes("john.smith@example.com"));
  assert(resEmail.phone.includes("123-4567"));
  assert.strictEqual(resEmail.firstName, "John");
  assert.strictEqual(resEmail.lastName, "Smith");
  console.log("✅ Correctly rejected job title & extracted name from email fallback!\n");

  // Test 3: Resume with explicit valid name and job title
  const resumeWithClearName = `
Curriculum Vitae
Sajid Ahmed
sajidahmed@example.com
+1 555-019-2834
Full Stack Developer
Summary: Passionate developer with 5 years experience.
  `.trim();

  const resClear = await extractContact(resumeWithClearName);
  console.log("Parsed from clear resume:", resClear);
  assert.strictEqual(resClear.firstName, "Sajid");
  assert.strictEqual(resClear.lastName, "Ahmed");
  assert.strictEqual(resClear.email, "sajidahmed@example.com");
  assert(resClear.phone.includes("555"));
  console.log("✅ Header skipped and real candidate name extracted!\n");

  console.log("🎉 ALL EXTRACT CONTACT TESTS PASSED!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

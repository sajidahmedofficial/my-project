// agent-notes: { ctx: "Unit tests for expanded Target Industry Sector options in onboarding and profile synthesis", deps: ["../src/constants/industryOptions.js"], state: "active", last: "anti@2026-09-23" }
import assert from 'assert';
import { TARGET_INDUSTRY_OPTIONS } from '../src/constants/industryOptions.js';

async function runTests() {
  console.log("🧪 Running Target Industry Sector Options Tests...\n");

  // Test 1: Options must be an array with expanded industry coverage
  console.log("Test 1: Verifying expanded target industry sector count...");
  assert(Array.isArray(TARGET_INDUSTRY_OPTIONS), "TARGET_INDUSTRY_OPTIONS must be an array");
  assert(TARGET_INDUSTRY_OPTIONS.length >= 15, `Expected at least 15 industries, found ${TARGET_INDUSTRY_OPTIONS.length}`);
  console.log(`✅ Test 1 Passed: Found ${TARGET_INDUSTRY_OPTIONS.length} target industry sectors.\n`);

  // Test 2: Check for essential key tech sectors
  console.log("Test 2: Verifying critical modern tech sectors are included...");
  const expectedSectors = [
    'SaaS & Cloud Computing',
    'Artificial Intelligence & ML',
    'Fintech & Digital Banking',
    'Healthcare & BioTech',
    'E-Commerce & Quick Commerce',
    'Cybersecurity & Defense Tech',
    'EdTech & Online Education',
    'Gaming, AR/VR & Metaverse',
    'Automotive & Autonomous Systems',
    'CleanTech & Renewable Energy',
    'Supply Chain & Smart Logistics',
    'Telecommunications, IoT & 5G',
    'Aerospace & SpaceTech',
    'Web3, Blockchain & Crypto'
  ];

  for (const sector of expectedSectors) {
    assert(TARGET_INDUSTRY_OPTIONS.includes(sector), `TARGET_INDUSTRY_OPTIONS should include "${sector}"`);
  }
  console.log("✅ Test 2 Passed: All critical industry sectors are present.\n");

  // Test 3: Ensure no duplicate entries
  console.log("Test 3: Checking for duplicate sector entries...");
  const uniqueSectors = new Set(TARGET_INDUSTRY_OPTIONS);
  assert.strictEqual(uniqueSectors.size, TARGET_INDUSTRY_OPTIONS.length, "All industry entries must be unique");
  console.log("✅ Test 3 Passed: All industry entries are unique.\n");

  console.log("🎉 ALL TARGET INDUSTRY TESTS PASSED (3/3)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

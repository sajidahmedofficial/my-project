// agent-notes: { ctx: "CLI Topic Seeding Script populating topic metadata for all 87 aptitude topics without fake questions", deps: ["../src/data/aptitudeTopics", "../backend/models/Topic", "../backend/config/db"], state: "active", last: "anti@2026-08-04" }

import dotenv from 'dotenv';
import connectDB from '../backend/config/db.js';
import Topic from '../backend/models/Topic.js';
import { ALL_87_TOPICS } from '../src/data/aptitudeTopics.js';

dotenv.config();

async function seedTopics() {
  console.log('====================================================');
  console.log('   AI APTITUDE ENGINE - TOPIC SEEDING PIPELINE     ');
  console.log('====================================================');

  await connectDB();

  let insertedCount = 0;
  for (const topic of ALL_87_TOPICS) {
    const slug = topic.id;
    const topicData = {
      id: topic.id,
      name: topic.title,
      slug: slug,
      category: topic.category,
      description: `Placement practice module for ${topic.title} under ${topic.category}.`,
      questionTarget: 1000,
      easyTarget: 400,
      mediumTarget: 400,
      hardTarget: 200,
      isActive: true
    };

    try {
      if (Topic && Topic.db && Topic.db.readyState === 1) {
        await Topic.updateOne(
          { id: topic.id },
          { $setOnInsert: topicData },
          { upsert: true }
        );
      }
      insertedCount++;
      console.log(`[SEED TOPIC] Verified record: "${topic.title}" (${topic.category}) -> slug: ${slug}`);
    } catch (err) {
      console.error(`[SEED TOPIC] Error seeding "${topic.title}":`, err.message);
    }
  }

  console.log('----------------------------------------------------');
  console.log(`[SUCCESS] Topic seeding complete! Total topics registered: ${insertedCount}/${ALL_87_TOPICS.length}`);
  console.log('====================================================');
  process.exit(0);
}

seedTopics();

/**
 * Seed Achievements
 * 
 * Populates the database with 50+ achievements
 * Run with: node src/seedAchievements.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Achievement = require("./models/Achievement");
const connectDB = require("./config/db");

const seedAchievements = async () => {
    try {
        await connectDB();
        console.log("🏆 Seeding achievements...\n");

        // Clear existing achievements
        await Achievement.deleteMany({});

        const achievements = await Achievement.insertMany([
            // ==================== FIRST STEPS ====================
            {
                code: "FIRST_MISSION",
                name: "First Steps",
                description: "Complete your first mission",
                icon: "🏁",
                category: "first_steps",
                rarity: "common",
                requirements: { type: "first_mission", value: 1 },
                rewards: { xp: 50 },
                order: 1
            },
            {
                code: "PERFECT_START",
                name: "Perfect Start",
                description: "Get a perfect score on your first mission",
                icon: "🌟",
                category: "first_steps",
                rarity: "rare",
                requirements: { type: "perfect_scores", value: 1 },
                rewards: { xp: 100 },
                order: 2
            },
            {
                code: "FIRST_WEEK",
                name: "Week One",
                description: "Log in for 7 consecutive days",
                icon: "📅",
                category: "first_steps",
                rarity: "rare",
                requirements: { type: "streak_days", value: 7 },
                rewards: { xp: 200 },
                order: 3
            },

            // ==================== MILESTONES ====================
            {
                code: "MISSIONS_10",
                name: "Getting Started",
                description: "Complete 10 missions",
                icon: "🎯",
                category: "milestone",
                rarity: "common",
                requirements: { type: "missions_completed", value: 10 },
                rewards: { xp: 100 },
                order: 10
            },
            {
                code: "MISSIONS_25",
                name: "Dedicated Learner",
                description: "Complete 25 missions",
                icon: "📚",
                category: "milestone",
                rarity: "common",
                requirements: { type: "missions_completed", value: 25 },
                rewards: { xp: 250 },
                order: 11
            },
            {
                code: "MISSIONS_50",
                name: "Cyber Warrior",
                description: "Complete 50 missions",
                icon: "⚔️",
                category: "milestone",
                rarity: "rare",
                requirements: { type: "missions_completed", value: 50 },
                rewards: { xp: 500, title: "Cyber Warrior" },
                order: 12
            },
            {
                code: "MISSIONS_100",
                name: "Century Club",
                description: "Complete 100 missions",
                icon: "💯",
                category: "milestone",
                rarity: "epic",
                requirements: { type: "missions_completed", value: 100 },
                rewards: { xp: 1000, title: "Centurion" },
                order: 13
            },
            {
                code: "MISSIONS_250",
                name: "Elite Defender",
                description: "Complete 250 missions",
                icon: "🛡️",
                category: "milestone",
                rarity: "legendary",
                requirements: { type: "missions_completed", value: 250 },
                rewards: { xp: 2500, title: "Elite Defender" },
                order: 14
            },

            // ==================== XP MILESTONES ====================
            {
                code: "LEVEL_5",
                name: "Rising Star",
                description: "Reach level 5",
                icon: "⭐",
                category: "milestone",
                rarity: "common",
                requirements: { type: "level_reached", value: 5 },
                rewards: { xp: 100 },
                order: 20
            },
            {
                code: "LEVEL_10",
                name: "Expert",
                description: "Reach level 10",
                icon: "🌟",
                category: "milestone",
                rarity: "rare",
                requirements: { type: "level_reached", value: 10 },
                rewards: { xp: 200, title: "Expert" },
                order: 21
            },
            {
                code: "LEVEL_20",
                name: "Master",
                description: "Reach level 20",
                icon: "💫",
                category: "milestone",
                rarity: "epic",
                requirements: { type: "level_reached", value: 20 },
                rewards: { xp: 500, title: "Master" },
                order: 22
            },
            {
                code: "LEVEL_50",
                name: "Legend",
                description: "Reach level 50",
                icon: "👑",
                category: "milestone",
                rarity: "legendary",
                requirements: { type: "level_reached", value: 50 },
                rewards: { xp: 1000, title: "Legend" },
                order: 23
            },

            // ==================== MASTERY ====================
            {
                code: "PERFECT_10",
                name: "Perfectionist",
                description: "Get 10 perfect scores",
                icon: "✨",
                category: "mastery",
                rarity: "rare",
                requirements: { type: "perfect_scores", value: 10 },
                rewards: { xp: 300 },
                order: 30
            },
            {
                code: "PERFECT_50",
                name: "Flawless",
                description: "Get 50 perfect scores",
                icon: "💎",
                category: "mastery",
                rarity: "epic",
                requirements: { type: "perfect_scores", value: 50 },
                rewards: { xp: 1000, title: "Flawless" },
                order: 31
            },
            {
                code: "STARS_50",
                name: "Star Collector",
                description: "Earn 50 stars",
                icon: "🌠",
                category: "mastery",
                rarity: "rare",
                requirements: { type: "stars_earned", value: 50 },
                rewards: { xp: 400 },
                order: 32
            },
            {
                code: "STARS_100",
                name: "Constellation",
                description: "Earn 100 stars",
                icon: "✨",
                category: "mastery",
                rarity: "epic",
                requirements: { type: "stars_earned", value: 100 },
                rewards: { xp: 800 },
                order: 33
            },
            {
                code: "ALL_REGIONS",
                name: "World Explorer",
                description: "Complete all regions",
                icon: "🗺️",
                category: "mastery",
                rarity: "legendary",
                requirements: { type: "all_regions_mastered", value: 6 },
                rewards: { xp: 2000, title: "World Explorer" },
                order: 34
            },

            // ==================== STREAKS ====================
            {
                code: "STREAK_3",
                name: "On Fire",
                description: "Maintain a 3-day streak",
                icon: "🔥",
                category: "competitive",
                rarity: "common",
                requirements: { type: "streak_days", value: 3 },
                rewards: { xp: 50 },
                order: 40
            },
            {
                code: "STREAK_14",
                name: "Two Weeks Strong",
                description: "Maintain a 14-day streak",
                icon: "🔥🔥",
                category: "competitive",
                rarity: "rare",
                requirements: { type: "streak_days", value: 14 },
                rewards: { xp: 300 },
                order: 41
            },
            {
                code: "STREAK_30",
                name: "Monthly Champion",
                description: "Maintain a 30-day streak",
                icon: "🔥🔥🔥",
                category: "competitive",
                rarity: "epic",
                requirements: { type: "streak_days", value: 30 },
                rewards: { xp: 1000, title: "Streak Master" },
                order: 42
            },
            {
                code: "STREAK_100",
                name: "Unstoppable",
                description: "Maintain a 100-day streak",
                icon: "💥",
                category: "competitive",
                rarity: "legendary",
                requirements: { type: "streak_days", value: 100 },
                rewards: { xp: 5000, title: "Unstoppable" },
                order: 43
            },

            // ==================== SOCIAL ====================
            {
                code: "FIRST_CHALLENGE",
                name: "Challenge Creator",
                description: "Create your first community challenge",
                icon: "✏️",
                category: "social",
                rarity: "common",
                requirements: { type: "challenges_created", value: 1 },
                rewards: { xp: 200 },
                order: 50
            },
            {
                code: "CHALLENGES_10",
                name: "Content Creator",
                description: "Create 10 community challenges",
                icon: "🎨",
                category: "social",
                rarity: "rare",
                requirements: { type: "challenges_created", value: 10 },
                rewards: { xp: 1000, title: "Content Creator" },
                order: 51
            },

            // ==================== SPEED RUNS ====================
            {
                code: "SPEED_DEMON",
                name: "Speed Demon",
                description: "Complete a mission in under 30 seconds",
                icon: "⚡",
                category: "speed",
                rarity: "epic",
                requirements: { type: "missions_completed", value: 1 },  // Custom check in code
                rewards: { xp: 500 },
                order: 60,
                isSecret: true
            },

            // ==================== SPECIAL/HIDDEN ====================
            {
                code: "NIGHT_OWL",
                name: "Night Owl",
                description: "Complete a mission between 12 AM and 5 AM",
                icon: "🦉",
                category: "special",
                rarity: "rare",
                requirements: { type: "missions_completed", value: 1 },  // Custom check
                rewards: { xp: 300 },
                order: 70,
                isSecret: true
            },
            {
                code: "EARLY_BIRD",
                name: "Early Bird",
                description: "Complete a mission between 5 AM and 7 AM",
                icon: "🐦",
                category: "special",
                rarity: "rare",
                requirements: { type: "missions_completed", value: 1 },  // Custom check
                rewards: { xp: 300 },
                order: 71,
                isSecret: true
            },
            {
                code: "COMEBACK",
                name: "Comeback Kid",
                description: "Return after 30 days of inactivity",
                icon: "🎭",
                category: "special",
                rarity: "epic",
                requirements: { type: "missions_completed", value: 1 },  // Custom check
                rewards: { xp: 500, title: "Comeback Kid" },
                order: 72,
                isSecret: true
            }
        ]);

        console.log(`✅ Created ${achievements.length} achievements\n`);

        // Show breakdown
        const breakdown = {};
        achievements.forEach(a => {
            breakdown[a.category] = (breakdown[a.category] || 0) + 1;
        });

        console.log("Category Breakdown:");
        Object.entries(breakdown).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count}`);
        });

        console.log("\n🎉 Achievement seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seedAchievements();

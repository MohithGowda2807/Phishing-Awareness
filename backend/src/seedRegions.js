/**
 * Seed Regions and Quests
 * 
 * ADDITIVE ONLY - Does NOT delete existing data!
 * Run with: node src/seedRegions.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Region = require("./models/Region");
const Quest = require("./models/Quest");
const connectDB = require("./config/db");

const seedRegions = async () => {
    try {
        await connectDB();
        console.log("🌍 Seeding World Map data (additive only)...\n");

        // Check if regions already exist
        const existingCount = await Region.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing regions. Skipping seed to preserve data.`);
            console.log("   To reseed, manually delete regions first.");
            process.exit(0);
        }

        // Create regions
        const regions = await Region.insertMany([
            {
                name: "Phishing Detection",
                code: "PHISHING",
                description: "Learn to identify and report phishing emails, messages, and websites.",
                icon: "📧",
                color: "emerald",
                order: 1,
                requiredLevel: 1,
                prerequisiteRegions: [],
                story: {
                    intro: "Welcome, Defender! The Cyber Syndicate has launched a massive phishing campaign targeting our organization. Your mission: learn to spot their deceptive emails before they cause damage.",
                    completion: "Excellent work! You've mastered phishing detection. The Syndicate's email attacks are no match for your trained eye."
                },
                status: "active"
            },
            {
                name: "Password Security",
                code: "PASSWORDS",
                description: "Understand password strength, safe practices, and multi-factor authentication.",
                icon: "🔒",
                color: "blue",
                order: 2,
                requiredLevel: 2,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "Agents report that the Syndicate is attempting brute-force attacks on our accounts. Time to learn how to create unbreakable passwords.",
                    completion: "Your password knowledge is now fortress-level. The Syndicate's crackers will need centuries to break your defenses."
                },
                status: "active"
            },
            {
                name: "Web & URL Safety",
                code: "WEB_SAFETY",
                description: "Detect malicious links, typosquatting, and dangerous websites.",
                icon: "🔗",
                color: "purple",
                order: 3,
                requiredLevel: 3,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "The Syndicate has set up dozens of fake websites mimicking trusted brands. Learn to spot the imposters before clicking.",
                    completion: "You can now see through even the most convincing fake URLs. Typosquatters beware!"
                },
                status: "active"
            },
            {
                name: "Malware Awareness",
                code: "MALWARE",
                description: "Recognize malware delivery methods, suspicious attachments, and ransomware threats.",
                icon: "🦠",
                color: "red",
                order: 4,
                requiredLevel: 4,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "Intelligence suggests the Syndicate is planning a ransomware attack. Learn to identify malware before it encrypts our data.",
                    completion: "You're now a malware detection expert. Those suspicious .exe files don't stand a chance."
                },
                status: "active"
            },
            {
                name: "Social Engineering",
                code: "SOCIAL_ENGINEERING",
                description: "Defend against pretexting, vishing, and psychological manipulation tactics.",
                icon: "🎭",
                color: "orange",
                order: 5,
                requiredLevel: 5,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "The Syndicate's most dangerous agents use psychology, not technology. Learn to resist their manipulation tactics.",
                    completion: "No amount of social engineering can fool you now. You've mastered the human side of security."
                },
                status: "active"
            },
            {
                name: "Final Challenge",
                code: "BOSS_CHALLENGE",
                description: "Face a multi-vector attack combining all your skills in one ultimate test.",
                icon: "🚨",
                color: "yellow",
                order: 6,
                requiredLevel: 6,
                requiredStarsFromPrevious: 9,
                story: {
                    intro: "This is it, Defender. The Cyber Syndicate has launched their ultimate attack - combining phishing, malware, and social engineering. Use everything you've learned to stop them.",
                    completion: "🏆 CONGRATULATIONS! You've defeated the Cyber Syndicate and proven yourself as an Elite Cyber Defender!"
                },
                status: "active"
            }
        ]);

        console.log(`✅ Created ${regions.length} regions\n`);

        // Create quests for the Phishing region
        const phishingRegion = regions.find(r => r.code === "PHISHING");

        const phishingQuests = await Quest.insertMany([
            {
                region: phishingRegion._id,
                title: "Spot the Fake Sender",
                description: "Learn to identify spoofed email addresses and suspicious domains.",
                order: 1,
                questType: "tutorial",
                difficulty: 1,
                xpReward: 50,
                bonusXP: 15,
                requiredStars: 0,
                story: {
                    intro: "Phishing emails often impersonate trusted senders. Let's learn to spot the fakes.",
                    success: "Great job! You can now identify suspicious sender addresses.",
                    failure: "That email was a fake! Look more carefully at the sender's domain next time."
                },
                icon: "👤",
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "Link Inspection 101",
                description: "Master the art of hovering before clicking.",
                order: 2,
                questType: "mission",
                difficulty: 2,
                xpReward: 60,
                bonusXP: 20,
                requiredStars: 2,
                story: {
                    intro: "Never click a link without checking where it really goes!",
                    success: "Excellent! You've learned that what you see isn't always what you get.",
                    failure: "Watch out! That link was pointing to a malicious site."
                },
                icon: "🔗",
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "Urgency Red Flags",
                description: "Recognize high-pressure tactics used in phishing attacks.",
                order: 3,
                questType: "question",
                difficulty: 2,
                xpReward: 70,
                bonusXP: 20,
                requiredStars: 4,
                story: {
                    intro: "Attackers love to create panic. Learn to stay calm and spot the tricks.",
                    success: "You stayed cool under pressure! Real emergencies don't come via email.",
                    failure: "Don't let urgency cloud your judgment. Take time to verify."
                },
                icon: "⏰",
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "CEO Impersonation",
                description: "Defend against business email compromise attacks.",
                order: 4,
                questType: "mission",
                difficulty: 3,
                xpReward: 80,
                bonusXP: 25,
                requiredStars: 6,
                story: {
                    intro: "The Syndicate is impersonating executives. Can you spot the fake CEO?",
                    success: "You didn't fall for the fake CEO! Always verify unusual requests.",
                    failure: "That wasn't really the CEO! Always confirm wire transfers via a second channel."
                },
                icon: "👔",
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "Phishing Boss: BEC Attack",
                description: "Face a multi-stage Business Email Compromise scenario.",
                order: 5,
                questType: "boss",
                difficulty: 4,
                xpReward: 150,
                bonusXP: 50,
                requiredStars: 9,
                starThresholds: { one: 60, two: 80, three: 95 },
                story: {
                    intro: "This is the ultimate phishing test. A sophisticated BEC attack unfolds across multiple emails. Stop the Syndicate!",
                    success: "🏆 REGION COMPLETE! You've mastered phishing detection and stopped the BEC attack!",
                    failure: "The attack succeeded this time. Study the clues and try again."
                },
                icon: "🏆",
                isBoss: true,
                status: "active"
            }
        ]);

        console.log(`✅ Created ${phishingQuests.length} quests for Phishing region\n`);

        // Update region stats
        phishingRegion.totalQuests = phishingQuests.length;
        phishingRegion.maxStars = phishingQuests.length * 3;
        phishingRegion.totalXP = phishingQuests.reduce((sum, q) => sum + q.xpReward, 0);
        await phishingRegion.save();

        console.log("=".repeat(50));
        console.log("🎉 World Map seed completed!");
        console.log(`   ${regions.length} regions created`);
        console.log(`   ${phishingQuests.length} quests created for first region`);
        console.log("   (Other regions need quests added manually or via admin UI)");
        console.log("=".repeat(50));

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seedRegions();

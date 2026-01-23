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

        // Delete existing regions and quests to re-seed fresh
        await Region.deleteMany({});
        await Quest.deleteMany({});
        console.log("✅ Cleared existing regions and quests\n");

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

        // ==================== PASSWORD SECURITY REGION ====================
        const passwordRegion = regions.find(r => r.code === "PASSWORDS");
        const passwordQuests = await Quest.insertMany([
            {
                region: passwordRegion._id,
                title: "Password Strength Basics",
                description: "Learn what makes a password strong or weak.",
                order: 1,
                questType: "tutorial",
                difficulty: 1,
                xpReward: 50,
                bonusXP: 15,
                requiredStars: 0,
                story: {
                    intro: "Weak passwords are the #1 way attackers gain access. Let's learn how to create fortress-level passwords.",
                    success: "You now understand password strength fundamentals!",
                    failure: "Review password requirements and try again."
                },
                icon: "🔐",
                status: "active"
            },
            {
                region: passwordRegion._id,
                title: "The Password Reset Trap",
                description: "Identify fake password reset requests.",
                order: 2,
                questType: "mission",
                difficulty: 2,
                xpReward: 60,
                bonusXP: 20,
                requiredStars: 2,
                story: {
                    intro: "Attackers love to send fake password reset emails. Can you spot the real from the fake?",
                    success: "Excellent! You identified the phishing attempt.",
                    failure: "That was a phishing email! Always verify password reset requests."
                },
                icon: "🔄",
                status: "active"
            },
            {
                region: passwordRegion._id,
                title: "Multi-Factor Authentication",
                description: "Understand the power of MFA and 2FA.",
                order: 3,
                questType: "question",
                difficulty: 2,
                xpReward: 70,
                bonusXP: 20,
                requiredStars: 4,
                story: {
                    intro: "Even strong passwords can be stolen. MFA adds an essential extra layer of protection.",
                    success: "You understand why MFA is critical for security!",
                    failure: "MFA prevents account takeover even if passwords are compromised."
                },
                icon: "📱",
                status: "active"
            },
            {
                region: passwordRegion._id,
                title: "Password Managers vs Memory",
                description: "Learn why password managers are essential.",
                order: 4,
                questType: "tutorial",
                difficulty: 3,
                xpReward: 80,
                bonusXP: 25,
                requiredStars: 6,
                story: {
                    intro: "Humans can't remember dozens of unique strong passwords. Password managers solve this problem.",
                    success: "Password managers are your best defense against credential reuse!",
                    failure: "Review how password managers protect against multiple attack vectors."
                },
                icon: "🗝️",
                status: "active"
            },
            {
                region: passwordRegion._id,
                title: "Password Boss: Credential Stuffing Attack",
                description: "Stop a credential stuffing attack scenario.",
                order: 5,
                questType: "boss",
                difficulty: 4,
                xpReward: 150,
                bonusXP: 50,
                requiredStars: 9,
                starThresholds: { one: 60, two: 80, three: 95 },
                story: {
                    intro: "Attackers have a database of leaked passwords and are trying them on our accounts. Use your password security knowledge to defend!",
                    success: "🏆 REGION COMPLETE! You're now a password security expert!",
                    failure: "The attackers got in! Remember: unique passwords + MFA = safety."
                },
                icon: "🏆",
                isBoss: true,
                status: "active"
            }
        ]);

        console.log(`✅ Created ${passwordQuests.length} quests for Password Security region\n`);
        passwordRegion.totalQuests = passwordQuests.length;
        passwordRegion.maxStars = passwordQuests.length * 3;
        passwordRegion.totalXP = passwordQuests.reduce((sum, q) => sum + q.xpReward, 0);
        await passwordRegion.save();

        // ==================== WEB & URL SAFETY REGION ====================
        const webRegion = regions.find(r => r.code === "WEB_SAFETY");
        const webQuests = await Quest.insertMany([
            {
                region: webRegion._id,
                title: "URL Anatomy 101",
                description: "Learn to read and analyze URLs properly.",
                order: 1,
                questType: "tutorial",
                difficulty: 2,
                xpReward: 60,
                bonusXP: 20,
                requiredStars: 0,
                story: {
                    intro: "URLs contain vital security information. Learn to decode them before clicking!",
                    success: "You can now read URLs like a security expert!",
                    failure: "Review the parts of a URL and their security implications."
                },
                icon: "🔍",
                status: "active"
            },
            {
                region: webRegion._id,
                title: "Typosquatting Tactics",
                description: "Identify URLs that impersonate legitimate sites.",
                order: 2,
                questType: "question",
                difficulty: 2,
                xpReward: 70,
                bonusXP: 20,
                requiredStars: 2,
                story: {
                    intro: "Attackers register look-alike domains to trick users. Can you spot the fakes?",
                    success: "Great eye! You spotted the typosquatting attempt.",
                    failure: "Look carefully at each character in the domain name."
                },
                icon: "👁️",
                status: "active"
            },
            {
                region: webRegion._id,
                title: "HTTPS vs HTTP",
                description: "Understand encryption and secure connections.",
                order: 3,
                questType: "tutorial",
                difficulty: 3,
                xpReward: 75,
                bonusXP: 25,
                requiredStars: 4,
                story: {
                    intro: "That little padlock icon matters more than you think. Learn why HTTPS is essential.",
                    success: "You now know when a connection is truly secure!",
                    failure: "HTTPS encrypts your data, but it doesn't mean the site is trustworthy."
                },
                icon: "🔒",
                status: "active"
            },
            {
                region: webRegion._id,
                title: "Suspicious Link Scanner",
                description: "Analyze suspicious links before clicking.",
                order: 4,
                questType: "mission",
                difficulty: 3,
                xpReward: 85,
                bonusXP: 25,
                requiredStars: 6,
                story: {
                    intro: "You've received several messages with links. Use your URL analysis skills to determine which are safe.",
                    success: "Perfect! You analyzed the links correctly.",
                    failure: "One of those links was malicious. Review your URL inspection skills."
                },
                icon: "🔗",
                status: "active"
            },
            {
                region: webRegion._id,
                title: "Web Boss: Fake Website Gallery",
                description: "Navigate a field of imposter websites.",
                order: 5,
                questType: "boss",
                difficulty: 4,
                xpReward: 160,
                bonusXP: 50,
                requiredStars: 9,
                starThresholds: { one: 60, two: 80, three: 95 },
                story: {
                    intro: "The Syndicate has created dozens of fake sites. Identify the real from the fakes across multiple scenarios!",
                    success: "🏆 REGION COMPLETE! No fake website can fool you now!",
                    failure: "You visited a fake site! Always verify domains carefully."
                },
                icon: "🏆",
                isBoss: true,
                status: "active"
            }
        ]);

        console.log(`✅ Created ${webQuests.length} quests for Web & URL Safety region\n`);
        webRegion.totalQuests = webQuests.length;
        webRegion.maxStars = webQuests.length * 3;
        webRegion.totalXP = webQuests.reduce((sum, q) => sum + q.xpReward, 0);
        await webRegion.save();

        // ==================== MALWARE AWARENESS REGION ====================
        const malwareRegion = regions.find(r => r.code === "MALWARE");
        const malwareQuests = await Quest.insertMany([
            {
                region: malwareRegion._id,
                title: "File Extension Red Flags",
                description: "Learn which file types are dangerous.",
                order: 1,
                questType: "tutorial",
                difficulty: 2,
                xpReward: 65,
                bonusXP: 20,
                requiredStars: 0,
                story: {
                    intro: "Not all files are what they seem. Learn to spot dangerous file extensions.",
                    success: "You can now identify risky file types!",
                    failure: "Double extensions (.pdf.exe) are a common malware trick."
                },
                icon: "📄",
                status: "active"
            },
            {
                region: malwareRegion._id,
                title: "Email Attachment Safety",
                description: "Decide which attachments are safe to open.",
                order: 2,
                questType: "question",
                difficulty: 3,
                xpReward: 75,
                bonusXP: 25,
                requiredStars: 2,
                story: {
                    intro: "Attachments are a primary malware delivery method. Learn when to open and when to delete.",
                    success: "You correctly identified the dangerous attachments!",
                    failure: "That attachment contained malware. Be more cautious!"
                },
                icon: "📎",
                status: "active"
            },
            {
                region: malwareRegion._id,
                title: "Ransomware Awareness",
                description: "Understand how ransomware infects systems.",
                order: 3,
                questType: "tutorial",
                difficulty: 3,
                xpReward: 80,
                bonusXP: 25,
                requiredStars: 4,
                story: {
                    intro: "Ransomware can lock down an entire organization. Learn how it spreads and how to stop it.",
                    success: "You now know how to prevent ransomware attacks!",
                    failure: "Review the common ransomware delivery methods."
                },
                icon: "🦠",
                status: "active"
            },
            {
                region: malwareRegion._id,
                title: "Malware Delivery Methods",
                description: "Identify various malware distribution tactics.",
                order: 4,
                questType: "mission",
                difficulty: 4,
                xpReward: 90,
                bonusXP: 30,
                requiredStars: 6,
                story: {
                    intro: "Malware comes via email, downloads, USB drives, and more. Spot the delivery methods!",
                    success: "Excellent! You identified all malware delivery attempts.",
                    failure: "Malware got through! Study the delivery vectors more carefully."
                },
                icon: "🚨",
                status: "active"
            },
            {
                region: malwareRegion._id,
                title: "Malware Boss: Ransomware Outbreak",
                description: "Stop a coordinated ransomware campaign.",
                order: 5,
                questType: "boss",
                difficulty: 5,
                xpReward: 170,
                bonusXP: 60,
                requiredStars: 9,
                starThresholds: { one: 60, two: 80, three: 95 },
                story: {
                    intro: "The Syndicate launched a massive ransomware attack via multiple vectors. Stop every infection attempt!",
                    success: "🏆 REGION COMPLETE! You saved the organization from ransomware!",
                    failure: "The ransomware encrypted critical files. Review all malware indicators."
                },
                icon: "🏆",
                isBoss: true,
                status: "active"
            }
        ]);

        console.log(`✅ Created ${malwareQuests.length} quests for Malware Awareness region\n`);
        malwareRegion.totalQuests = malwareQuests.length;
        malwareRegion.maxStars = malwareQuests.length * 3;
        malwareRegion.totalXP = malwareQuests.reduce((sum, q) => sum + q.xpReward, 0);
        await malwareRegion.save();

        // ==================== SOCIAL ENGINEERING REGION ====================
        const socialRegion = regions.find(r => r.code === "SOCIAL_ENGINEERING");
        const socialQuests = await Quest.insertMany([
            {
                region: socialRegion._id,
                title: "Pretexting Fundamentals",
                description: "Recognize when someone is building false trust.",
                order: 1,
                questType: "tutorial",
                difficulty: 3,
                xpReward: 75,
                bonusXP: 25,
                requiredStars: 0,
                story: {
                    intro: "Attackers create fake scenarios to manipulate victims. Learn to spot pretexting.",
                    success: "You can now see through pretexting attempts!",
                    failure: "Question every unexpected request for information."
                },
                icon: "🎭",
                status: "active"
            },
            {
                region: socialRegion._id,
                title: "Vishing: Voice Phishing",
                description: "Defend against phone-based attacks.",
                order: 2,
                questType: "question",
                difficulty: 3,
                xpReward: 80,
                bonusXP: 25,
                requiredStars: 2,
                story: {
                    intro: "Not all attacks come via email. Phone calls can be just as dangerous.",
                    success: "You identified the vishing attack!",
                    failure: "Never give sensitive information over the phone without verification."
                },
                icon: "📞",
                status: "active"
            },
            {
                region: socialRegion._id,
                title: "Authority Exploitation",
                description: "Resist psychological pressure from fake authority.",
                order: 3,
                questType: "mission",
                difficulty: 4,
                xpReward: 85,
                bonusXP: 30,
                requiredStars: 4,
                story: {
                    intro: "Attackers impersonate managers, IT staff, and executives. Learn to verify authority.",
                    success: "You didn't fall for the fake authority figure!",
                    failure: "Always verify unusual requests through a secondary channel."
                },
                icon: "👔",
                status: "active"
            },
            {
                region: socialRegion._id,
                title: "Psychological Manipulation",
                description: "Understand urgency, fear, and reward tactics.",
                order: 4,
                questType: "tutorial",
                difficulty: 4,
                xpReward: 90,
                bonusXP: 30,
                requiredStars: 6,
                story: {
                    intro: "Social engineers use emotion to bypass logic. Learn to recognize manipulation tactics.",
                    success: "You're now immune to psychological manipulation!",
                    failure: "Emotional appeals are designed to make you act without thinking."
                },
                icon: "🧠",
                status: "active"
            },
            {
                region: socialRegion._id,
                title: "Social Boss: Multi-Channel Attack",
                description: "Defend against coordinated social engineering.",
                order: 5,
                questType: "boss",
                difficulty: 5,
                xpReward: 180,
                bonusXP: 60,
                requiredStars: 9,
                starThresholds: { one: 60, two: 80, three: 95 },
                story: {
                    intro: "The Syndicate is attacking via email, phone, and in-person tactics simultaneously. Use all your skills!",
                    success: "🏆 REGION COMPLETE! No social engineer can manipulate you!",
                    failure: "The attack succeeded. Remember: verify, verify, verify!"
                },
                icon: "🏆",
                isBoss: true,
                status: "active"
            }
        ]);

        console.log(`✅ Created ${socialQuests.length} quests for Social Engineering region\n`);
        socialRegion.totalQuests = socialQuests.length;
        socialRegion.maxStars = socialQuests.length * 3;
        socialRegion.totalXP = socialQuests.reduce((sum, q) => sum + q.xpReward, 0);
        await socialRegion.save();

        // ==================== FINAL CHALLENGE REGION ====================
        const bossRegion = regions.find(r => r.code === "BOSS_CHALLENGE");
        const bossQuests = await Quest.insertMany([
            {
                region: bossRegion._id,
                title: "Multi-Vector Scenario: The CFO Compromise",
                description: "Face a sophisticated attack combining multiple techniques.",
                order: 1,
                questType: "boss",
                difficulty: 5,
                xpReward: 200,
                bonusXP: 75,
                requiredStars: 0,
                starThresholds: { one: 70, two: 85, three: 95 },
                story: {
                    intro: "A targeted attack on your CFO uses phishing, social engineering, and malware. Detect every element!",
                    success: "Outstanding! You stopped a complex multi-vector attack!",
                    failure: "The attack succeeded. Review all attack vectors and try again."
                },
                icon: "⚔️",
                isBoss: true,
                status: "active"
            },
            {
                region: bossRegion._id,
                title: "Advanced Persistent Threat",
                description: "Detect a long-term covert infiltration attempt.",
                order: 2,
                questType: "boss",
                difficulty: 5,
                xpReward: 220,
                bonusXP: 80,
                requiredStars: 3,
                starThresholds: { one: 70, two: 85, three: 95 },
                story: {
                    intro: "The Syndicate has infiltrated your organization over weeks. Find all their tactics!",
                    success: "Incredible! You uncovered the entire operation!",
                    failure: "Some attacks went undetected. APTs are patient and subtle."
                },
                icon: "🎯",
                isBoss: true,
                status: "active"
            },
            {
                region: bossRegion._id,
                title: "Ultimate Challenge: The Cyber Syndicate",
                description: "Face the Syndicate's ultimate combined assault.",
                order: 3,
                questType: "boss",
                difficulty: 5,
                xpReward: 250,
                bonusXP: 100,
                requiredStars: 6,
                starThresholds: { one: 75, two: 90, three: 98 },
                story: {
                    intro: "This is it. The Cyber Syndicate launches everything: phishing, malware, social engineering, fake websites, and more. Stop them all!",
                    success: "🎉🏆 CONGRATULATIONS! You are now an ELITE CYBER DEFENDER! The Cyber Syndicate has been defeated!",
                    failure: "The Syndicate broke through. Study every technique and try again!"
                },
                icon: "👑",
                isBoss: true,
                status: "active"
            }
        ]);

        console.log(`✅ Created ${bossQuests.length} quests for Final Challenge region\n`);
        bossRegion.totalQuests = bossQuests.length;
        bossRegion.maxStars = bossQuests.length * 3;
        bossRegion.totalXP = bossQuests.reduce((sum, q) => sum + q.xpReward, 0);
        await bossRegion.save();

        // ==================== SUMMARY ====================
        const totalQuests = phishingQuests.length + passwordQuests.length + webQuests.length +
            malwareQuests.length + socialQuests.length + bossQuests.length;

        console.log("=".repeat(50));
        console.log("🎉 World Map seed completed!");
        console.log(`   ${regions.length} regions created`);
        console.log(`   ${totalQuests} total quests created:`);
        console.log(`     - Phishing Detection: ${phishingQuests.length} quests`);
        console.log(`     - Password Security: ${passwordQuests.length} quests`);
        console.log(`     - Web & URL Safety: ${webQuests.length} quests`);
        console.log(`     - Malware Awareness: ${malwareQuests.length} quests`);
        console.log(`     - Social Engineering: ${socialQuests.length} quests`);
        console.log(`     - Final Challenge: ${bossQuests.length} quests`);
        console.log("=".repeat(50));

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seedRegions();

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Mission = require("./models/Mission");

const connectDB = require("./config/db");

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log("🌱 Starting database seed...\n");

        // Clear existing data
        await User.deleteMany({});
        await Mission.deleteMany({});
        console.log("✅ Cleared existing data\n");

        // Create users
        const hashedPassword = await bcrypt.hash("password123", 10);

        const users = await User.insertMany([
            {
                username: "admin",
                email: "admin@phishguard.com",
                password: hashedPassword,
                role: "admin",
                xp: 5000,
                level: 11,
                tier: "silver",
                streak: 15,
                longestStreak: 30,
                missionsCompleted: 45,
                correctDecisions: 40,
                totalDecisions: 45,
                badges: ["🏁 First Mission", "🎯 5 Missions", "🎖️ 10 Missions", "🏆 25 Missions", "🔥 Week Warrior", "🥈 Silver Tier"],
            },
            {
                username: "CyberDefender",
                email: "defender@example.com",
                password: hashedPassword,
                role: "user",
                xp: 2500,
                level: 6,
                tier: "bronze",
                streak: 7,
                longestStreak: 14,
                missionsCompleted: 20,
                correctDecisions: 17,
                totalDecisions: 20,
                badges: ["🏁 First Mission", "🎯 5 Missions", "🎖️ 10 Missions", "🔥 Week Warrior"],
            },
            {
                username: "PhishHunter",
                email: "hunter@example.com",
                password: hashedPassword,
                role: "user",
                xp: 8500,
                level: 18,
                tier: "gold",
                streak: 3,
                longestStreak: 45,
                missionsCompleted: 75,
                correctDecisions: 70,
                totalDecisions: 75,
                badges: ["🏁 First Mission", "🎯 5 Missions", "🎖️ 10 Missions", "🏆 25 Missions", "👑 50 Missions", "💪 Monthly Champion"],
            },
            {
                username: "SecurityNinja",
                email: "ninja@example.com",
                password: hashedPassword,
                role: "user",
                xp: 1000,
                level: 3,
                tier: "bronze",
                streak: 1,
                longestStreak: 5,
                missionsCompleted: 8,
                correctDecisions: 6,
                totalDecisions: 8,
                badges: ["🏁 First Mission", "🎯 5 Missions"],
            },
            {
                username: "NewRecruit",
                email: "newbie@example.com",
                password: hashedPassword,
                role: "user",
                xp: 150,
                level: 1,
                tier: "bronze",
                streak: 0,
                longestStreak: 2,
                missionsCompleted: 2,
                correctDecisions: 1,
                totalDecisions: 2,
                badges: ["🏁 First Mission"],
            },
        ]);

        console.log(`✅ Created ${users.length} users\n`);

        // Create missions
        const missions = await Mission.insertMany([
            {
                title: "Urgent: Password Reset Required",
                difficulty: 2,
                ranger: { name: "IT Security", department: "Technology" },
                helpRequest: "Your password will expire in 24 hours. Click to reset now.",
                emailBody: `Dear Valued Employee,

Our security systems have detected that your password will expire in 24 hours. To maintain access to your account, please reset your password immediately.

Click the link below to reset your password:
https://company-password-reset.tk/verify?user=12345

If you do not reset your password, your account will be locked.

Best regards,
IT Security Team`,
                emailHeaders: {
                    from: "security@company-support.tk",
                    to: "employee@company.com",
                    spf: "fail",
                    dkim: "none",
                    dmarc: "fail",
                    returnPath: "bounce@malicious-server.net"
                },
                isPhishing: true,
                clues: ["suspicious sender domain", "urgency", "threatening language", "suspicious link"],
                scoreWeight: 50,
                status: "published"
            },
            {
                title: "Weekly Team Meeting Notes",
                difficulty: 1,
                ranger: { name: "Sarah Johnson", department: "Engineering" },
                helpRequest: "Please review the attached meeting notes from yesterday's standup.",
                emailBody: `Hi Team,

Here are the key takeaways from yesterday's weekly standup:

1. Sprint 23 is on track for completion by Friday
2. The new feature launch is scheduled for next Monday
3. Please update your Jira tickets by EOD

Let me know if you have any questions.

Best,
Sarah`,
                emailHeaders: {
                    from: "sarah.johnson@company.com",
                    to: "engineering-team@company.com",
                    spf: "pass",
                    dkim: "pass",
                    dmarc: "pass",
                    returnPath: "sarah.johnson@company.com"
                },
                isPhishing: false,
                clues: ["legitimate sender", "normal business content"],
                scoreWeight: 30,
                status: "published"
            },
            {
                title: "You've Won a $500 Amazon Gift Card!",
                difficulty: 1,
                ranger: { name: "Amazon Rewards", department: "Promotions" },
                helpRequest: "Congratulations! Claim your prize now before it expires!",
                emailBody: `CONGRATULATIONS!!!

You have been selected as this week's WINNER of a $500 Amazon Gift Card!

🎉🎊 CLAIM NOW! 🎊🎉

Click here to claim your prize: http://amaz0n-rewards-center.xyz/claim

This offer expires in 24 hours. Don't miss out!

Amazon Rewards Team`,
                emailHeaders: {
                    from: "rewards@amaz0n-gifts.xyz",
                    to: "winner@email.com",
                    spf: "fail",
                    dkim: "none",
                    dmarc: "fail",
                    returnPath: "bounces@spam-server.net"
                },
                isPhishing: true,
                clues: ["suspicious sender", "too good to be true", "urgency", "suspicious domain", "excessive formatting"],
                scoreWeight: 40,
                status: "published"
            },
            {
                title: "Invoice #INV-2024-0847 - Payment Due",
                difficulty: 4,
                ranger: { name: "Accounts Payable", department: "Finance" },
                helpRequest: "Please process the attached invoice for vendor payment.",
                emailBody: `Dear Accounts Payable,

Please find attached Invoice #INV-2024-0847 for services rendered in Q4 2024.

Amount Due: $4,750.00
Due Date: December 31, 2024

Please wire transfer to the following account:
Bank: First International Bank
Account: 1234567890
Routing: 021000089

Thank you for your prompt attention to this matter.

Regards,
Billing Department
TechVendor Solutions`,
                emailHeaders: {
                    from: "billing@techvendor-invoices.com",
                    to: "ap@company.com",
                    spf: "neutral",
                    dkim: "pass",
                    dmarc: "none",
                    returnPath: "billing@techvendor-invoices.com"
                },
                isPhishing: true,
                clues: ["wire transfer request", "unfamiliar vendor", "unusual domain", "financial urgency"],
                scoreWeight: 70,
                status: "published"
            },
            {
                title: "Quarterly All-Hands Meeting Reminder",
                difficulty: 1,
                ranger: { name: "HR Department", department: "Human Resources" },
                helpRequest: "Reminder about the upcoming all-hands meeting",
                emailBody: `Hello Everyone,

This is a friendly reminder that the Q4 All-Hands Meeting is scheduled for:

📅 Date: Friday, December 20th
🕐 Time: 2:00 PM - 3:30 PM EST
📍 Location: Main Conference Room / Zoom Link

Agenda:
- 2024 Review
- 2025 Goals and Strategy
- Q&A Session

Please add this to your calendar. Attendance is mandatory.

Best regards,
HR Team`,
                emailHeaders: {
                    from: "hr@company.com",
                    to: "all-staff@company.com",
                    spf: "pass",
                    dkim: "pass",
                    dmarc: "pass",
                    returnPath: "hr@company.com"
                },
                isPhishing: false,
                clues: ["legitimate sender", "normal business content", "no suspicious links"],
                scoreWeight: 25,
                status: "published"
            },
            {
                title: "Your Netflix Account Has Been Suspended",
                difficulty: 2,
                ranger: { name: "Netflix Support", department: "Customer Service" },
                helpRequest: "Immediate action required to restore your account",
                emailBody: `Dear Netflix Member,

We were unable to validate your payment information for the next billing cycle of your subscription.

Your account has been temporarily suspended. To restore access, please update your payment details immediately:

Update Payment: http://netfl1x-account-verify.com/update

If you don't update your payment within 48 hours, your account will be permanently deleted.

Netflix Support Team`,
                emailHeaders: {
                    from: "support@netfl1x-billing.com",
                    to: "user@email.com",
                    spf: "fail",
                    dkim: "none",
                    dmarc: "fail",
                    returnPath: "bounces@phishing-server.net"
                },
                isPhishing: true,
                clues: ["suspicious domain (netfl1x)", "urgency", "threatening language", "suspicious link"],
                scoreWeight: 50,
                status: "published"
            },
            {
                title: "Your Package Could Not Be Delivered",
                difficulty: 3,
                ranger: { name: "FedEx Delivery", department: "Shipping" },
                helpRequest: "Action required for package delivery",
                emailBody: `Dear Customer,

We attempted to deliver your package today but were unsuccessful due to an incomplete address.

Tracking Number: 783924756391
Status: Delivery Failed

To reschedule delivery, please confirm your address and pay the $2.99 redelivery fee:

Confirm Delivery: http://fed-ex-redelivery.net/confirm

Your package will be returned to sender if not confirmed within 3 days.

FedEx Customer Service`,
                emailHeaders: {
                    from: "delivery@fed-ex-tracking.net",
                    to: "customer@email.com",
                    spf: "none",
                    dkim: "none",
                    dmarc: "fail",
                    returnPath: "noreply@fake-fedex.com"
                },
                isPhishing: true,
                clues: ["suspicious domain", "small fee request", "urgency", "generic greeting"],
                scoreWeight: 55,
                status: "published"
            },
            {
                title: "Performance Review Scheduled",
                difficulty: 1,
                ranger: { name: "Michael Chen", department: "Management" },
                helpRequest: "Your annual performance review has been scheduled",
                emailBody: `Hi,

I wanted to let you know that I've scheduled your annual performance review.

Date: January 15, 2025
Time: 10:00 AM - 11:00 AM
Location: Conference Room B

Please come prepared to discuss:
- Your accomplishments this year
- Goals for next year
- Any feedback or concerns

Looking forward to our conversation.

Best,
Michael Chen
Engineering Manager`,
                emailHeaders: {
                    from: "michael.chen@company.com",
                    to: "employee@company.com",
                    spf: "pass",
                    dkim: "pass",
                    dmarc: "pass",
                    returnPath: "michael.chen@company.com"
                },
                isPhishing: false,
                clues: ["legitimate internal sender", "normal business content"],
                scoreWeight: 25,
                status: "published"
            },
        ]);

        console.log(`✅ Created ${missions.length} missions\n`);

        console.log("=".repeat(50));
        console.log("🎉 Database seeded successfully!\n");
        console.log("Test accounts:");
        console.log("  Admin:  admin@phishguard.com / password123");
        console.log("  User:   defender@example.com / password123");
        console.log("=".repeat(50));

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seedDatabase();

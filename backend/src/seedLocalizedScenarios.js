const mongoose = require("mongoose");
const LocalizedScenario = require("./models/LocalizedScenario");
require("dotenv").config();

const scenarios = [
    // === INDIA-SPECIFIC SCENARIOS === //
    {
        title: "UPI Payment Request Scam",
        locale: "IN",
        category: "payment",
        isPhishing: true,
        difficulty: 2,
        content: {
            type: "sms",
            sender: {
                name: "PHNPE-ALERT",
                phone: "+91-9876543210"
            },
            body: "Dear Customer, Your PhonePe account has been temporarily blocked due to KYC verification pending. Click here to verify immediately: bit.ly/phonepe-kyc-verify or your account will be permanently blocked in 24 hours.",
            links: [{
                displayText: "bit.ly/phonepe-kyc-verify",
                actualUrl: "http://fake-phonepe.malicious.site/verify",
                isMalicious: true
            }]
        },
        redFlags: [
            { type: "urgency", description: "24-hour deadline creates panic", location: "body" },
            { type: "threat", description: "Account blocking threat", location: "body" },
            { type: "suspicious_link", description: "Shortened URL hides actual destination", location: "link" },
            { type: "wrong_domain", description: "Real PhonePe uses official app, not bit.ly links", location: "link" }
        ],
        explanation: "PhonePe and other UPI apps never send KYC verification links via SMS. They always ask you to verify within the official app. The shortened URL hides a malicious website designed to steal your credentials.",
        culturalContext: "UPI payment apps are extremely popular in India, making them prime targets for scammers. Many users are familiar with KYC requirements and may panic when threatened with account blocking.",
        xpReward: 30,
        tags: ["upi", "phonePe", "kyc", "sms"]
    },
    {
        title: "NEFT Transaction Confirmation",
        locale: "IN",
        category: "banking",
        isPhishing: true,
        difficulty: 3,
        content: {
            type: "email",
            sender: {
                name: "SBI Alert",
                email: "neft.alert@sbi-secure-banking.com"
            },
            subject: "URGENT: NEFT Transaction of Rs. 49,999 Initiated - Action Required",
            body: `Dear Valued Customer,

A NEFT transaction of Rs. 49,999/- has been initiated from your SBI account ending with XXXX to an unknown beneficiary.

Transaction Details:
- Amount: Rs. 49,999/-
- Date: Today
- Status: PENDING VERIFICATION

If you did not initiate this transaction, please click the link below immediately to cancel and secure your account:

[CANCEL TRANSACTION NOW]

If not cancelled within 30 minutes, the amount will be debited.

Regards,
State Bank of India
Customer Security Team`,
            ctaButton: {
                text: "CANCEL TRANSACTION NOW",
                url: "http://sbi-cancel-transaction.fake-site.com/verify",
                isMalicious: true
            }
        },
        redFlags: [
            { type: "urgency", description: "30-minute deadline", location: "body" },
            { type: "wrong_domain", description: "Email from sbi-secure-banking.com, not official sbi.co.in", location: "sender" },
            { type: "fear", description: "Threat of losing money", location: "body" },
            { type: "request_info", description: "Asks to click external link", location: "cta" }
        ],
        explanation: "SBI and all Indian banks send transaction alerts from official domains (@sbi.co.in). They never ask you to click links to cancel transactions - you must call the official helpline or visit a branch.",
        culturalContext: "NEFT is the most common interbank transfer method in India. Rs. 49,999 is just under the Rs. 50,000 threshold that triggers additional verification, making this amount seem believable.",
        xpReward: 35,
        tags: ["neft", "sbi", "banking", "email"]
    },
    {
        title: "Income Tax Refund Notice",
        locale: "IN",
        category: "government",
        isPhishing: true,
        difficulty: 2,
        content: {
            type: "sms",
            sender: {
                name: "IT-REFUND",
                phone: "+91-9123456789"
            },
            body: "INCOME TAX DEPT: Your refund of Rs. 15,400 for AY 2024-25 is pending. Update your bank account details to receive refund: incometax-refund.in/update. Expires in 48 hours.",
            links: [{
                displayText: "incometax-refund.in/update",
                actualUrl: "http://incometax-refund.in/steal-data",
                isMalicious: true
            }]
        },
        redFlags: [
            { type: "urgency", description: "48-hour expiry creates urgency", location: "body" },
            { type: "wrong_domain", description: "Official domain is incometaxindia.gov.in", location: "link" },
            { type: "greed", description: "Promise of money appeals to greed", location: "body" }
        ],
        explanation: "The Income Tax Department of India only communicates through incometaxindia.gov.in. Refunds are processed automatically to registered bank accounts. They never ask for bank details via SMS.",
        culturalContext: "Tax refunds are eagerly awaited by Indian taxpayers. Scammers exploit this during tax season (March-July) when people expect communications from the IT department.",
        xpReward: 25,
        tags: ["income-tax", "refund", "government", "sms"]
    },
    {
        title: "Legitimate Flipkart Order Confirmation",
        locale: "IN",
        category: "shopping",
        isPhishing: false,
        difficulty: 2,
        content: {
            type: "email",
            sender: {
                name: "Flipkart",
                email: "noreply@flipkart.com"
            },
            subject: "Your Flipkart order #OD432156789 has been confirmed!",
            body: `Hi Customer,

Thank you for shopping with Flipkart!

Your order #OD432156789 has been confirmed and will be delivered by Thursday, Feb 6.

Order Summary:
- Samsung Galaxy Buds2 Pro - Rs. 12,999
- Delivery Address: Your registered address

Track your order in the Flipkart app or at flipkart.com/track

Questions? Chat with us in the app or call 1800-208-9898.

Happy Shopping!
Team Flipkart`,
            links: [{
                displayText: "flipkart.com/track",
                actualUrl: "https://www.flipkart.com/track",
                isMalicious: false
            }]
        },
        redFlags: [],
        explanation: "This is a legitimate Flipkart order confirmation. The email comes from the official @flipkart.com domain, contains your order details, and links to the official website. It doesn't ask for any sensitive information or create urgency.",
        culturalContext: "Flipkart is one of India's largest e-commerce platforms. Their legitimate emails follow this format with order IDs and official contact information.",
        xpReward: 20,
        tags: ["flipkart", "shopping", "legitimate"]
    },

    // === US-SPECIFIC SCENARIOS === //
    {
        title: "IRS Tax Refund Notification",
        locale: "US",
        category: "government",
        isPhishing: true,
        difficulty: 2,
        content: {
            type: "email",
            sender: {
                name: "IRS Tax Refund",
                email: "refund@irs-tax-refund.com"
            },
            subject: "IRS Notification: Tax Refund of $3,847.00 Pending",
            body: `Dear Taxpayer,

After the last annual calculations of your fiscal activity, we have determined that you are eligible to receive a tax refund of $3,847.00.

To claim your refund, please submit the tax refund request and allow us 5-7 business days to process.

[SUBMIT REFUND REQUEST]

Please have your Social Security Number ready for verification.

Internal Revenue Service
U.S. Department of Treasury`,
            ctaButton: {
                text: "SUBMIT REFUND REQUEST",
                url: "http://irs-refund-claim.fake-gov.com/submit",
                isMalicious: true
            }
        },
        redFlags: [
            { type: "wrong_domain", description: "IRS uses irs.gov, not irs-tax-refund.com", location: "sender" },
            { type: "request_info", description: "Asks for Social Security Number", location: "body" },
            { type: "greed", description: "Promise of money", location: "body" },
            { type: "authority", description: "Impersonates government agency", location: "body" }
        ],
        explanation: "The IRS never initiates contact via email about refunds. They communicate through postal mail. The domain irs-tax-refund.com is not affiliated with the government. Never provide your SSN via email.",
        culturalContext: "Tax season (January-April) sees a surge in IRS-themed phishing. Americans are conditioned to expect tax communications, making them vulnerable to these scams.",
        xpReward: 30,
        tags: ["irs", "tax", "government", "ssn"]
    },
    {
        title: "Amazon Prime Subscription Renewal",
        locale: "US",
        category: "shopping",
        isPhishing: true,
        difficulty: 3,
        content: {
            type: "email",
            sender: {
                name: "Amazon Prime",
                email: "prime-renewal@amazon-billing.net"
            },
            subject: "Your Prime membership will auto-renew for $139.99",
            body: `Hello,

Your Amazon Prime membership is set to automatically renew on February 5, 2026 for $139.99.

If you did not authorize this charge or wish to cancel, please call our customer service immediately:

📞 1-888-555-0123

Or click below to manage your subscription:
[MANAGE SUBSCRIPTION]

If you take no action, your card ending in ***4521 will be charged.

Amazon.com, Inc.`,
            ctaButton: {
                text: "MANAGE SUBSCRIPTION",
                url: "http://amazon-prime-manage.scam-site.com/account",
                isMalicious: true
            }
        },
        redFlags: [
            { type: "wrong_domain", description: "Email from amazon-billing.net, not amazon.com", location: "sender" },
            { type: "fear", description: "Fear of unauthorized charge", location: "body" },
            { type: "authority", description: "Impersonates trusted company", location: "body" },
            { type: "request_info", description: "Phone number likely leads to scam call center", location: "body" }
        ],
        explanation: "Amazon only sends emails from @amazon.com. The phone number provided goes to a scam call center where they'll try to get your payment details. Always manage subscriptions through the official Amazon website or app.",
        culturalContext: "Amazon Prime is extremely popular in the US. Scammers exploit brand trust and the fear of unwanted charges. The price matches the actual Prime cost to seem legitimate.",
        xpReward: 35,
        tags: ["amazon", "subscription", "shopping"]
    },
    {
        title: "Legitimate Chase Bank Alert",
        locale: "US",
        category: "banking",
        isPhishing: false,
        difficulty: 3,
        content: {
            type: "sms",
            sender: {
                name: "Chase",
                phone: "242-73"
            },
            body: "Chase Free Msg: Did you attempt a $156.42 transaction at TARGET on 02/02? Reply Y or N. If you didn't make this purchase, call 1-800-935-9935.",
            links: []
        },
        redFlags: [],
        explanation: "This is a legitimate Chase fraud alert. Real bank fraud alerts: 1) Come from official short codes (242-73 = CHASE), 2) Ask simple Y/N questions, 3) Provide the official number you can verify, 4) Don't include links, 5) Don't ask for account details.",
        culturalContext: "Major US banks send real-time fraud alerts. Chase uses the short code 242-73. Always call the number on your card to verify, not a number in a text.",
        xpReward: 25,
        tags: ["chase", "banking", "fraud-alert", "legitimate"]
    },

    // === GLOBAL SCENARIOS === //
    {
        title: "Apple ID Security Alert",
        locale: "GLOBAL",
        category: "tech_support",
        isPhishing: true,
        difficulty: 2,
        content: {
            type: "email",
            sender: {
                name: "Apple Support",
                email: "security@apple-id-support.com"
            },
            subject: "Your Apple ID has been used to sign in to a new device",
            body: `Dear Customer,

Your Apple ID (y***@gmail.com) was used to sign in to iCloud via a web browser.

Date and Time: February 2, 2026 at 3:47 AM
Location: Lagos, Nigeria
Device: Windows PC

If this wasn't you, your account may be compromised. Secure your account immediately:

[SECURE MY ACCOUNT]

If this was you, you can ignore this message.

Apple Support`,
            ctaButton: {
                text: "SECURE MY ACCOUNT",
                url: "http://appleid-unlock.fake-support.com/secure",
                isMalicious: true
            }
        },
        redFlags: [
            { type: "wrong_domain", description: "Apple uses @apple.com, not apple-id-support.com", location: "sender" },
            { type: "fear", description: "Fear of account compromise", location: "body" },
            { type: "urgency", description: "Implies immediate action needed", location: "body" }
        ],
        explanation: "Apple only sends emails from @apple.com or @id.apple.com. Real Apple security alerts direct you to appleid.apple.com. Never click links – go directly to the official website.",
        culturalContext: "Apple's global brand recognition makes it a top target for phishing. The mention of an unfamiliar location (Lagos, Nigeria) is designed to create panic.",
        xpReward: 25,
        tags: ["apple", "icloud", "tech"]
    },
    {
        title: "Package Delivery Notification",
        locale: "GLOBAL",
        category: "delivery",
        isPhishing: true,
        difficulty: 1,
        content: {
            type: "sms",
            sender: {
                name: "Delivery",
                phone: "+1-555-0199"
            },
            body: "Your package could not be delivered due to incomplete address. Update delivery details here: bit.ly/package-redelivery or it will be returned to sender.",
            links: [{
                displayText: "bit.ly/package-redelivery",
                actualUrl: "http://package-scam.site/steal",
                isMalicious: true
            }]
        },
        redFlags: [
            { type: "generic_greeting", description: "No specific tracking number or carrier name", location: "body" },
            { type: "urgency", description: "Threat of package being returned", location: "body" },
            { type: "suspicious_link", description: "Shortened URL hides destination", location: "link" }
        ],
        explanation: "Legitimate delivery notifications include specific tracking numbers and come from official carrier numbers. They don't use generic shortened URLs. Always track packages on the carrier's official website.",
        culturalContext: "With the rise of online shopping globally, package delivery scams have become universal. They work especially well when people are actually expecting deliveries.",
        xpReward: 20,
        tags: ["delivery", "package", "shipping"]
    },
    {
        title: "LinkedIn Connection Request",
        locale: "GLOBAL",
        category: "social",
        isPhishing: false,
        difficulty: 2,
        content: {
            type: "email",
            sender: {
                name: "LinkedIn",
                email: "messages-noreply@linkedin.com"
            },
            subject: "Sarah Johnson wants to connect",
            body: `Hi John,

Sarah Johnson, Senior Developer at TechCorp, wants to connect with you on LinkedIn.

"Hi! We met at the React Conference last month. Would love to stay in touch!"

Accept | Ignore | View Sarah's profile

This email was intended for John Doe. Learn why we include this.

© 2026 LinkedIn Corporation, 1000 W Maude Ave, Sunnyvale, CA 94085`,
            links: [{
                displayText: "Accept",
                actualUrl: "https://www.linkedin.com/comm/mynetwork/invite-accept/...",
                isMalicious: false
            }]
        },
        redFlags: [],
        explanation: "This is a legitimate LinkedIn notification. Signs it's real: 1) Comes from @linkedin.com, 2) Includes your name, 3) Links go to linkedin.com, 4) Includes proper footer with company address, 5) No urgency or threats.",
        culturalContext: "LinkedIn is used globally for professional networking. Legitimate notifications follow this format and don't ask for passwords or sensitive information.",
        xpReward: 20,
        tags: ["linkedin", "social", "legitimate"]
    }
];

async function seedLocalizedScenarios() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/phishing-training";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Clear existing scenarios
        await LocalizedScenario.deleteMany({});
        console.log("Cleared existing scenarios");

        // Insert new scenarios
        const result = await LocalizedScenario.insertMany(scenarios);
        console.log(`Inserted ${result.length} localized scenarios`);

        // Summary by locale
        const summary = await LocalizedScenario.aggregate([
            { $group: { _id: "$locale", count: { $sum: 1 } } }
        ]);
        console.log("Scenarios by locale:", summary);

        console.log("✅ Localized scenarios seeded successfully!");
    } catch (error) {
        console.error("Error seeding scenarios:", error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedLocalizedScenarios();
}

module.exports = { seedLocalizedScenarios, scenarios };

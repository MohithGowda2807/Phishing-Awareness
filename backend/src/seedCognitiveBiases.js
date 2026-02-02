const mongoose = require("mongoose");
const CognitiveBias = require("./models/CognitiveBias");
require("dotenv").config();

const biases = [
    {
        biasId: "urgency",
        name: "Urgency Bias",
        icon: "⏰",
        shortDescription: "Acting hastily under time pressure without thinking critically",
        detailedExplanation: `Urgency bias is the tendency to make quick decisions when under time pressure, bypassing our normal critical thinking processes. When we feel rushed, our brains shift from analytical "slow thinking" to reactive "fast thinking."

This happens because:
• Our brains evolved to respond quickly to threats
• Time pressure triggers stress hormones
• We fear missing out on opportunities or facing consequences
• Cognitive load increases, reducing our ability to analyze`,
        attackerExploitation: `Attackers use urgency to bypass your critical thinking:

• "Your account will be suspended in 24 hours!"
• "Act now - offer expires in 10 minutes!"
• "Immediate action required to prevent fraud!"
• Countdown timers and expiring "deals"

By creating artificial time pressure, attackers prevent you from verifying claims, consulting others, or recognizing red flags.`,
        examples: [
            {
                scenario: "Email claiming your bank account will be frozen in 2 hours unless you verify your identity immediately",
                howItWorks: "The artificial deadline creates panic, making you click without checking if the email is legitimate",
                redFlags: ["Arbitrary deadline", "Threats of account action", "Asks you to click links"]
            },
            {
                scenario: "Tech support popup saying your computer is infected and you must call now",
                howItWorks: "Fear of virus + urgency = calling without realizing it's a scam",
                redFlags: ["Unsolicited popup", "Urgent language", "Asks for phone call or payment"]
            }
        ],
        defenseStrategies: [
            {
                strategy: "The 10-Minute Rule",
                explanation: "When you feel urgency, wait 10 minutes before acting. Legitimate requests rarely have life-or-death deadlines."
            },
            {
                strategy: "Verify Through Official Channels",
                explanation: "Contact the organization directly using a number from their official website, not from the message."
            },
            {
                strategy: "Ask: 'Who benefits from my rush?'",
                explanation: "If speed only benefits the requester, that's a red flag."
            }
        ],
        exercises: [
            {
                type: "identify",
                prompt: "Which of these messages uses urgency manipulation?",
                scenario: {
                    content: "Message A: Your monthly statement is ready. View it at your convenience.\n\nMessage B: URGENT: Your password expires TODAY! Click here immediately to avoid losing access!",
                    sender: "Unknown",
                    context: "Email comparison"
                },
                options: [
                    { text: "Message A", isCorrect: false, explanation: "Message A uses calm language and doesn't create time pressure" },
                    { text: "Message B", isCorrect: true, explanation: "Message B uses ALL CAPS, 'URGENT', 'immediately', and a deadline to create panic" },
                    { text: "Both messages", isCorrect: false, explanation: "Only Message B uses urgency tactics" },
                    { text: "Neither message", isCorrect: false, explanation: "Message B clearly uses urgency manipulation" }
                ],
                explanation: "Message B creates artificial urgency with words like 'URGENT', 'TODAY', and 'immediately' to bypass your critical thinking.",
                xpReward: 20,
                difficulty: 1
            },
            {
                type: "resist",
                prompt: "You receive this email: 'Your subscription will be cancelled in 1 hour! Click here to update payment NOW!' What's the best response?",
                scenario: {
                    content: "Your subscription will be cancelled in 1 hour! Click here to update payment NOW!",
                    sender: "streaming-service@mail.net",
                    context: "Email from supposed streaming service"
                },
                options: [
                    { text: "Click the link quickly to update payment", isCorrect: false, explanation: "This is exactly what the attacker wants - rushing without verification" },
                    { text: "Ignore the email completely", isCorrect: false, explanation: "While safe, you should also verify with the actual service" },
                    { text: "Wait, then log into the official website directly to check", isCorrect: true, explanation: "This bypasses the potentially malicious link while still addressing any real issue" },
                    { text: "Reply to the email asking for more time", isCorrect: false, explanation: "Replying confirms your email is active and you fell for the bait" }
                ],
                explanation: "The best defense against urgency is to pause, then verify through official channels you control (not links in the email).",
                xpReward: 25,
                difficulty: 2
            },
            {
                type: "analyze",
                prompt: "Why does the 'Your computer is infected! Call now!' popup work on so many people?",
                scenario: {
                    content: "⚠️ CRITICAL WARNING! Your computer is infected with 47 viruses! Call Microsoft Support immediately: 1-800-555-0123. Do not close this window!",
                    sender: "Tech Support Scam",
                    context: "Browser popup"
                },
                options: [
                    { text: "People trust warnings that look official", isCorrect: false, explanation: "True but incomplete - urgency is the key manipulation" },
                    { text: "The threat of losing data combined with time pressure overrides rational thinking", isCorrect: true, explanation: "Correct! Fear + urgency = bypassed critical thinking" },
                    { text: "The specific number of viruses (47) seems credible", isCorrect: false, explanation: "The specific number is just window dressing - urgency is the main tactic" },
                    { text: "People actually have viruses", isCorrect: false, explanation: "These popups are fake - your browser cannot detect viruses" }
                ],
                explanation: "The combination of fear (data loss, viruses) and urgency (call 'immediately') triggers our stress response, which disables critical thinking.",
                xpReward: 30,
                difficulty: 3
            }
        ],
        references: [
            { title: "Thinking, Fast and Slow", source: "Daniel Kahneman", url: "" },
            { title: "Influence: The Psychology of Persuasion", source: "Robert Cialdini", url: "" }
        ],
        order: 1
    },
    {
        biasId: "authority",
        name: "Authority Bias",
        icon: "👔",
        shortDescription: "Trusting requests more when they appear to come from authority figures",
        detailedExplanation: `Authority bias is our tendency to attribute greater accuracy to the opinion of an authority figure and be more influenced by that opinion. We're conditioned from childhood to respect and obey authority.

This happens because:
• Authority figures often do have expertise
• Obedience is reinforced throughout education
• Questioning authority feels socially uncomfortable
• We use authority as a mental shortcut for trust`,
        attackerExploitation: `Attackers impersonate authority figures:

• "This is IT Support, we need your password"
• "The CEO needs you to wire money urgently"
• "This is the IRS/Police/Government calling"
• Using official logos, titles, and formal language

The uniform (even digital) commands respect and compliance.`,
        examples: [
            {
                scenario: "Email 'from the CEO' requesting urgent wire transfer",
                howItWorks: "Employees hesitate to question requests from executives, especially urgent ones",
                redFlags: ["Unusual request from high-level exec", "Urgency", "Requests bypassing normal procedures"]
            },
            {
                scenario: "Call claiming to be from 'Microsoft Security' about virus on your computer",
                howItWorks: "Microsoft is a trusted authority in tech, so their 'security team' seems credible",
                redFlags: ["Unsolicited call", "Microsoft doesn't call users", "Asks for remote access"]
            }
        ],
        defenseStrategies: [
            {
                strategy: "Verify Through Back-Channels",
                explanation: "Contact the supposed authority through official channels you find independently, not through contact info they provide."
            },
            {
                strategy: "Question Unusual Requests",
                explanation: "Real authority figures follow procedures. Requests to bypass normal processes are red flags."
            },
            {
                strategy: "Remember: Authority Can Be Faked",
                explanation: "Email addresses, caller IDs, logos, and titles can all be spoofed."
            }
        ],
        exercises: [
            {
                type: "identify",
                prompt: "Which email is most likely using authority bias manipulation?",
                scenario: {
                    content: "Email A: Hi team, please submit your timesheets by Friday. - Jane, HR\n\nEmail B: URGENT from CEO: I need you to purchase gift cards for a client meeting. Keep this confidential. Reply only to this email.",
                    sender: "Comparison",
                    context: "Two workplace emails"
                },
                options: [
                    { text: "Email A - HR is an authority figure", isCorrect: false, explanation: "This is a normal HR request following standard procedure" },
                    { text: "Email B - CEO making unusual confidential request", isCorrect: true, explanation: "Gift card requests, secrecy, and urgency from 'CEO' are classic BEC scam indicators" },
                    { text: "Both emails", isCorrect: false, explanation: "Email A is a routine request; Email B has manipulation red flags" },
                    { text: "Neither email", isCorrect: false, explanation: "Email B shows clear authority manipulation patterns" }
                ],
                explanation: "Email B exploits CEO authority for an unusual request with secrecy requirements - a classic Business Email Compromise pattern.",
                xpReward: 25,
                difficulty: 2
            },
            {
                type: "resist",
                prompt: "You get a call: 'This is the IRS. You owe back taxes and must pay today or face arrest.' What should you do?",
                scenario: {
                    content: "This is the IRS calling. Our records show you owe $4,500 in back taxes. You must pay today using gift cards or a wire transfer, or we will issue a warrant for your arrest.",
                    sender: "Caller claiming to be IRS",
                    context: "Phone call"
                },
                options: [
                    { text: "Pay immediately to avoid legal trouble", isCorrect: false, explanation: "This is exactly what the scammer wants" },
                    { text: "Ask for their badge number to verify", isCorrect: false, explanation: "Scammers easily make up fake badge numbers" },
                    { text: "Hang up and call the IRS directly using their official number", isCorrect: true, explanation: "The real IRS never demands immediate payment via gift cards or threats" },
                    { text: "Negotiate for more time to pay", isCorrect: false, explanation: "Engaging validates the scam and wastes your time" }
                ],
                explanation: "The IRS never calls to demand immediate payment, never accepts gift cards, and never threatens arrest. Always verify through official channels.",
                xpReward: 25,
                difficulty: 2
            }
        ],
        references: [
            { title: "Milgram Experiment", source: "Stanley Milgram", url: "" }
        ],
        order: 2
    },
    {
        biasId: "scarcity",
        name: "Scarcity Bias",
        icon: "⚡",
        shortDescription: "Valuing things more when they seem rare or limited",
        detailedExplanation: `Scarcity bias is our tendency to place higher value on things that are scarce or appear to be running out. When something seems limited, we want it more.

This happens because:
• Scarcity indicates value (basic economics)
• Fear of missing out (FOMO) triggers action
• Limited availability suggests exclusivity
• Competition for scarce resources is evolutionarily ingrained`,
        attackerExploitation: `Attackers create artificial scarcity:

• "Only 3 spots left!"
• "Offer expires in 10 minutes!"
• "First 100 people only!"
• "Limited time offer - act now!"

The goal is to make you act before thinking.`,
        examples: [
            {
                scenario: "Email claiming you won a prize but must claim within 24 hours",
                howItWorks: "The limited time creates urgency combined with the 'scarcity' of the prize opportunity",
                redFlags: ["Unsolicited prize", "Time limit", "Asks for personal information to claim"]
            }
        ],
        defenseStrategies: [
            {
                strategy: "If It's Too Good To Be True...",
                explanation: "Legitimate offers don't usually come with artificial scarcity and pressure tactics."
            },
            {
                strategy: "Sleep On It",
                explanation: "Real opportunities will still be available tomorrow. Scams won't."
            }
        ],
        exercises: [
            {
                type: "identify",
                prompt: "Which message uses scarcity manipulation?",
                scenario: {
                    content: "Message A: Check out our new product line at your convenience.\n\nMessage B: ONLY 2 LEFT IN STOCK! Order NOW before they're gone FOREVER!",
                    sender: "Retail comparison",
                    context: "Marketing emails"
                },
                options: [
                    { text: "Message A", isCorrect: false, explanation: "Message A has no urgency or scarcity language" },
                    { text: "Message B", isCorrect: true, explanation: "Message B uses 'ONLY 2 LEFT', 'NOW', and 'FOREVER' to create artificial scarcity" },
                    { text: "Both messages", isCorrect: false, explanation: "Only Message B uses scarcity tactics" },
                    { text: "Neither message", isCorrect: false, explanation: "Message B clearly uses scarcity manipulation" }
                ],
                explanation: "Message B creates artificial urgency and scarcity with limited stock claims and all-caps urgency.",
                xpReward: 20,
                difficulty: 1
            }
        ],
        order: 3
    },
    {
        biasId: "social_proof",
        name: "Social Proof Bias",
        icon: "👥",
        shortDescription: "Following what others do, assuming they know something we don't",
        detailedExplanation: `Social proof is our tendency to assume that if many people are doing something, it must be correct. We look to others' behavior to guide our own decisions.

This happens because:
• Following the crowd was often safe evolutionarily
• Others may have information we don't
• We want to fit in and be accepted
• It's a mental shortcut for decision-making`,
        attackerExploitation: `Attackers fake social proof:

• "1,000 people already invested!"
• Fake reviews and testimonials
• "Your friend John shared this with you"
• Showing fake viewer/download counts`,
        examples: [
            {
                scenario: "Crypto scam showing 'testimonials' from people who got rich",
                howItWorks: "Seeing others succeed makes the opportunity seem legitimate and profitable",
                redFlags: ["Unrealistic returns", "Pressure to invest quickly", "Testimonials can be faked"]
            }
        ],
        defenseStrategies: [
            {
                strategy: "Verify Claims Independently",
                explanation: "Don't trust testimonials at face value. Look for independent reviews and verification."
            },
            {
                strategy: "Consider the Source",
                explanation: "Who's showing you this social proof? They likely benefit from your action."
            }
        ],
        exercises: [
            {
                type: "identify",
                prompt: "Which uses fake social proof?",
                scenario: {
                    content: "Email: 'Your colleague Mark already completed this security training. Don't be the last one!'",
                    sender: "training@company-sec-update.net",
                    context: "Supposed workplace email"
                },
                options: [
                    { text: "This is legitimate workplace pressure", isCorrect: false, explanation: "The sender domain is suspicious, and real training wouldn't name colleagues" },
                    { text: "This uses social proof manipulation with a fake sender", isCorrect: true, explanation: "Naming a colleague and implying others completed it uses social proof, combined with suspicious domain" },
                    { text: "This is a helpful reminder", isCorrect: false, explanation: "Check the sender domain - it's not a real company email" },
                    { text: "There's no manipulation here", isCorrect: false, explanation: "Multiple manipulation tactics are present" }
                ],
                explanation: "This uses fake social proof (claiming a colleague completed it) combined with a suspicious external domain to seem legitimate.",
                xpReward: 25,
                difficulty: 2
            }
        ],
        order: 4
    },
    {
        biasId: "fear",
        name: "Fear-Based Manipulation",
        icon: "😰",
        shortDescription: "Making poor decisions when afraid of negative consequences",
        detailedExplanation: `Fear is one of our most powerful emotions, and when activated, it can override rational thinking. Attackers exploit this by creating threats and dire consequences.

This happens because:
• Fear triggers fight-or-flight response
• Stress hormones reduce analytical thinking
• We prioritize immediate threats over analysis
• Fear of loss is stronger than desire for gain`,
        attackerExploitation: `Attackers create fear with:

• "Your account has been compromised!"
• "Virus detected! Your data is at risk!"
• "Legal action will be taken!"
• "Your computer will be locked!"`,
        examples: [
            {
                scenario: "Ransomware popup claiming FBI has detected illegal activity",
                howItWorks: "Fear of legal consequences + embarrassment makes victims pay without thinking",
                redFlags: ["FBI doesn't collect fines via gift cards", "Popup is just HTML, not real detection"]
            }
        ],
        defenseStrategies: [
            {
                strategy: "Recognize the Fear Response",
                explanation: "When you feel fear from a message, that's your signal to be MORE skeptical, not less."
            },
            {
                strategy: "Take a Break Before Acting",
                explanation: "Fear dissipates with time. Wait before responding to fearful messages."
            }
        ],
        exercises: [
            {
                type: "resist",
                prompt: "You see: 'Your computer is locked by FBI for viewing illegal content. Pay $500 fine.' What do you do?",
                scenario: {
                    content: "FBI CYBER DIVISION: Your computer has been locked for viewing illegal content. Pay the $500 fine using iTunes gift cards within 24 hours or face prosecution.",
                    sender: "FBI Popup",
                    context: "Browser popup"
                },
                options: [
                    { text: "Pay the fine to avoid prosecution", isCorrect: false, explanation: "This is a scam - you'd be paying criminals" },
                    { text: "Close the browser and scan for malware", isCorrect: true, explanation: "This is just a popup. The FBI doesn't collect fines via gift cards or lock browsers." },
                    { text: "Call the number on the popup", isCorrect: false, explanation: "The number goes to scammers who will steal more money" },
                    { text: "Turn off your computer forever", isCorrect: false, explanation: "Overreaction - this is just a fake popup that can be closed" }
                ],
                explanation: "The FBI doesn't lock computers or collect fines via gift cards. This is 'ransomware-lite' that just uses fear to extract payment.",
                xpReward: 25,
                difficulty: 2
            }
        ],
        order: 5
    },
    {
        biasId: "reciprocity",
        name: "Reciprocity Bias",
        icon: "🎁",
        shortDescription: "Feeling obligated to return favors, even unsolicited ones",
        detailedExplanation: `Reciprocity is the social norm of responding to a positive action with another positive action. When someone does something for us, we feel obligated to return the favor.

This happens because:
• Reciprocity maintains social bonds
• Feeling indebted is uncomfortable
• It's deeply ingrained across cultures
• Even small gifts create obligation`,
        attackerExploitation: `Attackers give before they take:

• Free trials that require payment info
• "Free" security scans that find problems
• Small gifts before asking for info
• Helpful "tech support" before access request`,
        examples: [
            {
                scenario: "Someone helps you with a task then asks for your password",
                howItWorks: "The initial help creates obligation, making you more likely to comply",
                redFlags: ["Unsolicited help", "Request for sensitive info", "Pressure to reciprocate"]
            }
        ],
        defenseStrategies: [
            {
                strategy: "Unsolicited Gifts Don't Require Reciprocation",
                explanation: "You didn't ask for it, so you don't owe anything."
            },
            {
                strategy: "Separate Gifts from Requests",
                explanation: "Evaluate requests based on their merit, not on previous 'gifts'."
            }
        ],
        exercises: [
            {
                type: "identify",
                prompt: "Which scenario uses reciprocity manipulation?",
                scenario: {
                    content: "Caller: 'Hi! I noticed your computer was running slow and I fixed it remotely for free. Now I just need you to confirm by giving me your login details to verify the fix worked.'",
                    sender: "Unsolicited caller",
                    context: "Phone call"
                },
                options: [
                    { text: "This is legitimate tech support", isCorrect: false, explanation: "Unsolicited access to your computer is never legitimate" },
                    { text: "The caller used reciprocity - 'I helped you, now help me'", isCorrect: true, explanation: "The 'free fix' creates obligation to comply with the credential request" },
                    { text: "This is just normal tech support procedure", isCorrect: false, explanation: "No one should 'fix' your computer without being asked" },
                    { text: "There's no manipulation here", isCorrect: false, explanation: "The entire scenario is social engineering using reciprocity" }
                ],
                explanation: "By claiming to have already helped you, the attacker creates an obligation that makes you more likely to give up your credentials.",
                xpReward: 30,
                difficulty: 3
            }
        ],
        order: 6
    }
];

async function seedCognitiveBiases() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/phishing-training";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Clear existing biases
        await CognitiveBias.deleteMany({});
        console.log("Cleared existing cognitive biases");

        // Insert new biases
        const result = await CognitiveBias.insertMany(biases);
        console.log(`Inserted ${result.length} cognitive biases`);

        // Summary
        const totalExercises = biases.reduce((sum, b) => sum + b.exercises.length, 0);
        console.log(`Total exercises: ${totalExercises}`);

        console.log("✅ Cognitive biases seeded successfully!");
    } catch (error) {
        console.error("Error seeding biases:", error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedCognitiveBiases();
}

module.exports = { seedCognitiveBiases, biases };

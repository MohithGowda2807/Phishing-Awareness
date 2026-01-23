/**
 * Seed Questions for World Map Regions
 * Creates region and category-specific questions
 * Run with: node src/seedQuestions.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");
const Quest = require("./models/Quest");
const Region = require("./models/Region");
const connectDB = require("./config/db");

const seedQuestions = async () => {
    try {
        await connectDB();
        console.log("📝 Seeding World Map Questions...\\n");

        // Delete existing questions to re-seed fresh
        await Question.deleteMany({});
        console.log("✅ Cleared existing questions\\n");

        // Get regions to link questions
        const regions = await Region.find({});
        const quests = await Quest.find({}).populate('region');

        // ==================== PHISHING REGION QUESTIONS ====================
        const phishingQuests = quests.filter(q => q.region.code === "PHISHING");

        const phishingQuestions = [
            // Spot the Fake Sender - Quest 1
            {
                prompt: "Analyze this email sender address. Is it legitimate?",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 1,
                    topic: ["phishing", "email", "sender-verification"]
                },
                content: {
                    emailHeaders: {
                        from: "support@paypa1-security.com",
                        fromName: "PayPal Security Team",
                        subject: "Your account requires verification",
                        spf: "fail",
                        dkim: "fail"
                    },
                    emailBody: "Dear valued customer, We've detected unusual activity. Click here to verify your account within 24 hours."
                },
                answers: [
                    {
                        id: "a1",
                        label: "Legitimate PayPal email",
                        code: "BENIGN",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Phishing - typosquatting in domain (paypa1 vs paypal)",
                        code: "PHISHING_SPEAR",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Spam but not malicious",
                        code: "SPAM",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Look carefully at the domain - 'paypa1' uses number 1 instead of letter l",
                    "SPF and DKIM authentication failed",
                    "Real PayPal uses @paypal.com domain"
                ],
                explanation: "This is a typosquatting phishing attack. The domain 'paypa1-security.com' uses the number '1' instead of the letter 'l' to impersonate PayPal. The failed SPF/DKIM checks confirm it's not from the real PayPal servers.",
                status: "published"
            },
            {
                prompt: "Examine this email from your bank. Should you trust it?",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["phishing", "email", "banking"]
                },
                content: {
                    emailHeaders: {
                        from: "alerts@chase.online-banking.net",
                        fromName: "Chase Bank Security",
                        subject: "Suspicious Transaction Detected - Action Required",
                        spf: "pass",
                        dkim: "none"
                    },
                    emailBody: "We've detected a suspicious $5,000 wire transfer from your account. If this wasn't you, click the link below immediately to block the transaction."
                },
                answers: [
                    {
                        id: "a1",
                        label: "Legitimate - Chase uses third-party email services",
                        code: "BENIGN",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Phishing - wrong domain and creates urgency",
                        code: "PHISHING_GENERAL",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Internal phishing test from IT",
                        code: "TEST",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Real Chase uses @chase.com or @email.chase.com",
                    "Creates artificial urgency to make you act quickly",
                    "'online-banking.net' is NOT Chase's official domain"
                ],
                explanation: "This is a phishing email. While SPF might pass (the scammer's server is configured), the domain 'chase.online-banking.net' is not owned by Chase. Real Chase communications come from @chase.com. The urgency tactic is designed to make you click without thinking.",
                status: "published"
            },

            // Link Inspection 101 - Quest 2
            {
                prompt: "Where does this 'Password Reset' link actually lead?",
                contentType: "url",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["phishing", "url", "link-analysis"]
                },
                content: {
                    emailBody: "Click here to reset your Microsoft password: <a href='http://microsoft-password-reset.tk/verify'>Reset Now</a>",
                    urlToAnalyze: "http://microsoft-password-reset.tk/verify",
                    emailHeaders: {
                        from: "no-reply@microsoft.com",
                        subject: "Password Reset Request"
                    }
                },
                answers: [
                    {
                        id: "a1",
                        label: "Official Microsoft password reset page",
                        code: "BENIGN",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Phishing site - wrong domain and HTTP (not HTTPS)",
                        code: "PHISHING_CREDENTIAL",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Legitimate third-party password manager",
                        code: "BENIGN",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Real Microsoft uses account.microsoft.com or login.microsoft.com",
                    ".tk domain is often used by scammers (free domain)",
                    "HTTP instead of HTTPS - no encryption",
                    "Sender email might be spoofed"
                ],
                explanation: "This link leads to a phishing site. The .tk top-level domain is frequently used by scammers because domains are free. Microsoft would never use this. Additionally, the lack of HTTPS means any password you enter would be sent unencrypted.",
                status: "published"
            },

            // Urgency Red Flags - Quest 3
            {
                prompt: "Your manager sent you this urgent email. What do you do?",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["phishing", "social-engineering", "urgency"]
                },
                content: {
                    emailHeaders: {
                        from: "james.wilson@company-secure.com",
                        fromName: "James Wilson (CEO)",
                        subject: "URGENT: Need gift cards for client meeting",
                        spf: "fail",
                        dkim: "fail"
                    },
                    emailBody: "I'm in a meeting and need you to buy $500 in iTunes gift cards immediately for a client. Email me the codes ASAP. This is time-sensitive!"
                },
                answers: [
                    {
                        id: "a1",
                        label: "Buy the gift cards immediately - CEO is waiting",
                        code: "UNSAFE_ACTION",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Phishing/BEC attack - verify via phone or in person first",
                        code: "SAFE_ACTION",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Forward to IT department to check",
                        code: "SAFE_ACTION_PARTIAL",
                        isCorrect: true,
                        weight: 0.7
                    }
                ],
                clues: [
                    "Domain doesn't match your company's email domain",
                    "SPF and DKIM authentication failed",
                    "Gift card requests are a classic scam tactic",
                    "Creates artificial urgency to bypass critical thinking",
                    "CEOs don't usually request gift cards via email"
                ],
                explanation: "This is a Business Email Compromise (BEC) attack. Scammers impersonate executives to trick employees into buying gift cards or wiring money. The urgency is intentional - they want you to act before thinking. Always verify unusual requests through a secondary channel (phone call, in-person, Teams message).",
                status: "published"
            },

            // CEO Impersonation - Quest 4
            {
                prompt: "The CFO requests an urgent wire transfer. Analyze this email carefully.",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 3,
                    topic: ["phishing", "bec", "wire-fraud"]
                },
                content: {
                    emailHeaders: {
                        from: "sarah_johnson@company.com.secure-portal.net",
                        fromName: "Sarah Johnson",
                        subject: "Re: Confidential Acquisition",
                        spf: "pass",
                        dkim: "pass",
                        returnPath: "bounce@company.com.secure-portal.net"
                    },
                    emailBody: "Following up on our call - please wire $45,000 to our acquisition attorney's trust account by EOD. Account details: [Bank info]. This must remain confidential until the deal closes. Reply when complete."
                },
                answers: [
                    {
                        id: "a1",
                        label: "Process the wire transfer - CFO authorized it",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "BEC scam - verify via company directory phone number",
                        code: "SAFE",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Reply asking for written authorization",
                        code: "SAFE_PARTIAL",
                        isCorrect: true,
                        weight: 0.5
                    },
                    {
                        id: "a4",
                        label: "Call the number in their email signature",
                        code: "UNSAFE",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Domain has extra parts: '.secure-portal.net' after company.com",
                    "Claims prior conversation that likely didn't happen",
                    "Demands confidentiality to prevent verification",
                    "Time pressure (EOD deadline)",
                    "Even though SPF/DKIM pass, the domain itself is wrong"
                ],
                explanation: "Sophisticated BEC attack. The domain 'company.com.secure-portal.net' looks official but isn't your company's domain. Attackers registered this to pass email authentication. They reference a fake prior call to establish legitimacy. Always verify wire transfers via a known phone number from your company directory, never the number in the email.",
                status: "published"
            }
        ];

        // ==================== PASSWORD SECURITY QUESTIONS ====================
        const passwordQuestions = [
            {
                prompt: "Which of these passwords is the strongest?",
                contentType: "text",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 1,
                    topic: ["passwords", "strength", "security"]
                },
                answers: [
                    {
                        id: "a1",
                        label: "Password123!",
                        code: "WEAK",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "ilovemydog",
                        code: "WEAK",
                        isCorrect: false
                    },
                    {
                        id: "a3",
                        label: "Tr0pic@lF1shSw!m2024",
                        code: "STRONG",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a4",
                        label: "12345678",
                        code: "VERY_WEAK",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Strong passwords use mixed case, numbers, symbols, and length",
                    "Avoid common words and patterns",
                    "Longer passwords (12+ characters) are harder to crack"
                ],
                explanation: "Tr0pic@lF1shSw!m2024 is the strongest because it's long (18 chars), uses uppercase, lowercase, numbers, and special characters, and isn't based on dictionary words. Password123! is common and easily guessed. Number sequences like 12345678 are among the first tried by attackers.",
                status: "published"
            },
            {
                prompt: "You receive a password reset email you didn't request. What should you do?",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["passwords", "phishing", "account-security"]
                },
                content: {
                    emailHeaders: {
                        from: "no-reply@accountrecovery-service.com",
                        subject: "Password Reset Request",
                        spf: "pass"
                    },
                    emailBody: "Someone requested a password reset for your account. Click here to reset: [link]"
                },
                answers: [
                    {
                        id: "a1",
                        label: "Click the link to secure my account",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Delete it and go directly to the website to change password",
                        code: "SAFE",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Reply asking if it's legitimate",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "Ignore it completely",
                        code: "SAFE_PARTIAL",
                        isCorrect: true,
                        weight: 0.6
                    }
                ],
                clues: [
                    "Unsolicited password reset emails are often phishing",
                    "Never click links in unexpected emails",
                    "Go directly to the official website instead"
                ],
                explanation: "The safest action is to delete the email and manually visit the official website to change your password. This could be phishing to steal your credentials, OR someone might be trying to access your account. Either way, don't click the link - go directly to the site yourself.",
                status: "published"
            },
            {
                prompt: "Why is Multi-Factor Authentication (MFA) important?",
                contentType: "text",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["passwords", "mfa", "authentication"]
                },
                answers: [
                    {
                        id: "a1",
                        label: "It makes passwords stronger",
                        code: "PARTIAL",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "It protects accounts even if password is stolen",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "It's only needed for high-security accounts",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "It replaces the need for strong passwords",
                        code: "INCORRECT",
                        isCorrect: false
                    }
                ],
                clues: [
                    "MFA adds a second verification step",
                    "Passwords can be stolen but MFA is on your device",
                    "Even compromised passwords won't work without the second factor"
                ],
                explanation: "MFA is critical because it protects your account even if someone steals your password (via phishing, database breach, keylogger, etc.). They would still need your phone, authenticator code, or biometric to access the account. MFA should be enabled on ALL important accounts.",
                status: "published"
            }
        ];

        // ==================== WEB & URL SAFETY QUESTIONS ====================
        const webQuestions = [
            {
                prompt: "Analyze this URL. Is it safe to visit?",
                contentType: "url",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["web-safety", "url", "typosquatting"]
                },
                content: {
                    urlToAnalyze: "https://www.arnazon.com/deals"
                },
                answers: [
                    {
                        id: "a1",
                        label: "Safe - it's Amazon's deals page with HTTPS",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Typosquatting - 'arnazon' mimics Amazon",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Safe - Amazon subdomain",
                        code: "INCORRECT",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Look carefully at each letter in the domain",
                    "'arnazon' swaps 'm' for 'rn' to look like 'amazon'",
                    "HTTPS doesn't guarantee the site is trustworthy"
                ],
                explanation: "This is typosquatting. 'arnazon.com' uses 'rn' next to each other to visually mimic the 'm' in Amazon. Scammers register such domains to catch mistyped URLs or trick users. HTTPS just means the connection is encrypted - it doesn't verify the site's legitimacy.",
                status: "published"
            },
            {
                prompt: "You receive a link: http://bit.ly/FreeIphone14. What's the concern?",
                contentType: "url",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["web-safety", "url-shorteners", "phishing"]
                },
                content: {
                    urlToAnalyze: "http://bit.ly/FreeIphone14",
                    smsBody: "CONGRATULATIONS! You won an iPhone 14! Claim here:"
                },
                answers: [
                    {
                        id: "a1",
                        label: "Safe - bit.ly is a trusted URL shortener",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Dangerous - shortened URL hides destination + too good to be true",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Safe if you hover over it first",
                        code: "PARTIAL",
                        isCorrect: false
                    }
                ],
                clues: [
                    "URL shorteners hide the real destination",
                    "Free iPhone offers are almost always scams",
                    "HTTP (not HTTPS) is unencrypted",
                    "Legitimate giveaways don't use shortened links"
                ],
                explanation: "Multiple red flags: URL shorteners like bit.ly hide where you're really going, 'free iPhone' is a classic scam tactic, and it uses HTTP instead of HTTPS. Real companies don't distribute prizes via text with shortened links. Never click such links.",
                status: "published"
            },
            {
                prompt: "What does the padlock icon (HTTPS) really mean?",
                contentType: "text",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 3,
                    topic: ["web-safety", "https", "ssl"]
                },
                answers: [
                    {
                        id: "a1",
                        label: "The website is definitely safe and legitimate",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Your connection to the site is encrypted",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "The site has been verified by cybersecurity experts",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "The site can't have malware or phishing",
                        code: "INCORRECT",
                        isCorrect: false
                    }
                ],
                clues: [
                    "HTTPS encrypts data in transit",
                    "Phishing sites can also have HTTPS",
                    "It doesn't verify if the site is legitimate or Safe"
                ],
                explanation: "HTTPS only means your connection is encrypted - data sent between you and the server can't be intercepted. It does NOT mean the site is trustworthy. Phishing sites increasingly use HTTPS. You must still verify the domain name and check for other red flags.",
                status: "published"
            }
        ];

        // ==================== MALWARE QUESTIONS ====================
        const malwareQuestions = [
            {
                prompt: "Which file extension is MOST dangerous to open?",
                contentType: "text",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 2,
                    topic: ["malware", "file-types", "extensions"]
                },
                answers: [
                    {
                        id: "a1",
                        label: ".pdf",
                        code: "LOW_RISK",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: ".jpg",
                        code: "LOW_RISK",
                        isCorrect: false
                    },
                    {
                        id: "a3",
                        label: ".exe",
                        code: "HIGH_RISK",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a4",
                        label: ".txt",
                        code: "LOW_RISK",
                        isCorrect: false
                    }
                ],
                clues: [
                    ".exe files are executable programs",
                    "Any .exe from unknown source can contain malware",
                    "Images and PDFs are safer but can have exploits"
                ],
                explanation: ".exe files are Windows executables that run code directly. Opening an .exe from an untrusted source can immediately infect your computer with malware. While PDFs and images can theoretically contain exploits, .exe files are direct code execution and far more dangerous.",
                status: "published"
            },
            {
                prompt: "You receive an email attachment: 'Invoice.pdf.exe'. What is this?",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 3,
                    topic: ["malware", "double-extension", "disguise"]
                },
                content: {
                    emailHeaders: {
                        from: "billing@vendor-invoice.com",
                        subject: "Outstanding Invoice #4521"
                    },
                    emailBody: "Please review the attached invoice and process payment by end of week."
                },
                answers: [
                    {
                        id: "a1",
                        label: "A PDF file with .exe metadata",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Double extension malware disguised as PDF",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Corrupted PDF file",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "Self-extracting PDF archive",
                        code: "INCORRECT",
                        isCorrect: false
                    }
                ],
                clues: [
                    "The real extension is what comes LAST (.exe)",
                    ".pdf.exe is a classic malware disguise",
                    "Windows often hides the real extension",
                    "It will run as an executable, not open as a PDF"
                ],
                explanation: "This is a double extension attack. The file is actually an executable (.exe) disguised as a PDF. Windows may hide the .exe extension by default, showing only 'Invoice.pdf' and a PDF icon. When opened, it executes malware. Real invoices are typically .pdf, .docx, or .xlsx - never .exe.",
                status: "published"
            },
            {
                prompt: "What is ransomware's primary goal?",
                contentType: "text",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 3,
                    topic: ["malware", "ransomware", "attacks"]
                },
                answers: [
                    {
                        id: "a1",
                        label: "Steal passwords and credentials",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Encrypt files and demand payment to decrypt",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Delete all files permanently",
                        code: "INCORRECT",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "Use your computer for cryptocurrency mining",
                        code: "INCORRECT",
                        isCorrect: false
                    }
                ],
                clues: [
                    "Ransomware holds your data hostage",
                    "Payment is demanded to restore access",
                    "Files are encrypted, not deleted"
                ],
                explanation: "Ransomware encrypts your files and displays a ransom demand (often in Bitcoin). Paying doesn't guarantee file recovery. Prevention is key: offline backups, email caution, updated software, and avoiding downloaded executables from unknown sources.",
                status: "published"
            }
        ];

        // ==================== SOCIAL ENGINEERING QUESTIONS ====================
        const socialQuestions = [
            {
                prompt: "Someone calls claiming to be from IT, asking for your password. What do you do?",
                contentType: "text",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 3,
                    topic: ["social-engineering", "vishing", "pretexting"]
                },
                answers: [
                    {
                        id: "a1",
                        label: "Provide it if they can prove their identity",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Never give your password - IT never needs it",
                        code: "CORRECT",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Give it but change it afterward",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "Ask them to email the request instead",
                        code: "PARTIAL",
                        isCorrect: true,
                        weight: 0.3
                    }
                ],
                clues: [
                    "Legitimate IT never asks for passwords",
                    "IT can reset passwords without knowing them",
                    "This is a vishing (voice phishing) attack"
                ],
                explanation: "NEVER give your password to anyone, even if they claim to be IT. Legitimate IT staff can reset passwords without knowing them and have admin access for troubleshooting. This is a social engineering attack (vishing). Hang up and contact IT through official channels if needed.",
                status: "published"
            },
            {
                prompt: "You receive an urgent email from 'HR' requesting your Social Security Number for tax filing. The sender's email is hr-payroll@company-hr.org. What do you do?",
                contentType: "email",
                questionType: "single-answer",
                maxPoints: 100,
                tags: {
                    difficulty: 4,
                    topic: ["social-engineering", "pretexting", "data-theft"]
                },
                content: {
                    emailHeaders: {
                        from: "hr-payroll@company-hr.org",
                        fromName: "HR Department",
                        subject: "URGENT: Tax Information Required by EOD"
                    },
                    emailBody: "Due to an audit, we need all employees to confirm their SSN by end of day. Reply with your full SSN and date of birth to avoid payroll delays."
                },
                answers: [
                    {
                        id: "a1",
                        label: "Reply with the information - it's from HR",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a2",
                        label: "Verify with HR via company directory before responding",
                        code: "SAFE",
                        isCorrect: true,
                        weight: 1.0
                    },
                    {
                        id: "a3",
                        label: "Call the number in the email signature",
                        code: "UNSAFE",
                        isCorrect: false
                    },
                    {
                        id: "a4",
                        label: "Forward to your manager for approval",
                        code: "SAFE_PARTIAL",
                        isCorrect: true,
                        weight: 0.6
                    }
                ],
                clues: [
                    "Domain doesn't match company's email domain",
                    "Urgency tactic (EOD deadline)",
                    "HR already has your SSN on file",
                    "Never send SSN via email",
                    "Verify through official company channels"
                ],
                explanation: "This is a sophisticated pretexting attack impersonating HR. The domain 'company-hr.org' is likely fake (check your company's real domain). HR already has your tax info and wouldn't request it via email. The urgency creates pressure to bypass verification. Always verify sensitive info requests through known company phone numbers or in person.",
                status: "published"
            }
        ];

        // Insert all questions
        const allQuestions = [
            ...phishingQuestions,
            ...passwordQuestions,
            ...webQuestions,
            ...malwareQuestions,
            ...socialQuestions
        ];

        const createdQuestions = await Question.insertMany(allQuestions);
        console.log(`✅ Created ${createdQuestions.length} questions across all regions\\n`);

        console.log("=".repeat(50));
        console.log("🎉 Question seed completed!");
        console.log(`   ${createdQuestions.length} total questions created:`);
        console.log(`     - Phishing: ${phishingQuestions.length} questions`);
        console.log(`     - Password Security: ${passwordQuestions.length} questions`);
        console.log(`     - Web & URL Safety: ${webQuestions.length} questions`);
        console.log(`     - Malware Awareness: ${malwareQuestions.length} questions`);
        console.log(`     - Social Engineering: ${socialQuestions.length} questions`);
        console.log("=".repeat(50));

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seedQuestions();

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// File attachment scenarios
const FILE_POOL = [
    // MALICIOUS
    { id: 1, name: "invoice.pdf.exe", size: "2.3 MB", sender: "accounts@company-name.com", extension: ".exe", isMalicious: true, reason: "Double extension trick - it's an .exe disguised as PDF" },
    { id: 2, name: "resume.docx", size: "8.9 MB", sender: "hr@recruitment.biz", extension: ".docx", isMalicious: true, reason: "File size too large for a document - likely contains malware" },
    { id: 3, name: "photo.jpg.scr", size: "1.1 MB", sender: "friend@email.com", extension: ".scr", isMalicious: true, reason: ".scr files are screensavers that can execute code" },
    { id: 4, name: "update.bat", size: "125 KB", sender: "IT-support@company.com", extension: ".bat", isMalicious: true, reason: ".bat files are batch scripts that run commands" },

    // SAFE
    { id: 101, name: "report-2024.pdf", size: "245 KB", sender: "boss@company.com", extension: ".pdf", isMalicious: false, reason: "Normal PDF size and legitimate sender" },
    { id: 102, extension: ".jpg", sender: "friend@gmail.com", isMalicious: false, reason: "Image file from known contact with normal size" },
    { id: 103, name: "presentation.pptx", size: "3.2 MB", sender: "colleague@company.com", extension: ".pptx", isMalicious: false, reason: "PowerPoint from work colleague, reasonable size" },
    { id: 104, name: "data.xlsx", size: "567 KB", sender: "team@company.com", extension: ".xlsx", isMalicious: false, reason: "Excel spreadsheet from team, appropriate size" }
];

export default function AttachmentQuarantine() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [currentFile, setCurrentFile] = useState(null);
    const [quarantined, setQuarantined] = useState(0);
    const [allowed, setAllowed] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [scanning, setScanning] = useState(false);

    const startGame = () => {
        setGameStarted(true);
        setScore(0);
        setQuarantined(0);
        setAllowed(0);
        setLives(3);
        setGameOver(false);
        generateFile();
    };

    const generateFile = () => {
        const randomFile = FILE_POOL[Math.floor(Math.random() * FILE_POOL.length)];
        setCurrentFile({ ...randomFile, id: Date.now() });
    };

    const scanFile = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
        }, 1500);
    };

    const makeDecision = (shouldQuarantine) => {
        if (!currentFile) return;

        const correct = (shouldQuarantine && currentFile.isMalicious) || (!shouldQuarantine && !currentFile.isMalicious);

        if (correct) {
            setScore(prev => prev + 10);
            if (shouldQuarantine) setQuarantined(prev => prev + 1);
            else setAllowed(prev => prev + 1);
        } else {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                }
                return newLives;
            });
        }

        setTimeout(() => {
            if (!gameOver) {
                generateFile();
                setScanning(false);
            }
        }, 1000);
    };

    // Game over
    if (gameOver) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">🦠</div>
                        <h2 className="text-3xl font-bold mb-2">Security Breach!</h2>
                        <p className="text-lg text-secondary mb-6">Your system was compromised</p>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Score</div>
                                <div className="text-2xl font-bold text-primary">{score}</div>
                            </div>
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Quarantined</div>
                                <div className="text-2xl font-bold text-red-400">{quarantined}</div>
                            </div>
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Allowed</div>
                                <div className="text-2xl font-bold text-emerald-400">{allowed}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={startGame} className="btn-primary w-full">🔄 Try Again</button>
                            <button onClick={() => navigate("/training")} className="btn-secondary w-full">← Back</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">🦠</div>
                        <h1 className="text-3xl font-bold mb-4">Attachment Quarantine</h1>
                        <p className="text-lg text-secondary mb-6">
                            Scan email attachments and quarantine malicious files!
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Examine file name, extension, and size</li>
                                <li>• Use X-Ray to scan for threats</li>
                                <li>• Quarantine malicious files</li>
                                <li>• Allow safe files through</li>
                                <li>• 3 mistakes and you're infected!</li>
                            </ul>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            🦠 Start Scanning
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main game
    return (
        <div className="animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Score</div>
                        <div className="text-lg font-bold text-primary">{score}</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Quarantined</div>
                        <div className="text-lg font-bold text-red-400">{quarantined}</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Allowed</div>
                        <div className="text-lg font-bold text-emerald-400">{allowed}</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Lives</div>
                        <div className="text-lg">
                            {Array(3).fill(0).map((_, i) => (
                                <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conveyor Belt / File Display */}
                {currentFile && (
                    <div className="glass-card p-8 mb-6">
                        <div className="bg-surface rounded-lg p-6">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-4xl">
                                    📎
                                </div>
                                <div className="flex-1">
                                    <div className="text-xl font-bold mb-2">{currentFile.name}</div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-secondary">Size: </span>
                                            <span className="font-mono">{currentFile.size}</span>
                                        </div>
                                        <div>
                                            <span className="text-secondary">From: </span>
                                            <span className="font-mono text-xs">{currentFile.sender}</span>
                                        </div>
                                        <div>
                                            <span className="text-secondary">Extension: </span>
                                            <span className={`font-mono font-bold ${['.exe', '.bat', '.scr', '.vbs'].includes(currentFile.extension)
                                                    ? 'text-red-400'
                                                    : 'text-emerald-400'
                                                }`}>
                                                {currentFile.extension}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* X-Ray Scanner */}
                            {scanning && (
                                <div className="bg-hover rounded-lg p-4 mb-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">🔍</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold mb-2">Scanning...</div>
                                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 animate-pulse" style={{ width: "75%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={scanFile}
                                    disabled={scanning}
                                    className="btn-secondary py-3"
                                >
                                    🔍 X-Ray Scan
                                </button>
                                <button
                                    onClick={() => makeDecision(false)}
                                    className="btn-primary bg-emerald-500 hover:bg-emerald-600 py-3"
                                >
                                    ✅ Allow
                                </button>
                                <button
                                    onClick={() => makeDecision(true)}
                                    className="btn-primary bg-red-500 hover:bg-red-600 py-3"
                                >
                                    🗑️ Quarantine
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning Signs */}
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                    <div className="font-semibold mb-2 text-red-400">🚩 Red Flags to Watch:</div>
                    <ul className="space-y-1 text-sm text-secondary grid md:grid-cols-2 gap-2">
                        <li>• Double extensions (.pdf.exe)</li>
                        <li>• Executable files (.exe, .bat, .scr)</li>
                        <li>• Unusual file sizes</li>
                        <li>• Unexpected senders</li>
                        <li>• Masked extensions</li>
                        <li>• Compressed files from strangers</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

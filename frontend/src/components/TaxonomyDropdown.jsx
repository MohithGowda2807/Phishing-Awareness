/**
 * Taxonomy Dropdown Component
 * 
 * Two-level dropdown with type → subtype selection.
 * Maps selections to internal taxonomy codes.
 */
import { useState, useEffect } from "react";

// Taxonomy constants (mirrors backend)
const THREAT_TYPES = [
    { code: "BENIGN", label: "Not malicious / Benign" },
    { code: "PHISHING", label: "Phishing" },
    { code: "MALWARE", label: "Malware" },
    { code: "SOCIAL_ENGINEERING", label: "Social Engineering" },
    { code: "SCAM", label: "Scam / Fraud" },
    { code: "SPAM", label: "Spam / Marketing" },
];

const SUBTYPES = {
    PHISHING: [
        { code: "PHISHING_SPEAR", label: "Spear Phishing" },
        { code: "PHISHING_WHALING", label: "Whaling (Executive-targeted)" },
        { code: "PHISHING_BEC", label: "Business Email Compromise (BEC)" },
        { code: "PHISHING_CREDENTIAL", label: "Credential Harvesting" },
        { code: "PHISHING_LINK", label: "Link-based Phishing" },
        { code: "PHISHING_ATTACHMENT", label: "Attachment-based Phishing" },
        { code: "PHISHING_CLONE", label: "Clone Phishing" },
    ],
    MALWARE: [
        { code: "MALWARE_RANSOMWARE", label: "Ransomware" },
        { code: "MALWARE_TROJAN", label: "Trojan" },
        { code: "MALWARE_KEYLOGGER", label: "Keylogger" },
        { code: "MALWARE_INFOSTEALER", label: "Info-stealer" },
        { code: "MALWARE_LOADER", label: "Loader / Dropper" },
    ],
};

const CHANNEL_VECTORS = [
    { code: "EMAIL", label: "Email" },
    { code: "SMS", label: "SMS / Smishing" },
    { code: "VOICE", label: "Voice / Vishing" },
    { code: "SOCIAL_MEDIA", label: "Social Media DM" },
    { code: "WEBSITE", label: "Website / Landing Page" },
    { code: "QR", label: "QR / Quishing" },
];

/**
 * Type and Subtype Selection
 */
export function ThreatTypeSelect({ value, onChange, className = "" }) {
    const [selectedType, setSelectedType] = useState(value?.type || "");
    const [selectedSubtype, setSelectedSubtype] = useState(value?.subtype || "");

    const subtypes = SUBTYPES[selectedType] || [];
    const hasSubtypes = subtypes.length > 0;

    useEffect(() => {
        onChange?.({
            type: selectedType,
            subtype: selectedSubtype,
            code: selectedSubtype || selectedType,
        });
    }, [selectedType, selectedSubtype]);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        setSelectedSubtype(""); // Reset subtype when type changes
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Main Type Dropdown */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                    Threat Type
                </label>
                <select
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                >
                    <option value="">Select a threat type...</option>
                    {THREAT_TYPES.map((type) => (
                        <option key={type.code} value={type.code}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Subtype Dropdown (conditional) */}
            {hasSubtypes && selectedType && (
                <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                        Specific Classification (Optional)
                    </label>
                    <select
                        value={selectedSubtype}
                        onChange={(e) => setSelectedSubtype(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                    >
                        <option value="">General {THREAT_TYPES.find(t => t.code === selectedType)?.label}</option>
                        {subtypes.map((subtype) => (
                            <option key={subtype.code} value={subtype.code}>
                                {subtype.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                        💡 More specific classifications may earn bonus points
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Channel Vector Multi-Select
 */
export function ChannelVectorSelect({ value = [], onChange, className = "" }) {
    const toggleChannel = (code) => {
        const newValue = value.includes(code)
            ? value.filter((c) => c !== code)
            : [...value, code];
        onChange?.(newValue);
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-400 mb-2">
                Attack Channels (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
                {CHANNEL_VECTORS.map((channel) => (
                    <button
                        key={channel.code}
                        type="button"
                        onClick={() => toggleChannel(channel.code)}
                        className={`px-3 py-1.5 rounded-full text-sm transition ${value.includes(channel.code)
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                    >
                        {channel.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/**
 * Answer Selection Component (Radio or Checkbox based on question type)
 */
export function AnswerSelect({
    answers,
    questionType = "single",
    selectedAnswers = [],
    onChange,
    disabled = false,
    showResults = false,
    correctAnswers = [],
}) {
    const isSingle = questionType === "single";

    const handleSelect = (answerId) => {
        if (disabled) return;

        if (isSingle) {
            onChange([answerId]);
        } else {
            const newSelection = selectedAnswers.includes(answerId)
                ? selectedAnswers.filter((id) => id !== answerId)
                : [...selectedAnswers, answerId];
            onChange(newSelection);
        }
    };

    const getAnswerStyle = (answer) => {
        const isSelected = selectedAnswers.includes(answer.id);
        const isCorrect = correctAnswers.some((ca) => ca.id === answer.id);

        if (!showResults) {
            return isSelected
                ? "bg-emerald-500/20 border-emerald-500 text-white"
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600";
        }

        // Show results mode
        if (isCorrect && isSelected) {
            return "bg-emerald-500/20 border-emerald-500 text-emerald-400";
        } else if (isCorrect && !isSelected) {
            return "bg-yellow-500/10 border-yellow-500/50 text-yellow-400";
        } else if (!isCorrect && isSelected) {
            return "bg-red-500/20 border-red-500 text-red-400";
        }
        return "bg-slate-800/30 border-slate-700/50 text-slate-500";
    };

    const getResultIcon = (answer) => {
        if (!showResults) return null;

        const isSelected = selectedAnswers.includes(answer.id);
        const isCorrect = correctAnswers.some((ca) => ca.id === answer.id);

        if (isCorrect && isSelected) return "✅";
        if (isCorrect && !isSelected) return "⚠️";
        if (!isCorrect && isSelected) return "❌";
        return null;
    };

    return (
        <div className="space-y-2">
            {answers.map((answer) => (
                <button
                    key={answer.id}
                    type="button"
                    onClick={() => handleSelect(answer.id)}
                    disabled={disabled}
                    className={`w-full p-4 rounded-lg border transition-all text-left flex items-center gap-3 ${getAnswerStyle(
                        answer
                    )} ${disabled ? "cursor-default" : "cursor-pointer"}`}
                >
                    {/* Selection indicator */}
                    <div
                        className={`w-5 h-5 rounded-${isSingle ? "full" : "md"
                            } border-2 flex items-center justify-center flex-shrink-0 ${selectedAnswers.includes(answer.id)
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-slate-600"
                            }`}
                    >
                        {selectedAnswers.includes(answer.id) && (
                            <span className="text-white text-xs">
                                {isSingle ? "●" : "✓"}
                            </span>
                        )}
                    </div>

                    {/* Answer label */}
                    <span className="flex-1">{answer.label}</span>

                    {/* Result icon */}
                    {showResults && (
                        <span className="text-lg">{getResultIcon(answer)}</span>
                    )}

                    {/* Weight indicator (only in results) */}
                    {showResults &&
                        correctAnswers.some((ca) => ca.id === answer.id) && (
                            <span className="text-xs text-slate-500">
                                {Math.round(
                                    (correctAnswers.find((ca) => ca.id === answer.id)?.weight ||
                                        0) * 100
                                )}
                                % credit
                            </span>
                        )}
                </button>
            ))}

            {!isSingle && !disabled && (
                <p className="text-xs text-slate-500 mt-2">
                    Select all that apply. Correct answers earn points, wrong selections
                    reduce score.
                </p>
            )}
        </div>
    );
}

// Export taxonomy data for use elsewhere
export { THREAT_TYPES, SUBTYPES, CHANNEL_VECTORS };

export default { ThreatTypeSelect, ChannelVectorSelect, AnswerSelect };

// src/components/ui/animated-ai-chat.tsx
"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Paperclip, // Used for attachment button
    SendIcon,  // Used for send button
    XIcon,     // Used for removing attachments
    LoaderIcon, // Used for typing indicator
    Sparkles,  // Used in commandSuggestions
    Command,   // Used in commandSuggestions
    Code,      // Used in commandSuggestions
    Shield,    // Used in commandSuggestions
    Zap,       // Used in commandSuggestions
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

// Interface for usage limits, as provided by the user
interface UsageLimits {
    messagesUsed: number;
    messagesLimit: number;
    linesPerMessage: number;
    canSendMessage: boolean;
    validateCodeLength: (code: string) => { valid: boolean; message?: string };
    incrementUsage: () => void;
}

// Props for the AnimatedAIChat component
interface AnimatedAIChatProps {
    usageLimits: UsageLimits;
    subscriptionStatus: 'free' | 'pro';
}

// Props for the useAutoResizeTextarea hook
interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

// Custom hook for auto-resizing textarea
function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`; // Reset height to recalculate scrollHeight
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY // Use maxHeight if provided, otherwise no upper limit
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight] // Dependencies for useCallback
    );

    // Set initial height on mount
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]); // Dependency for useEffect

    return { textareaRef, adjustHeight };
}

// Interface for command suggestions
interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

// Props for the custom Textarea component
interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    containerClassName?: string;
    showRing?: boolean;
}

// Custom Textarea component with focus ring animation
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div className={cn(
                "relative",
                containerClassName
            )}>
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                {/* This div seems to be for a visual ripple effect, but its animation is set to 'none' */}
                {props.onChange && (
                    <div
                        className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
                        style={{
                            animation: 'none', // Animation is explicitly turned off here
                        }}
                        id="textarea-ripple"
                    />
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

// Main AnimatedAIChat component
export function AnimatedAIChat({ usageLimits, subscriptionStatus }: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    // @ts-ignore TS6133: 'isPending' is declared but its value is never read.
    const [isPending, startTransition] = useTransition(); // 'isPending' is used in disabled prop of send button
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    // @ts-ignore TS6133: 'recentCommand' is declared but its value is never read.
    const [recentCommand, setRecentCommand] = useState<string | null>(null); // 'recentCommand' is used in setTimeout
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [validationError, setValidationError] = useState<string | null>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);

    // Define command suggestions for the AI chat
    const commandSuggestions: CommandSuggestion[] = [
        {
            icon: <Code className="w-4 h-4" />,
            label: "Review Code",
            description: "Get comprehensive code review",
            prefix: "/review"
        },
        {
            icon: <Shield className="w-4 h-4" />,
            label: "Security Check",
            description: "Focus on security vulnerabilities",
            prefix: "/security"
        },
        {
            icon: <Zap className="w-4 h-4" />,
            label: "Performance",
            description: "Analyze performance optimizations",
            prefix: "/performance"
        },
        {
            icon: <Sparkles className="w-4 h-4" />,
            label: "Best Practices",
            description: "Check coding best practices",
            prefix: "/practices"
        },
    ];

    // Effect to show/hide command palette based on input value
    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);

            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );

            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value, commandSuggestions]); // Added commandSuggestions to dependencies

    // Effect to track mouse position for background animation
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Effect to handle clicks outside the command palette
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');

            if (commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handler for keyboard events in the textarea
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);

                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    // Handler for sending messages (code review requests)
    const handleSendMessage = () => {
        if (!value.trim()) return;

        // Check usage limits
        if (!usageLimits.canSendMessage) {
            setValidationError(`Daily limit reached (${usageLimits.messagesUsed}/${usageLimits.messagesLimit}). ${subscriptionStatus === 'free' ? 'Upgrade to Pro for more messages.' : 'Try again tomorrow.'}`);
            return;
        }

        // Validate code length using the function from usageLimits prop
        const validation = usageLimits.validateCodeLength(value);
        if (!validation.valid) {
            setValidationError(validation.message || 'Code too long');
            return;
        }

        setValidationError(null);

        // Increment usage and send message
        usageLimits.incrementUsage(); // Call incrementUsage from the prop

        startTransition(() => {
            setIsTyping(true);

            // TODO: Send to appropriate AI model based on subscription
            const aiModel = subscriptionStatus === 'pro' ? 'gpt-o3-mini' : 'gpt-4o-mini';
            console.log(`Sending to ${aiModel}:`, value);

            // Simulate AI response (replace with actual API call to backend)
            setTimeout(() => {
                setIsTyping(false);
                setValue("");
                adjustHeight(true);
            }, 3000);
        });
    };

    // Handler for textarea input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        adjustHeight();

        // Clear validation error when user starts typing
        if (validationError) {
            setValidationError(null);
        }

        // Show line count warning
        const lines = newValue.split('\n').length;
        if (lines > usageLimits.linesPerMessage * 0.8) {
            const remaining = usageLimits.linesPerMessage - lines;
            if (remaining <= 0) {
                setValidationError(`Code exceeds ${usageLimits.linesPerMessage} line limit`);
            } else if (remaining <= 50) { // Warning threshold
                setValidationError(`${remaining} lines remaining`);
            }
        } else {
            // Clear warning if lines are well within limit again
            if (validationError && validationError.includes("lines remaining")) {
                setValidationError(null);
            }
        }
    };

    // Handler for attaching files (mock functionality)
    const handleAttachFile = () => {
        const mockFileName = `code-file-${Math.floor(Math.random() * 1000)}.js`;
        setAttachments(prev => [...prev, mockFileName]);
    };

    // Handler for removing attachments
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Handler for selecting a command suggestion
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);

        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="h-full flex flex-col w-full items-center justify-center bg-transparent text-white p-4 lg:p-6 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>
            <div className="w-full max-w-4xl mx-auto relative">
                <motion.div
                    className="relative z-10 space-y-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block"
                        >
                            <h1 className="text-2xl lg:text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                                How can I help review your code today?
                            </h1>
                            <motion.div
                                className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>
                        <motion.p
                            className="text-xs lg:text-sm text-white/40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Paste your code or use a command to get started
                        </motion.p>
                    </div>

                    <motion.div
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-xl lg:rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div
                                    ref={commandPaletteRef}
                                    className="absolute left-2 right-2 lg:left-4 lg:right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1 bg-black/95">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-2 px-2 lg:px-3 py-2 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index
                                                        ? "bg-white/10 text-white"
                                                        : "text-white/70 hover:bg-white/5"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center text-white/60">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="font-medium text-xs lg:text-sm">{suggestion.label}</div>
                                                <div className="text-white/40 text-xs ml-1 hidden lg:block">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-3 lg:p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder={`Paste your code here for review... (${subscriptionStatus === 'pro' ? usageLimits.linesPerMessage : usageLimits.linesPerMessage} lines max)`}
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-4 py-3",
                                    "text-sm lg:text-base",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white/90 text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-white/20",
                                    "min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div
                                    className="px-3 lg:px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <span>{file}</span>
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Validation Error */}
                        <AnimatePresence>
                            {validationError && (
                                <motion.div
                                    className="px-4 pb-3"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                        {validationError}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-3 lg:p-4 border-t border-white/[0.05] flex items-center justify-between gap-2 lg:gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    onClick={handleAttachFile}
                                    whileTap={{ scale: 0.94 }}
                                    className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
                                        showCommandPalette && "bg-white/10 text-white/90"
                                    )}
                                >
                                    <Command className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                            </div>

                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim() || !usageLimits.canSendMessage || !!validationError}
                                className={cn(
                                    "px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim() && usageLimits.canSendMessage && !validationError
                                        ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                        : "bg-white/[0.05] text-white/40"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span className="hidden lg:inline">Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="flex flex-wrap items-center justify-center gap-1 lg:gap-2">
                        {commandSuggestions.map((suggestion, index) => (
                            <motion.button
                                key={suggestion.prefix}
                                onClick={() => selectCommandSuggestion(index)}
                                disabled={!usageLimits.canSendMessage}
                                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-xs lg:text-sm text-white/60 hover:text-white/90 transition-all relative group"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {suggestion.icon}
                                <span className="hidden sm:inline">{suggestion.label}</span>
                                <motion.div
                                    className="absolute inset-0 border border-white/[0.05] rounded-lg"
                                    initial={false}
                                    animate={{
                                        opacity: [0, 1],
                                        scale: [0.98, 1],
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                    }}
                                />
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isTyping && (
                    <motion.div
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-center">
                                <span className="text-xs font-medium text-white/90 mb-0.5">AI</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <span>Analyzing code with {subscriptionStatus === 'pro' ? 'GPT-o3 Mini' : 'GPT-4o Mini'}</span>
                                <TypingDots />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {inputFocused && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}

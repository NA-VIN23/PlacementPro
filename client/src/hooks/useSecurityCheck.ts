import { useState, useEffect } from 'react';

export const useSecurityCheck = () => {
    const [isSecure, setIsSecure] = useState<boolean | null>(null);
    const [securityIssues, setSecurityIssues] = useState<string[]>([]);

    useEffect(() => {
        const checkSecurity = () => {
            const issues: string[] = [];

            // 1. Check for CSS Injection (User-Select Override)
            const testElement = document.createElement('div');
            testElement.style.userSelect = 'none';
            testElement.style.position = 'absolute'; // Ensure it's part of layout but hidden/out of way
            testElement.style.opacity = '0';
            testElement.style.pointerEvents = 'none';
            testElement.id = 'security-check-target';
            document.body.appendChild(testElement);

            // Small delay to allow extensions to apply their styles
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(testElement);
                // Extensions that enable copy/paste often force 'user-select: text' or 'auto' via !important
                if (computedStyle.userSelect !== 'none' && computedStyle.webkitUserSelect !== 'none') {
                    issues.push('System detected an extension modifying page content. Please disable "Allow Copy" or "Always on Display" extensions.');
                }

                document.body.removeChild(testElement);

                // 2. Check for "Right Click" override extensions
                // Harder to detect statically, but we can check if oncontextmenu is nullified on document (rare)
                // or just rely on the CSS check which is the most common vector for "Allow Copy" tools.

                setSecurityIssues(issues);
                setIsSecure(issues.length === 0);
            }, 500);
        };

        checkSecurity();

        // Optional: Re-check periodically?
        // const interval = setInterval(checkSecurity, 5000);
        // return () => clearInterval(interval);

    }, []);

    return { isSecure, securityIssues };
};

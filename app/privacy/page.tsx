import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy | RankBoast",
    description: "Read RankBoast's Privacy Policy — how we collect, use, and protect your data.",
};

const LAST_UPDATED = "10 March 2026";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-3xl mx-auto px-6 py-16">

                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
                </div>

                <div className="prose prose-sm sm:prose dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">1. Introduction</h2>
                        <p>RankBoast AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at rankboast.ai.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong className="text-foreground">Account data:</strong> Name, email address, and hashed password when you register.</li>
                            <li><strong className="text-foreground">Usage data:</strong> URLs you audit, competitor URLs you analyse, and content generation inputs.</li>
                            <li><strong className="text-foreground">Results data:</strong> SEO audit results, competitor analysis metrics, and AI-generated content — stored to power your analytics dashboard.</li>
                            <li><strong className="text-foreground">Session data:</strong> Authentication tokens and session identifiers for security.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To provide and improve the RankBoast platform.</li>
                            <li>To display your audit history and analytics in your dashboard.</li>
                            <li>To send transactional emails (password resets, account notifications).</li>
                            <li>To detect and prevent fraud or abuse.</li>
                        </ul>
                        <p className="mt-3">We do <strong className="text-foreground">not</strong> sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">4. Third-Party Services</h2>
                        <p>We use the following third-party services to operate RankBoast:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong className="text-foreground">Neon (PostgreSQL):</strong> Encrypted database hosting for your data.</li>
                            <li><strong className="text-foreground">OpenRouter:</strong> AI model inference for SEO analysis and content generation. URLs you submit are sent to AI models for analysis.</li>
                            <li><strong className="text-foreground">Google OAuth:</strong> If you choose to sign in with Google, your name and email are shared with us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">5. Cookies</h2>
                        <p>We use essential cookies only — primarily for session authentication via NextAuth.js. We do not use tracking or advertising cookies.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">6. Data Retention</h2>
                        <p>Your data is retained for as long as your account is active. If you delete your account, your data is permanently deleted within 30 days. Password reset tokens expire after 1 hour.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">7. Your Rights</h2>
                        <p>Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data. To exercise any of these rights, contact us at <Link href="/contact" className="text-indigo-400 hover:underline">our contact page</Link>.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">8. Security</h2>
                        <p>We implement industry-standard security measures including HTTPS encryption, bcrypt password hashing, secure HTTP headers (HSTS, CSP, X-Frame-Options), and server-side session validation on all protected routes.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">9. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date above.</p>
                    </section>

                    <section>
                        <h2 className="text-foreground font-bold text-lg mb-2">10. Contact</h2>
                        <p>For privacy-related questions, please <Link href="/contact" className="text-indigo-400 hover:underline">contact us</Link>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

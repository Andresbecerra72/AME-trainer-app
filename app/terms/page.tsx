import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | AME Exam Trainer",
  description: "Terms of Service for AME Exam Trainer - Rules and guidelines for using our service",
}

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

        <section className="mb-8">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using AME Exam Trainer ("the Service"), you accept and agree to be 
            bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not 
            use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2>2. Description of Service</h2>
          <p>AME Exam Trainer provides:</p>
          <ul>
            <li>Practice questions for Aircraft Maintenance Engineer certification</li>
            <li>Exam simulation tools</li>
            <li>Progress tracking and analytics</li>
            <li>Community features (comments, votes, collections)</li>
            <li>Study resources and materials</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>3. User Accounts</h2>
          
          <h3>3.1 Registration</h3>
          <ul>
            <li>You must be at least 13 years old to use the Service</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must not share your account credentials</li>
          </ul>

          <h3>3.2 Account Types</h3>
          <ul>
            <li><strong>User:</strong> Basic access to practice and exams</li>
            <li><strong>Admin:</strong> Moderation capabilities</li>
            <li><strong>Super Admin:</strong> Full administrative access</li>
          </ul>

          <h3>3.3 Account Termination</h3>
          <p>We reserve the right to suspend or terminate accounts that:</p>
          <ul>
            <li>Violate these Terms</li>
            <li>Engage in fraudulent activity</li>
            <li>Abuse the platform</li>
            <li>Post inappropriate content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>4. User Conduct</h2>
          
          <h3>4.1 Prohibited Activities</h3>
          <p>You agree NOT to:</p>
          <ul>
            <li>Submit false or misleading questions</li>
            <li>Share copyrighted content without permission</li>
            <li>Harass, bully, or threaten other users</li>
            <li>Spam or send unsolicited messages</li>
            <li>Attempt to hack or compromise the Service</li>
            <li>Use the Service for illegal purposes</li>
            <li>Create multiple accounts to manipulate votes or ratings</li>
            <li>Share exam answers or engage in cheating</li>
          </ul>

          <h3>4.2 Content Guidelines</h3>
          <p>When submitting questions, comments, or other content:</p>
          <ul>
            <li>Ensure accuracy and relevance</li>
            <li>Use appropriate language</li>
            <li>Respect intellectual property rights</li>
            <li>Cite sources when applicable</li>
            <li>Follow aviation industry standards</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>5. Intellectual Property</h2>
          
          <h3>5.1 Our Content</h3>
          <ul>
            <li>The Service, including design, code, and original content, is owned by AME Exam Trainer</li>
            <li>You may not copy, modify, or distribute our content without permission</li>
            <li>Trademarks and logos are protected</li>
          </ul>

          <h3>5.2 User Content</h3>
          <ul>
            <li>You retain ownership of content you create</li>
            <li>By posting content, you grant us a worldwide, non-exclusive license to use, display, and distribute it</li>
            <li>You represent that you have the right to post the content</li>
            <li>We may remove content that violates these Terms</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>6. Questions and Exam Content</h2>
          
          <h3>6.1 Question Accuracy</h3>
          <ul>
            <li>We strive for accuracy but cannot guarantee 100% correctness</li>
            <li>Questions are reviewed by moderators</li>
            <li>Users can report inaccuracies</li>
            <li>Questions are updated based on feedback</li>
          </ul>

          <h3>6.2 Exam Simulation</h3>
          <ul>
            <li>Exams are for practice purposes only</li>
            <li>They do not replace official certification exams</li>
            <li>Performance does not guarantee certification success</li>
          </ul>

          <h3>6.3 Community Contributions</h3>
          <ul>
            <li>Users can submit questions for review</li>
            <li>Submitted questions must be original or properly cited</li>
            <li>Questions may be edited for clarity</li>
            <li>Questions may be rejected if inappropriate</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>7. Privacy and Data</h2>
          <p>
            Your use of the Service is governed by our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            . We collect and use data as described in the Privacy Policy. You consent to data 
            collection and use by using the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2>8. Subscriptions and Payments</h2>
          
          <h3>8.1 Free Service</h3>
          <p>Currently, the Service is free to use. We may introduce paid features in the future.</p>

          <h3>8.2 Future Paid Features</h3>
          <p>If paid features are introduced:</p>
          <ul>
            <li>Pricing will be clearly displayed</li>
            <li>Payments are processed securely</li>
            <li>Refunds subject to our refund policy</li>
            <li>Subscriptions auto-renew unless cancelled</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>9. Disclaimers</h2>
          
          <h3>9.1 "As Is" Service</h3>
          <ul>
            <li>The Service is provided "as is" without warranties</li>
            <li>We do not guarantee uninterrupted or error-free service</li>
            <li>We are not liable for data loss or service interruptions</li>
          </ul>

          <h3>9.2 Educational Purpose</h3>
          <ul>
            <li>This Service is for educational purposes only</li>
            <li>It does not replace official training or certification programs</li>
            <li>Consult official AME certification bodies for authoritative information</li>
          </ul>

          <h3>9.3 Third-Party Links</h3>
          <ul>
            <li>The Service may contain links to third-party websites</li>
            <li>We are not responsible for third-party content or services</li>
            <li>Use third-party services at your own risk</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>10. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability is limited to the amount you paid us (if any) in the past 12 months</li>
            <li>We are not liable for user-generated content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>11. Changes to Terms</h2>
          <p>We may modify these Terms at any time:</p>
          <ul>
            <li>Changes will be posted on this page</li>
            <li>"Last updated" date will be updated</li>
            <li>Continued use constitutes acceptance of new Terms</li>
            <li>We may notify you of significant changes via email</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>12. Termination</h2>
          
          <h3>12.1 By You</h3>
          <p>
            You may delete your account at any time. Contact{" "}
            <a href="mailto:support@ameexamtrainer.com" className="text-primary hover:underline">
              support@ameexamtrainer.com
            </a>{" "}
            to request deletion.
          </p>

          <h3>12.2 By Us</h3>
          <p>We may terminate your account if:</p>
          <ul>
            <li>You violate these Terms</li>
            <li>You engage in fraudulent activity</li>
            <li>Required by law</li>
            <li>The Service is discontinued</li>
          </ul>

          <h3>12.3 Effect of Termination</h3>
          <ul>
            <li>Your access will be revoked immediately</li>
            <li>Your data will be deleted per our Privacy Policy</li>
            <li>Certain provisions survive termination (e.g., liability limitations)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>13. Contact Information</h2>
          <p>For questions about these Terms:</p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@ameexamtrainer.com" className="text-primary hover:underline">
              support@ameexamtrainer.com
            </a>
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href="/" className="text-primary hover:underline">
              AME Exam Trainer
            </a>
          </p>
        </section>

        <section className="mb-8 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Quick Summary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            (Not legally binding - the full Terms above are the legally binding document)
          </p>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">✅ What you can do:</p>
              <ul className="text-sm mt-2">
                <li>Use the app to study for AME exams</li>
                <li>Submit questions and participate in the community</li>
                <li>Track your progress and take practice exams</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">❌ What you can&apos;t do:</p>
              <ul className="text-sm mt-2">
                <li>Post false or copyrighted content</li>
                <li>Harass other users</li>
                <li>Hack or abuse the platform</li>
                <li>Use the app for cheating</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-blue-600 dark:text-blue-400">🔒 Our commitments:</p>
              <ul className="text-sm mt-2">
                <li>Protect your privacy (see Privacy Policy)</li>
                <li>Provide a quality study tool</li>
                <li>Moderate content fairly</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">⚖️ Important notes:</p>
              <ul className="text-sm mt-2">
                <li>We&apos;re not liable if something goes wrong</li>
                <li>You&apos;re responsible for your account</li>
                <li>We can change these Terms with notice</li>
                <li>This is not a replacement for official AME training</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-muted-foreground">
          <p>
            These Terms of Service comply with Google Play Store requirements and industry standards.
          </p>
        </footer>
      </article>
    </div>
  )
}

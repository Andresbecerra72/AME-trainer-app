import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | AME Exam Trainer",
  description: "Privacy Policy for AME Exam Trainer - How we collect, use, and protect your data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

        <section className="mb-8">
          <h2>Introduction</h2>
          <p>
            AME Exam Trainer ("we", "our", or "us") operates the AME Exam Trainer mobile application 
            and website (the "Service"). This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>When you register for an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Full name</li>
            <li>Password (encrypted)</li>
            <li>Profile information (optional)</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>App activity and usage patterns</li>
            <li>Practice session data</li>
            <li>Exam scores and performance metrics</li>
            <li>Topics studied</li>
            <li>Questions answered</li>
            <li>Time spent in app</li>
          </ul>

          <h3>Device Information</h3>
          <ul>
            <li>Device type and model</li>
            <li>Operating system version</li>
            <li>Unique device identifiers</li>
            <li>Browser type and version</li>
            <li>IP address</li>
          </ul>

          <h3>Content You Generate</h3>
          <ul>
            <li>Comments on questions</li>
            <li>Questions you submit</li>
            <li>Reports you file</li>
            <li>Bookmarked questions</li>
            <li>Collections you create</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Create and manage your account</li>
            <li>Track your learning progress</li>
            <li>Generate performance analytics</li>
            <li>Improve the app experience</li>
            <li>Send notifications about your activity</li>
            <li>Respond to your requests and support needs</li>
            <li>Prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Data Storage and Security</h2>
          <ul>
            <li>All data is stored securely using Supabase (PostgreSQL)</li>
            <li>Passwords are encrypted using industry-standard hashing</li>
            <li>Data is transmitted over HTTPS</li>
            <li>We implement role-based access controls</li>
            <li>Regular security audits are performed</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Data Sharing</h2>
          <p className="font-semibold">We DO NOT sell your personal information.</p>
          <p>We may share your data with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Supabase for database hosting, Vercel for hosting</li>
            <li><strong>Analytics:</strong> Anonymized usage data for app improvement</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of notifications</li>
            <li>Withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, contact us at:{" "}
            <a href="mailto:support@ameexamtrainer.com" className="text-primary hover:underline">
              support@ameexamtrainer.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2>Data Retention</h2>
          <ul>
            <li><strong>Account data:</strong> Retained while your account is active</li>
            <li><strong>Usage data:</strong> Retained for 2 years for analytics</li>
            <li><strong>Deleted account data:</strong> Permanently deleted within 30 days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Cookies and Tracking</h2>
          <p>We use:</p>
          <ul>
            <li>Essential cookies for authentication</li>
            <li>Analytics cookies to understand usage (can be disabled)</li>
            <li>Local storage for offline functionality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for users under 13 years of age. We do not knowingly 
            collect information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of changes by:</p>
          <ul>
            <li>Posting the new policy on this page</li>
            <li>Updating the "Last updated" date</li>
            <li>Sending an email notification (for significant changes)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Supabase:</strong> Database and authentication (
              <a 
                href="https://supabase.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>Vercel:</strong> Web hosting (
              <a 
                href="https://vercel.com/legal/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
              )
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>California Privacy Rights (CCPA)</h2>
          <p>If you are a California resident, you have additional rights:</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we don&apos;t sell data)</li>
            <li>Right to non-discrimination for exercising your rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>European Privacy Rights (GDPR)</h2>
          <p>If you are in the European Economic Area (EEA), you have rights under GDPR:</p>
          <ul>
            <li>Right to access your data</li>
            <li>Right to rectification</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object</li>
            <li>Rights related to automated decision-making</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy:</p>
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

        <section className="mb-8">
          <h2>Consent</h2>
          <p>
            By using our Service, you consent to our Privacy Policy and agree to its terms.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-muted-foreground">
          <p>
            This privacy policy is compliant with Google Play Store requirements and international 
            privacy laws.
          </p>
        </footer>
      </article>
    </div>
  )
}

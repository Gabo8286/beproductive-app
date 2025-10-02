import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Accessibility Statement Page
 * Public declaration of BeProductive's commitment to accessibility
 * Includes compliance status, features, and contact information
 */
export default function AccessibilityStatement() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold">Accessibility Statement</h1>
          <p className="text-lg text-muted-foreground">
            Our commitment to making BeProductive accessible to everyone
          </p>
        </div>

        <Separator />

        {/* Commitment Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              BeProductive is committed to ensuring digital accessibility for people with disabilities.
              We are continually improving the user experience for everyone and applying the relevant
              accessibility standards to ensure our platform is accessible to all users.
            </p>
            <p>
              We believe that everyone should have the same opportunities to manage their productivity,
              achieve their goals, and track their progress, regardless of their abilities or the
              technologies they use.
            </p>
          </CardContent>
        </Card>

        {/* Conformance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Conformance Status</CardTitle>
            <CardDescription>
              Our current level of accessibility compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">WCAG 2.1</Badge>
              <div className="flex-1">
                <p className="font-semibold">Web Content Accessibility Guidelines 2.1</p>
                <p className="text-sm text-muted-foreground mt-1">
                  BeProductive is <strong>partially conformant</strong> with WCAG 2.1 Level AA.
                  "Partially conformant" means that some parts of the content do not fully conform
                  to the accessibility standard.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">What This Means:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Most features meet WCAG 2.1 Level AA standards</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Core functionality is fully accessible via keyboard and screen readers</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Color contrast meets or exceeds minimum requirements</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span>Some advanced features are still being improved for full compliance</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
            <CardDescription>
              Built-in features to enhance your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Keyboard Navigation
                </h4>
                <p className="text-sm text-muted-foreground">
                  All features accessible via keyboard shortcuts and tab navigation
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Screen Reader Support
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compatible with NVDA, JAWS, VoiceOver, and TalkBack
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  High Contrast Mode
                </h4>
                <p className="text-sm text-muted-foreground">
                  Enhanced visibility with adjustable contrast settings
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Reduced Motion
                </h4>
                <p className="text-sm text-muted-foreground">
                  Option to minimize animations and transitions
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Adjustable Font Size
                </h4>
                <p className="text-sm text-muted-foreground">
                  Customize text size from 12px to 24px
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Skip Navigation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Quick links to bypass repetitive content
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button asChild variant="outline">
                <a href="/settings/accessibility">
                  <span>Customize Accessibility Settings</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assistive Technologies */}
        <Card>
          <CardHeader>
            <CardTitle>Compatible Assistive Technologies</CardTitle>
            <CardDescription>
              BeProductive works with the following assistive technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">NVDA (Windows)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">JAWS (Windows)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">VoiceOver (macOS/iOS)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">TalkBack (Android)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">Dragon NaturallySpeaking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">ZoomText</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accessibility Standards:</span>
              <span className="font-medium">WCAG 2.1 Level AA</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technologies Used:</span>
              <span className="font-medium">HTML5, ARIA, React</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Testing Tools:</span>
              <span className="font-medium">axe DevTools, WAVE, Lighthouse</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Reviewed:</span>
              <span className="font-medium">January 2025</span>
            </div>
          </CardContent>
        </Card>

        {/* Feedback & Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Feedback & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We welcome your feedback on the accessibility of BeProductive. If you encounter any
              accessibility barriers or have suggestions for improvement, please let us know:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Email Us</p>
                  <a 
                    href="mailto:accessibility@beproductive.com" 
                    className="text-sm text-primary hover:underline"
                  >
                    accessibility@beproductive.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Response Time</p>
                  <p className="text-sm text-muted-foreground">
                    We aim to respond to accessibility inquiries within 2 business days
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Your feedback helps us improve accessibility for all users. We take all reports
              seriously and will work to address any issues as quickly as possible.
            </p>
          </CardContent>
        </Card>

        {/* Legal & Updates */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This accessibility statement was last updated on <strong>January 2025</strong> and
              will be reviewed quarterly. We are committed to continuous improvement and will update
              this statement as we make progress toward full WCAG 2.1 Level AAA compliance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

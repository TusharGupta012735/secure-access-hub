import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Radio,
  Shield,
  Users,
  Calendar,
  Zap,
  BarChart3,
  Clock,
  CreditCard,
  Settings,
  Database,
  FileText,
  Bell,
  Smartphone,
  Globe,
  Server,
  Lock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const featureCategories = [
  {
    title: "Event Configuration",
    description: "Flexible event and zone management",
    features: [
      { icon: Calendar, title: "Multi-Event Support", description: "Run multiple events simultaneously with separate configurations" },
      { icon: Settings, title: "Zone Management", description: "Create unlimited zones with custom access rules and schedules" },
      { icon: Users, title: "Participant Categories", description: "Define VIP, staff, attendee, and custom participant types" },
      { icon: Clock, title: "Time-Based Access", description: "Set access windows and automatic schedule changes" },
    ],
  },
  {
    title: "RFID Card Lifecycle",
    description: "Complete card management from issuance to deactivation",
    features: [
      { icon: CreditCard, title: "Card Issuance", description: "Bulk import or individual card registration with instant activation" },
      { icon: Database, title: "Card Database", description: "Centralized card management with search and filtering" },
      { icon: Shield, title: "Lost Card Handling", description: "Instant deactivation and replacement card issuance" },
      { icon: FileText, title: "Card History", description: "Complete audit trail of card activities and status changes" },
    ],
  },
  {
    title: "Access Control & Attendance",
    description: "Real-time tracking and security",
    features: [
      { icon: Radio, title: "RFID Scanning", description: "Support for all major RFID standards and readers" },
      { icon: Users, title: "Attendance Tracking", description: "Automatic check-in/out with timestamp recording" },
      { icon: Lock, title: "Zone Restrictions", description: "Prevent unauthorized access with instant alerts" },
      { icon: Bell, title: "Real-time Alerts", description: "Immediate notifications for security events" },
    ],
  },
  {
    title: "Offline & Sync",
    description: "Reliable operation anywhere",
    features: [
      { icon: Zap, title: "Offline Mode", description: "Full functionality without internet connection" },
      { icon: Server, title: "Auto Sync", description: "Automatic data synchronization when connection restores" },
      { icon: Database, title: "Local Storage", description: "Secure local data storage with encryption" },
      { icon: Globe, title: "Multi-Location", description: "Sync across multiple gates and locations" },
    ],
  },
  {
    title: "Dashboards & Reports",
    description: "Actionable insights at a glance",
    features: [
      { icon: BarChart3, title: "Real-time Dashboard", description: "Live occupancy, entry rates, and movement patterns" },
      { icon: FileText, title: "Custom Reports", description: "Generate reports for attendance, access logs, and more" },
      { icon: Smartphone, title: "Mobile Access", description: "View dashboards and reports on any device" },
      { icon: Bell, title: "Scheduled Reports", description: "Automatic report generation and email delivery" },
    ],
  },
];

const additionalFeatures = [
  "Multi-language support",
  "Custom branding",
  "API access",
  "SSO integration",
  "Custom fields",
  "Bulk operations",
  "Export to Excel/CSV",
  "Webhook notifications",
  "Role-based permissions",
  "Two-factor authentication",
  "Data retention policies",
  "GDPR compliance tools",
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful Features for
              <span className="text-primary"> Complete Control</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to manage access, track attendance, and secure your premises
              with enterprise-grade reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/#contact">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={`py-16 lg:py-24 ${categoryIndex % 2 === 1 ? "bg-muted/50" : ""}`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{category.title}</h2>
              <p className="text-lg text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.features.map((feature, index) => (
                <Card
                  key={feature.title}
                  variant="feature"
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="gradient-primary p-3 rounded-lg w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Features */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">And Much More</h2>
            <p className="text-lg text-muted-foreground">
              Additional features to support your unique requirements
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {additionalFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Access Management?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Get started with a personalized demo and see how RFIDAccess can work for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="bg-background text-foreground hover:bg-background/90" asChild>
                <Link to="/#contact">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/dashboard">Explore Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;

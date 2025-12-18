import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/sections/ContactForm";
import {
  Radio,
  Shield,
  Users,
  Calendar,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Building2,
  GraduationCap,
  Tent,
  LandPlot,
  Lock,
  Server,
  Wifi,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "RFID Card Management",
    description: "Complete lifecycle management from issuance to deactivation with real-time tracking.",
  },
  {
    icon: Shield,
    title: "Access Control",
    description: "Zone-based permissions and multi-level security for sensitive areas.",
  },
  {
    icon: Users,
    title: "Attendance Tracking",
    description: "Automated check-in/out with detailed time and attendance reports.",
  },
  {
    icon: Zap,
    title: "Offline Mode",
    description: "Continue operations without internet. Auto-sync when connection restores.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Live dashboards with insights on occupancy, flow, and patterns.",
  },
  {
    icon: Clock,
    title: "Event Scheduling",
    description: "Configure events, zones, and access windows with flexible scheduling.",
  },
];

const useCases = [
  {
    icon: Calendar,
    title: "Large Events & Conferences",
    description: "Manage thousands of attendees with seamless check-in and zone access control.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Building2,
    title: "Corporate Institutions",
    description: "Secure building access, time tracking, and visitor management for enterprises.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: GraduationCap,
    title: "Educational Institutions",
    description: "Student attendance, campus security, and library access in one system.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Tent,
    title: "Camps & Retreats",
    description: "Track participants across multiple areas with meal and activity management.",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
  },
];

const securityFeatures = [
  { icon: Lock, title: "End-to-End Encryption", description: "All data encrypted in transit and at rest" },
  { icon: Server, title: "99.9% Uptime SLA", description: "Enterprise-grade reliability guarantee" },
  { icon: Wifi, title: "Offline Resilient", description: "Works without internet connectivity" },
  { icon: Globe, title: "Global Compliance", description: "GDPR, SOC2, and ISO 27001 compliant" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-primary-foreground/90">Trusted by 500+ organizations worldwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-slide-in-up">
              Enterprise RFID
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Attendance & Access
              </span>
              Management System
            </h1>

            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
              Secure, scalable, and reliable access control for events, institutions,
              and large-scale operations. Real-time tracking with offline capability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/#contact">
                  Request Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">500+</div>
                <div className="text-sm text-primary-foreground/70">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">10M+</div>
                <div className="text-sm text-primary-foreground/70">Cards Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">99.9%</div>
                <div className="text-sm text-primary-foreground/70">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32" id="features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for
              <span className="text-primary"> Access Management</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools to manage access, track attendance, and secure your premises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
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
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="default" size="lg" asChild>
              <Link to="/features">
                View All Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for <span className="text-primary">Every Industry</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible solutions designed to meet the unique needs of different sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card
                key={useCase.title}
                variant="elevated"
                className="overflow-hidden animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={useCase.image}
                    alt={useCase.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
                <CardHeader className="relative -mt-16 z-10">
                  <div className="gradient-accent p-3 rounded-lg w-fit mb-2">
                    <useCase.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{useCase.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Enterprise-Grade
                <span className="text-primary"> Security & Reliability</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your data security is our top priority. Our system is built with
                industry-leading security practices and compliance certifications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {securityFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-success/10 text-success">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="gradient-hero rounded-2xl p-8 lg:p-12">
                <div className="space-y-6">
                  {[
                    "Multi-factor authentication support",
                    "Role-based access control (RBAC)",
                    "Audit logs for all activities",
                    "Automatic backups every hour",
                    "Disaster recovery ready",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-primary-foreground animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-32 bg-muted/50" id="contact">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Contact us for a personalized demo and see how RFIDAccess can
                transform your access management.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="gradient-primary p-3 rounded-lg">
                    <LandPlot className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Free Consultation</h4>
                    <p className="text-sm text-muted-foreground">
                      Get expert advice tailored to your needs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="gradient-primary p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">24/7 Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Round-the-clock assistance when you need it
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="gradient-primary p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Quick Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      Get up and running in less than a week
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 gradient-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Target className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SalesCRM
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Streamline your sales process, manage leads efficiently, and convert opportunities into revenue with our professional CRM platform.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <Card className="shadow-card gradient-card border-0">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mx-auto" />
                <CardTitle className="text-center">Lead Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Capture, track, and nurture leads through your sales pipeline with ease.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card gradient-card border-0">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mx-auto" />
                <CardTitle className="text-center">Opportunity Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Convert qualified leads into opportunities and track them to closure.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card gradient-card border-0">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mx-auto" />
                <CardTitle className="text-center">Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get insights into your sales performance with detailed analytics and reports.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="space-y-4 pt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/dashboard">
                  View Demo
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Start managing your leads today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

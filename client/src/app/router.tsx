import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { Spinner } from "@/components/ui/spinner";

const Home = lazy(() => import("@/pages/Home"));
const Search = lazy(() => import("@/pages/Search"));
const ItemDetail = lazy(() => import("@/pages/ItemDetail"));
const BookingConfirmation = lazy(() => import("@/pages/BookingConfirmation"));
const CreateListing = lazy(() => import("@/pages/CreateListing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const FavoritesPage = lazy(() => import("@/pages/Favorites"));
const CreditBalancePage = lazy(() => import("@/pages/CreditBalance"));
const BookingsPage = lazy(() => import("@/pages/BookingsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const CheckoutSuccessPage = lazy(() => import("@/pages/checkout/CheckoutSuccessPage"));
const DisputesPage = lazy(() => import("@/pages/DisputesPage"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminDisputesPage = lazy(() => import("@/pages/AdminDisputesPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const GuaranteePage = lazy(() => import("@/pages/GuaranteePage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const PartnershipsPage = lazy(() => import("@/pages/PartnershipsPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const AreaPage = lazy(() => import("@/pages/AreaPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const AreasPage = lazy(() => import("@/pages/AreasPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/items/:id" component={ItemDetail} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/checkout/success" component={CheckoutSuccessPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/bookings">
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/bookings/:id/confirmation">
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        </Route>
        <Route path="/listings/new">
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/profile/edit">
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        </Route>
        <Route path="/favorites">
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/credit-balance">
          <ProtectedRoute>
            <CreditBalancePage />
          </ProtectedRoute>
        </Route>
        <Route path="/disputes">
          <ProtectedRoute>
            <DisputesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/disputes">
          <ProtectedRoute>
            <AdminDisputesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/about" component={AboutPage} />
        <Route path="/guarantee" component={GuaranteePage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/partnerships" component={PartnershipsPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/areas" component={AreasPage} />
        <Route path="/areas/london" component={() => <AreaPage city="London" />} />
        <Route path="/areas/manchester" component={() => <AreaPage city="Manchester" />} />
        <Route path="/areas/birmingham" component={() => <AreaPage city="Birmingham" />} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route component={NotFound} />

      </Switch>
    </Suspense>
  );
}

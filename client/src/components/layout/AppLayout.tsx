import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { useLocation } from "wouter";

export function AppLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="container h-16 flex items-center justify-between gap-4">
          <button type="button" className="flex items-center gap-3" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-xl bg-primary text-white font-bold flex items-center justify-center">R</div>
            <div className="text-left">
              <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                RentConnect
              </p>
              <p className="text-xs text-muted-foreground">Peer-to-peer rentals</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/search")}>
              Explore
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" onClick={() => navigate("/listings/new")}>
                  List item
                </Button>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  {user?.name ?? "Profile"}
                </Button>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <section className="container py-10">
          {title && (
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h1>
          )}
          {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
        </section>
      )}

      <main className="container pb-12">{children}</main>
    </div>
  );
}

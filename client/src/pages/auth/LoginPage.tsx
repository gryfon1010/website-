import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "renter@rentconnect.dev", password: "password123" });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success("Logged in.");
      const params = new URLSearchParams(window.location.search);
      navigate(params.get("redirect") ?? "/dashboard");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to login."),
  });

  return (
    <AppLayout title="Login" subtitle="Demo user: renter@rentconnect.dev / password123">
      <Card className="max-w-md mx-auto p-6 space-y-4">
        <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
        <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" />
        <Button className="w-full" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Login"}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/signup")}>
          Create an account
        </Button>
      </Card>
    </AppLayout>
  );
}

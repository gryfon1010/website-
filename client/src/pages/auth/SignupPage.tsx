import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Account created.");
      navigate("/dashboard");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create account."),
  });

  return (
    <AppLayout title="Create account" subtitle="New accounts are persisted through the backend auth API.">
      <Card className="max-w-md mx-auto p-6 space-y-4">
        <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
        <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
        <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" />
        <Button className="w-full" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Sign up"}
        </Button>
      </Card>
    </AppLayout>
  );
}

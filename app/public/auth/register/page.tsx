import { AuthForm } from "@/features/auth/components/AuthForm";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        </CardHeader>

        <CardContent>
          <AuthForm type="register" />
        </CardContent>
      </Card>
    </div>
  );
}

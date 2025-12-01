import { AuthForm } from "@/features/auth/components/AuthForm";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        </CardHeader>

        <CardContent>
          <AuthForm type="login" />
        </CardContent>
      </Card>
    </div>
  );
}

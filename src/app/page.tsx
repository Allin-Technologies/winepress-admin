import { redirect } from "next/navigation";
import { auth } from "../../auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/sign-in");
  }

  redirect("/dashboard");

  return <div>Redirecting...</div>;
}

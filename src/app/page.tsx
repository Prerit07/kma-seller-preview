import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function SellerHome() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    redirect("/user-dashboard");
  } else {
    redirect("/user-flow?isLogin=true");
  }
}

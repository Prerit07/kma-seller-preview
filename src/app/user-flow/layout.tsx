import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "User Flow | KMA Property",
};

interface UserFlowLayoutProps {
  children: ReactNode;
}

export default function UserFlowLayout({ children }: UserFlowLayoutProps) {
  return <>{children}</>;
}

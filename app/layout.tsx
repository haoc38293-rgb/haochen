import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "语境 · 在故事里记住单词",
  description: "通过真实语境和短故事，自然理解并记住英语单词。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

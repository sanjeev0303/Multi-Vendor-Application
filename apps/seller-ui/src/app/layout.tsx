import Provider from '../provider/query-provider';
import './global.css';
import { Poppins } from "next/font/google"


export const metadata = {
    title: "Seller's Interface",
    description: "Interface for the sellers",
    icons: "/seller-icon.webp",
  };

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-poppins"
})



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
      className={`${poppins.variable} antialiased min-h-screen bg-slate-900 font-sans`}
      >
       <Provider>
       {children}
       </Provider>
        </body>
    </html>
  );
}

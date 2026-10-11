import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Discover } from "@/components/site/discover";
import { How } from "@/components/site/how";
import { Growth } from "@/components/site/growth";
import { Empathy } from "@/components/site/empathy";
import { CampaignForm } from "@/components/site/campaign-form";
import { CreatorJoin } from "@/components/site/creator-join";
import { Faq } from "@/components/site/faq";
import { Finale } from "@/components/site/finale";
import { Footer } from "@/components/site/footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { SelectionProvider } from "@/components/site/selection-context";

export default function Home() {
  return (
    <SelectionProvider>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Discover />
        <How />
        <Growth />
        <Empathy />
        <CampaignForm />
        <CreatorJoin />
        <Faq />
        <Finale />
      </main>
      <Footer />
      <MobileCta />
    </SelectionProvider>
  );
}

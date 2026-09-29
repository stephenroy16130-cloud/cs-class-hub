import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import AnnouncementsPreview from "@/components/AnnouncementsPreview";
import ClassesPreview from "@/components/ClassesPreview";
import QuickLinks from "@/components/QuickLinks";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <AnnouncementsPreview />
      <ClassesPreview />
      <QuickLinks />
    </>
  );
}

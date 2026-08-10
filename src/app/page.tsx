import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Story from "@/components/Story/Story";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Story />
      </main>
      <Footer />
    </>
  );
}

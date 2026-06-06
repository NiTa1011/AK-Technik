import MusicRequestForm from "@/components/MusicRequestForm";
import { useActiveTheme } from "@/hooks/useActiveTheme";

const Index = () => {
  useActiveTheme(); // Apply active theme on load
  
  return <MusicRequestForm />;
};

export default Index;

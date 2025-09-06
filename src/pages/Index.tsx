import { Piano } from "@/components/Piano";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Virtual Piano
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Play beautiful melodies with this interactive piano keyboard
          </p>
        </div>
        
        <div className="flex justify-center">
          <Piano />
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          Click any key to play a note
        </div>
      </div>
    </div>
  );
};

export default Index;
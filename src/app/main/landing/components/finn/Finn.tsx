import Button from "app/shared-components/buttons/Button";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import Text from "app/shared-components/texts/Text";
import FinnCard from "./FinnCard";
import TypingText from "./TypingText";

const Finn = () => {
  return (
    <div className="flex flex-col space-y-40 h-[60vh] md:h-auto">
      <div className="flex flex-col md:flex-row md:space-x-32 space-y-32">
        <div className="flex-1">
          <FadeAnimatedContainer direction="left">
            <div className="flex flex-col space-y-20 ">
              <Text variant="caption">AI CHATBOT</Text>
              <Text variant="h2">
                Finn (Firefighter Insurance Navigator) - your AI Friend!
              </Text>
              <Text variant="body2">
                Just ask Finn and Finn will answer your queries, create custom
                charts, generate reports, interpret data, provide insights,
                visualize trends, and develop any analytics you want so that you
                can focus on more important tasks.
              </Text>

              <div className="space-y-10">
                <TypingText />
                {/* <Button onClick={() => {}} variant="contained">
                  <span className="text-white">Let's Discuss More</span>
                </Button> */}
              </div>
            </div>
          </FadeAnimatedContainer>
        </div>

        <div className="flex flex-1">
          <FinnCard />
        </div>
      </div>
    </div>
  );
};

export default Finn;

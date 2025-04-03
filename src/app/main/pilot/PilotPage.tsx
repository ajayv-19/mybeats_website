import React, { useState } from "react";
import Navbar from "../landing/components/navbar/Navbar";
import Footer from "../landing/components/footer/Footer";
import Text from "app/shared-components/texts/Text";
import MyBeats from "../../../assets/MyBeats.png";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import Step1 from "../../../assets/Step1.png";
import Step2 from "../../../assets/Step 2.png";
import Step3 from "../../../assets/Step 3.png";
import Step4 from "../../../assets/Step4.png";
import DetailedCard from "../landing/components/detailed/DetailedCard";
import Button from "app/shared-components/buttons/Button";
import { useNavigate } from "react-router";
import News1 from "../../../assets/news1.png";
import News2 from "../../../assets/news4.png";
import News3 from "../../../assets/news3.png";
import AppleStoreBtn from "../../../assets/download_app_store.svg";
import GooglePlayBtn from "../../../assets/googleplay.png";

const TABS = [
  "Privacy Policy for Policyholders",
  "Privacy Policy for Insurance Companies",
];

const ARTICLES = [
  {
    heading: "U.S. Firefighter Fatalities due to Sudden Cardiac Death",
    content:
      "During 1995-2004, almost half of the total number of firefighters who died while on duty, fell victim to sudden cardiac death, and close to half of those with documented prior medical…",
    imgSrc: News1,
    linkTo: "https://fire.engineering.nyu.edu/home/documents/NFPA.pdf",
  },
  {
    heading: "Sudden Cardiac Events in the Fire Service",
    content:
      "Despite the risks of burns/smoke inhalation and other myriad physical dangers inherent in firefighting, sudden cardiac event is the leading cause of firefighter on-duty deaths…",
    imgSrc: News2,
    linkTo: "https://fire.engineering.nyu.edu/home/documents/Skidmore.pdf",
  },
  {
    heading: "Preventing Firefighter Fatalities due to Heart Attacks",
    content:
      "Firefighters are dying on the job from preventable cardiovascular conditions. Sudden cardiac death represents the most common cause of a fire fighter fatality…",
    imgSrc: News3,
    linkTo: "https://fire.engineering.nyu.edu/home/documents/NIOSH.pdf",
  },
];

const ImageCard = ({ imgUrl }) => {
  return (
    <div className="h-[300px] w-screen md:h-[400px] md:w-full overflow-hidden">
      <img
        src={imgUrl}
        className="h-full w-full object-contain"
        alt="Preview"
      />
    </div>
  );
};

const PilotPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 overflow-x-hidden h-full flex flex-col justify-between">
      <Navbar />
      <div className="pb-[100px] overflow-auto flex-1 flex flex-col items-center justify-center gap-40">
        <div className="px-40 md:w-[1200px] flex flex-col gap-20">
          <div className="text-center">
            <Text variant="h2">
              AI-enabled Health Monitoring for Firefighters
            </Text>
          </div>
          <FadeAnimatedContainer delay={1} direction="bottom">
            {/* <ShowcaseCard scale="large" tiltDirection="center" /> */}
            <iframe
              src="https://www.youtube.com/embed/hL4czjz1vhM?si=5I0nphnMx4ITja1U"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-[330px] h-[280px] sm:w-[1200px] sm:h-[600px]"
            />
          </FadeAnimatedContainer>
        </div>

        <div className="text-center md:w-[1200px] md:px-40 md:text-left">
          <div className="text-center">
            <Text variant="h2">
              Participate in our pilot test in four easy steps
            </Text>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-32 md:space-y-0 space-y-32">
            <div className="flex-1 mt-48">
              <FadeAnimatedContainer direction="left">
                <div className="h-ful flex flex-col justify-center space-y-20">
                  <Text variant="h2">STEP 1: DOWNLOAD THE APP</Text>
                  <Text variant="body2">
                    Search for "MyBeats" in your mobile app store or click on
                    buttons below.
                  </Text>
                </div>
                <div className="flex h-[40px] space-x-10 mt-10 justify-center md:justify-start">
                  <img src={AppleStoreBtn} />
                  <img src={GooglePlayBtn} />
                </div>
              </FadeAnimatedContainer>
            </div>

            <div className="flex flex-1">
              <FadeAnimatedContainer direction="right">
                <ImageCard imgUrl={Step1} />
              </FadeAnimatedContainer>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:space-x-40 space-y-32">
            <div className="flex flex-1 mt-48">
              <FadeAnimatedContainer direction="left">
                <ImageCard imgUrl={Step2} />
              </FadeAnimatedContainer>
            </div>
            <div className="flex-1">
              <FadeAnimatedContainer direction="right">
                <div className="h-full flex flex-col justify-center space-y-20">
                  <Text variant="h2">STEP 2: COMPLETE REGISTRATION</Text>
                  <Text variant="body2">
                    Login into the app and provide{" "}
                    <a href="/consent">consent</a> to collect your health data
                  </Text>
                </div>
              </FadeAnimatedContainer>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-32 space-y-32">
            <div className="flex-1 mt-48">
              <FadeAnimatedContainer direction="left">
                <div className="h-full flex flex-col justify-center space-y-20">
                  <Text variant="h2">STEP 3: ADD YOUR HEALTH TRACKER</Text>
                  <Text variant="body2">
                    Allow us to access your wearables data by adding your health
                    tracker
                  </Text>
                </div>
              </FadeAnimatedContainer>
            </div>

            <div className="flex flex-1">
              <FadeAnimatedContainer direction="right">
                <ImageCard imgUrl={Step3} />
              </FadeAnimatedContainer>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:space-x-40 space-y-32">
            <div className="flex flex-1 mt-48">
              <FadeAnimatedContainer direction="left">
                <ImageCard imgUrl={Step4} />
              </FadeAnimatedContainer>
            </div>
            <div className="flex-1">
              <FadeAnimatedContainer direction="right">
                <div className="h-full flex flex-col justify-center space-y-20">
                  <Text variant="h2">STEP 4: SYNC YOUR HEALTH TRACKER</Text>
                  <Text variant="body2">
                    Daily sync your health tracker to receive AI-enabled
                    personalized health insights
                  </Text>
                </div>
              </FadeAnimatedContainer>
            </div>
          </div>
        </div>

        {/* <div className="flex items-end justify-end">
          <Button onClick={() => navigate("/consent")} variant="contained">
            <span className="text-white">Read More</span>
          </Button>
        </div> */}

        <div className="px-40 md:w-[1000px] mt-48">
          <div className="text-center">
            <Text variant="h2">Informational Articles</Text>
          </div>

          <div className="flex-col space-y-20 flex md:flex-row md:space-x-20 md:space-y-0 mt-48">
            {ARTICLES.map((article) => (
              <div
                onClick={() =>
                  window.open(article.linkTo, "_blank", "noopener,noreferrer")
                }
                className="cursor-pointer flex flex-col space-y-20"
              >
                <div className="flex flex-1 rounded-xl cursor-pointer">
                  <img src={article.imgSrc} className="rounded-xl" />
                </div>

                <Text variant="body1">{article.heading}</Text>
                <Text>{article.content}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PilotPage;

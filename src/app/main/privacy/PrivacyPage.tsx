import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../landing/components/navbar/Navbar";
import Footer from "../landing/components/footer/Footer";
import InsurancePrivacy from "./InsurancePrivacy";
import PolicyholdersPrivacy from "./PolicyholdersPrivacy";

const TABS = [
  "Privacy Policy for Policyholders",
  // "Privacy Policy for Insurance Companies",
];

const PrivacyPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="bg-gray-200 overflow-x-hidden">
      <Navbar />
      <div className="pb-[100px] overflow-auto flex flex-col items-center justify-center">
        <div className="px-40 md:w-[1000px] flex flex-col gap-20">
          <div className="flex items-center space-x-8">
            {TABS.map((tab, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => setSelectedTab(index)}
                  className={`text-4xl ${selectedTab === index ? "underline text-orange-400" : ""}`}
                >
                  {tab}
                </button>
                {index === 0 && (
                  <span className="text-4xl text-gray-400"></span>
                )}
              </React.Fragment>
            ))}
          </div>

          {selectedTab === 0 && <PolicyholdersPrivacy />}
          {/* {selectedTab === 1 && <InsurancePrivacy />} */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../landing/components/navbar/Navbar";
import Footer from "../landing/components/footer/Footer";
import InsuranceTerms from "./InsuranceTerms";
import PolicyholderTerms from "./PolicyholderTerms";

const TABS = [
  "Terms & Conditions for Policyholders",
  // "Terms & Conditions for Insurance Companies",
];

const TermsAndConditionsPage = () => {
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
                  className={`text-3xl ${selectedTab === index ? "underline text-orange-400" : ""}`}
                >
                  {tab}
                </button>
                {index === 0 && (
                  <span className="text-4xl text-gray-400"></span>
                )}
              </React.Fragment>
            ))}
          </div>

          {selectedTab === 0 && <PolicyholderTerms />}
          {/* {selectedTab === 1 && <InsuranceTerms />} */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditionsPage;

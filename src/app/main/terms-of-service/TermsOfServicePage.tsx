import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../landing/components/navbar/Navbar";
import Footer from "../landing/components/footer/Footer";
import InsuranceTerms from "./InsuranceTerms";
import PolicyholderTerms from "./PolicyholderTerms";

const TABS = ["For Insurance Companies", "For Policyholders"];

const TermsOfServicePage = () => {
  const [selectedTab, setSelectedTab] = useState(0);


  return (
    <div className="bg-gray-200 overflow-x-hidden">
      <Navbar />
      <div className="pb-[100px] overflow-auto flex flex-col items-center justify-center">
        <div className="px-40 md:w-[1000px] flex flex-col gap-20">
          <div className="flex items-center space-x-20">
            {TABS.map((tab, index) => (
              <button
                onClick={() => setSelectedTab(index)}
                className={`${selectedTab === index && "underline text-orange-400"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === 0 && <InsuranceTerms />}
          {selectedTab === 1 && <PolicyholderTerms />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;

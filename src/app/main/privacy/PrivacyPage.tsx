import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../landing/components/navbar/Navbar";
import Footer from "../landing/components/footer/Footer";
import InsurancePrivacy from "./InsurancePrivacy";
import PolicyholdersPrivacy from "./PolicyholdersPrivacy";

const TABS = ["For Insurance Companies", "For Policyholders"];

const PrivacyPage = () => {
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

          {selectedTab === 0 && <InsurancePrivacy />}
          {selectedTab === 1 && <PolicyholdersPrivacy />}
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="bg-gray-200 overflow-x-hidden">
      <Navbar />
      <div className="py-[100px] overflow-auto flex flex-col items-center justify-center">
        <div className="px-40 md:w-[1000px] flex flex-col gap-20">
          <div className="flex flex-col">
            <span className="text-7xl font-extrabold">Privacy Policy</span>
            <span>Last Updated: September 29, 2024</span>
          </div>

          <div>
            <span>
              This Privacy Policy sets forth the principles governing the
              collection, use, disclosure, retention, and protection of Personal
              Information ("PI") as processed by MyBeats Inc. ("MyBeats,"
              "we," "us," "our") within the scope of our mobile application (the
              "App") designed for health risk mitigation in firefighters. By
              utilizing our Services, you consent to this Privacy Policy, which
              is subject to continuous review to ensure compliance with
              applicable regulations and standards, including but not limited to
              the General Data Protection Regulation (GDPR), the California
              Consumer Privacy Act (CCPA), and the Health Insurance Portability
              and Accountability Act (HIPAA).
            </span>
          </div>

          <div>
            <span className="font-bold text-xl">1. Information We Collect</span>
            <ul className="ml-24">
              <li className="mb-4">
                <span className="font-bold text-lg">
                  1.1 Personal Information
                </span>
                <ul className="ml-24">
                  <li className="mb-2">
                    <span className="font-bold">Contact Information:</span>{" "}
                    Identifiable information such as first name, last name,
                    email, and address.
                  </li>
                  <li className="mb-2">
                    <span className="font-bold">Demographic Data:</span> Age,
                    gender, weight, and height.
                  </li>
                  <li>
                    <span className="font-bold">
                      Health-Related Information:
                    </span>{" "}
                    Physiological data derived from wearable devices, including
                    but not limited to heart rate, activity levels, and sleep
                    data, all of which may be classified as health data under
                    relevant laws.
                  </li>
                </ul>
              </li>
              <li className="mb-4">
                <span className="font-bold text-lg">
                  1.2 Non-Personal Information
                </span>
                <ul className="ml-24">
                  <li className="mb-2">
                    <span className="font-bold">Device Information:</span>{" "}
                    Technical data regarding the user’s device, operating
                    system, and browser information.
                  </li>
                  <li>
                    <span className="font-bold">Usage Data:</span> Information
                    such as app interactions, access times, and browsing
                    patterns, which is aggregated and anonymized to remove
                    identifiable attributes.
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-xl">
              2. Legal Basis for Processing
            </span>
            <ul className="ml-24">
              <li className="mb-2">
                <span className="font-bold">Performance of a Contract:</span> To
                provide our health monitoring and notification services.
              </li>
              <li className="mb-2">
                <span className="font-bold">Legitimate Interests:</span> To
                improve, optimize, and personalize our services.
              </li>
              <li className="mb-2">
                <span className="font-bold">Consent:</span> Explicit consent is
                required for processing sensitive personal data such as
                health-related information.
              </li>
              <li>
                <span className="font-bold">
                  Compliance with Legal Obligations:
                </span>{" "}
                To comply with relevant statutory or regulatory requirements.
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-xl">3. Purpose of Processing</span>
            <ul className="ml-24">
              <li className="mb-2">
                <span className="font-bold">Health Risk Detection:</span> Our
                machine learning algorithms analyze heart rate, activity levels,
                and sleep patterns to detect early signs of cardiovascular
                diseases such as arrhythmia or hypertension.
              </li>
              <li className="mb-2">
                <span className="font-bold">Caloric Analysis:</span> Data from
                the camera is used to calculate caloric intake based on images
                of food items.
              </li>
              <li>
                <span className="font-bold">Service Enhancement:</span>{" "}
                Non-personal usage data is analyzed to improve functionality,
                identify technical issues, and optimize user experience.
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-xl">
              4. Data Sharing and Disclosure
            </span>
            <ul className="ml-24">
              <li className="mb-2">
                <span className="font-bold">
                  4.1 Third-Party Service Providers:
                </span>{" "}
                We may engage trusted service providers to process data on our
                behalf. These entities are contractually bound to implement
                stringent data security measures consistent with the
                requirements of GDPR Article 28 and HIPAA-compliant data
                security standards.
              </li>
              <li>
                <span className="font-bold">
                  4.2 Legal and Regulatory Compliance:
                </span>{" "}
                We may disclose your Personal Information to governmental
                authorities, courts, or regulatory bodies when required to do so
                by law.
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-xl">5. Data Security</span>
            <br />
            <span>
              We utilize robust technical and organizational safeguards in
              accordance with ISO/IEC 27001 standards and the NIST Cybersecurity
              Framework to prevent unauthorized access, alteration, or
              disclosure of Personal Information.
            </span>
          </div>

          <div>
            <span className="font-bold text-xl">
              6. Data Retention and Deletion
            </span>
            <br />
            <span>
              We retain Personal Information for as long as necessary to fulfill
              the purposes for which it was collected, subject to legal and
              regulatory retention requirements.
            </span>
          </div>

          <div>
            <span className="font-bold text-xl">
              7. User Rights and Choices
            </span>
            <ul className="ml-24">
              <li className="mb-2">
                <span className="font-bold">Access and Portability:</span> You
                have the right to request access to the data we process and
                receive it in a structured, machine-readable format.
              </li>
              <li className="mb-2">
                <span className="font-bold">Rectification:</span> You may
                request the correction or amendment of inaccurate or incomplete
                data.
              </li>
              <li className="mb-2">
                <span className="font-bold">
                  Erasure (Right to be Forgotten):
                </span>{" "}
                You may request the deletion of your data, except where
                retention is required by law or for legitimate business
                interests.
              </li>
              <li className="mb-2">
                <span className="font-bold">
                  Data Processing Restriction and Objection:
                </span>{" "}
                You may restrict the processing of your data or object to
                certain types of processing.
              </li>
              <li>
                <span className="font-bold">Withdrawal of Consent:</span> You
                may withdraw consent at any time without affecting the
                lawfulness of prior data processing.
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-xl">8. Children's Privacy</span>
            <br />
            <span>
              Our Services are not directed towards individuals under the age of
              18, and we do not knowingly process the data of minors without
              verified parental consent.
            </span>
          </div>

          <div>
            <span className="font-bold text-xl">
              9. Changes to This Privacy Policy
            </span>
            <br />
            <span>
              We reserve the right to modify this Privacy Policy to reflect
              changes in legal requirements or our data handling practices.
              Material changes will be communicated to users via the app or
              other appropriate means.
            </span>
          </div>

          <div>
            <span className="font-bold text-xl">Contact Information</span>
            <br />
            <span>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact us at{" "}
              <span className="font-bold">firebeatsapp@gmail.com</span>.
            </span>
          </div>
        </div>

      </div>
        <Footer />
    </div>
  );
};

export default PrivacyPage;

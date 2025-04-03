import React from "react";
import Navbar from "../landing/components/navbar/Navbar";
import Footer from "../landing/components/footer/Footer";

import AppleStoreBtn from "../../../assets/download_app_store.svg";
import GooglePlayBtn from "../../../assets/googleplay.png";

const ConsentFormPage = () => {
  return (
    <div className="bg-gray-200 overflow-x-hidden">
      <Navbar />
      <div className="pb-[100px] overflow-auto flex flex-col items-center justify-center">
        <div className="px-40 md:w-[1000px] flex flex-col gap-20">
          <div className="py-6">
            <p>LAST UPDATED: March 18, 2025</p>

            <p>
              You are invited to participate in a pilot study aimed at
              evaluating an AI-based health monitoring application designed to
              improve firefighter health and provide advanced insurance
              analytics. We are conducting this pilot test in collaboration with
              your insurance company.
            </p>

            <h2 className="mt-20 font-bold text-xl mb-2">
              1. Invitation &amp; Voluntary Participation
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Participation is completely voluntary.</li>
              <li>
                Your decision to participate, withdraw, or not participate will
                not affect your relationship with any entity.
              </li>
              <li>
                You may withdraw at any time without penalty by using the
                “Withdraw Participation” option in the app or by uninstalling
                the app.
              </li>
              <li>
                Withdrawal does not affect the use of data collected previously
                during your participation.
              </li>
            </ul>

            <h2 className="mt-20 font-bold text-xl mb-2">
              2. Purpose of the Study
            </h2>
            <p>The purpose of this pilot study is to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Assess the effectiveness of an AI-powered mobile application in
                providing personalized health insights to firefighters and
                enabling them to improve their health.
              </li>
              <li>
                Use wearable health tracker data to create analytics for
                insurance companies.
              </li>
            </ul>

            <h2 className="mt-20 font-bold text-xl mb-2">3. Eligibility</h2>
            <p>
              You are eligible to participate if you are an active firefighter
              who:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Agrees to wear a health tracker (either one provided by the
                study or your own device).
              </li>
              <li>
                Is willing to sync your device with our mobile app for data
                collection over a 30-day period.
              </li>
            </ul>

            <h2 className="mt-20 font-bold text-xl mb-2">
              4. Study Procedures
            </h2>
            <p>
              If you agree to participate, you will be asked to do the following
              over a 30-day period:
            </p>

            <h3 className="font-bold text-lg mb-2">a. Health Tracker Use:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>You will receive a health tracker or use your own.</li>
              <li>
                You are expected to charge and wear the tracker as consistently
                as possible.
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">b. Data Syncing:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Connect and sync your health tracker with our mobile app daily.
              </li>
              <li>
                The app will automatically upload your data (e.g., heart rate,
                activity levels, sleep patterns, caloric intake, etc.) directly
                to our AI models without manual intervention.
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">c. AI-Health Insights:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Receive personalized health insights and recommendations within
                the app.
              </li>
              <li>
                These insights are for informational purposes only and do not
                constitute medical advice.
              </li>
              <li>
                Generate points based on wearables data and weekly leaderboards
                to encourage community engagement and promote a healthy
                lifestyle among participants.
              </li>
              <li>
                The gamification and social features are provided solely for
                motivational purposes and are not intended for performance
                evaluation.
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">d. Feedback Submission:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                At the end of the pilot study, you will be asked to complete a
                brief survey regarding your experience with the app.
              </li>
              <li>
                Survey responses will be de-linked from personally identifiable
                information and used only for aggregate analysis.
              </li>
            </ul>
            <p className="mt-20">
              After the pilot test, you may disconnect the health tracker with
              the app and continue to use your devices the way you were using it
              before participating in the pilot test. At the end of the pilot
              test, if you were provided with a health tracker by us, please
              return it. Please contact us at{" "}
              <a href="mailto:contact@mybeatshealth.com" className="font-bold">
                contact@mybeatshealth.com
              </a>{" "}
              for return instructions.
            </p>

            <h2 className="mt-20 font-bold text-xl mb-2">
              5. Data Collection, Use &amp; Privacy
            </h2>

            <h3 className="font-bold text-lg mb-2">a. What We Collect:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Health data (heart rate, activity, sleep patterns, caloric
                intake, etc.) from your wearable device.
              </li>
              <li>
                App interaction data (usage logs, engagement with gamifications
                and social features, survey responses).
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">b. How We Use Your Data:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                To provide real-time, AI-driven health insights tailored to you.
              </li>
              <li>
                To create analytics, insights, and information for insurance
                companies.
              </li>
              <li>
                Any identifiable data will not be shared with your employer.
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">
              c. Data Security &amp; Confidentiality:
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>All data is stored securely on cloud servers.</li>
            </ul>

            <h3 className="font-bold text-lg mb-2">d. Future Use of Data:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Data may be used for future research and further enhancement of
                our AI models.
              </li>
            </ul>

            <p className="mt-20">
              Additionally, the analytics generated through your data may be
              shared with your insurance company for risk assessment, product
              development, and improving insurance-related analytics. Any
              decisions made based on such analytics are solely at the user’s
              risk. 
            </p>

            <h2 className="mt-20 font-bold text-xl mb-2">
              6. Risks &amp; Discomforts
            </h2>

            <h3 className="font-bold text-lg mb-2">a. Potential Risks:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                The mobile app may use additional battery power and cellular
                data.
              </li>
              <li>
                This study is not intended to provide medical advice or
                emergency health monitoring.
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">b. Discomforts:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Minimal, primarily related to charging and wearing the health
                tracker, and syncing data daily.
              </li>
            </ul>

            <h2 className="mt-20 font-bold text-xl mb-2">7. Benefits</h2>

            <h3 className="font-bold text-lg mb-2">a. Personal Benefits:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Gain access to personalized, AI-driven health insights that may
                help you manage your health better.
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-2">b. Broader Benefits:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Your participation will help improve tools that may benefit the
                wider firefighting community.
              </li>
            </ul>

            <h2 className="mt-20 font-bold text-xl mb-2">
              8. Withdrawal &amp; Data Retention
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                You may withdraw from the study at any time by uninstalling the
                app or clicking the “Withdraw Participation” option in the app.
              </li>
              <li>
                If you withdraw, no new data will be collected, but previously
                de-identified, aggregate data may continue to be used for
                research and analytics purposes.
              </li>
              <li>
                Upon withdrawal, you may request the deletion of any remaining
                personal data by contacting us at:{" "}
                <a
                  href="mailto:contact@mybeatshealth.com"
                  className="font-bold"
                >
                  contact@mybeatshealth.com
                </a>
                .
              </li>
            </ul>

            <h2 className="mt-20 font-bold text-xl mb-2">
              9. Contact Information
            </h2>
            <p>
              You may chat with our team through the app if you face any issues.
              For questions about your rights as a participant and concerns
              regarding your data or about this pilot study, please contact us
              at:{" "}
              <a href="mailto:contact@mybeatshealth.com" className="font-bold">
                contact@mybeatshealth.com
              </a>
            </p>

            <h2 className="mt-20 font-bold text-xl mb-2">
              10. Agreement to Participate
            </h2>
            <p>
              To participate in the pilot test, you will need to acknowledge
              that:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>You have read and understood this Consent Form.</li>
              <li>You voluntarily agree to participate in the pilot study.</li>
              <li>
                You consent to the collection, processing, use, and sharing of
                your health data as described above.
              </li>
              <li>
                You understand that you can withdraw at any time without
                penalty.
              </li>
            </ul>
            <p className="mt-32 font-semibold">Download MyBeats</p>
            <div className="flex h-[40px] space-x-10 mt-4">
              <img src={AppleStoreBtn} />
              <img src={GooglePlayBtn} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConsentFormPage;

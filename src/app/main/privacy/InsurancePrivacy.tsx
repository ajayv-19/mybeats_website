import React from "react";

function InsurancePrivacy() {
  return (
    <div className="py-6">
      <h1 className="font-bold text-6xl mb-4">
        Privacy Policy for Insurance Companies
      </h1>
      <p className="mb-4">Effective Date: March 18, 2025</p>

      <p className="mb-4">
        This Privacy Policy (“Policy”) explains how Novel AI Technologies, Inc. (“Company,” “we,”
        “our,” or “us”) collects, processes, and discloses data through our Products and Services
        (“Products”) provided to our partner insurance companies (“Insurance Company,” “you,” or
        “your”). This Policy applies solely to the Products provided to Insurance companies for internal
        risk assessment, product development, and actuarial analysis, and does not govern any personally
        identifiable information (PII) from policyholders, which is covered by a separate Privacy Policy.
      </p>

      <h2 className="font-bold text-xl mb-2">1. Information Processed</h2>
      <p className="mb-4">
        The Products provide data derived from policyholders. This includes:
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li>
          Health metrics such as heart rate, activity levels, sleep patterns, caloric intake, and other
          physiological data recorded by wearables.
        </li>
        <li>
          Non-personal information such as usage patterns, device types, and log data related to the
          performance of the Products.
        </li>
      </ul>

      <h2 className="font-bold text-xl mb-2">2. Use of Data</h2>
      <p className="mb-4">
        We make the Products available to you for the purpose of:
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li>Supporting internal risk assessment and underwriting analysis.</li>
        <li>Enhancing product development and actuarial analysis.</li>
        <li>Generating insights and recommendations regarding health trends.</li>
      </ul>
      <p className="mb-4">
        The analytics, insights, and recommendations provided are for informational purposes only and
        are not intended to substitute for your own risk assessments or professional advice. You
        acknowledge that any use of these insights is at your sole risk.
      </p>

      <h2 className="font-bold text-xl mb-2">3. Data Sharing and Restrictions</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          You agree not to attempt to re-identify or reverse-engineer any de-identified data provided by
          the Products.
        </li>
        <li>
          The data may not be resold, sublicensed, or distributed to any third party outside your internal
          operations.
        </li>
        <li>
          Any additional sharing of data must be approved in writing by Novel AI Technologies, Inc.
        </li>
      </ul>
      <p className="mb-4">
        Furthermore, you shall not use the data for any purpose beyond internal analysis without our
        prior consent.
      </p>

      <h2 className="font-bold text-xl mb-2">4. Data Security</h2>
      <p className="mb-4">
        We employ industry-standard security measures to safeguard the data processed through the
        Products. While we strive to protect the data, we do not guarantee absolute security and are not
        liable for unauthorized access beyond our control.
      </p>

      <h2 className="font-bold text-xl mb-2">5. Data Retention</h2>
      <p className="mb-4">
        We retain the data provided through the Products only as long as necessary to support your
        internal analysis and as required by law. Once data is no longer needed, it will be securely
        deleted or further anonymized. Retention periods may vary based on legal requirements and
        internal data policies.
      </p>

      <h2 className="font-bold text-xl mb-2">6. Insurance Company Responsibilities</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          Ensuring that your use of the Products complies with all applicable laws and regulations,
          including those governing data protection and consumer rights.
        </li>
        <li>
          Implementing internal security measures to protect any data exported from the Products for
          your internal use.
        </li>
        <li>
          Independently validating and verifying any analytics or recommendations prior to integrating
          them into your underwriting, claims, or risk assessment processes.
        </li>
        <li>
          Not attempting to re-identify de-identified data provided by the Products.
        </li>
      </ul>
      <p className="mb-4">
        You acknowledge that any misuse of the data or deviation from these responsibilities is solely
        your responsibility.
      </p>

      <h2 className="font-bold text-xl mb-2">7. Disclaimers and Liability</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          The Products and its data are provided “as is” without any warranties, express or implied,
          including those of accuracy, completeness, merchantability, or fitness for a particular purpose.
        </li>
        <li>
          All analytics and insights are provided for informational purposes only. You assume full
          responsibility for any decisions made or actions taken based on the information provided by the
          Products.
        </li>
        <li>
          Under no circumstances shall Novel AI Technologies, Inc. be liable for any indirect, incidental,
          consequential, or punitive damages arising from your use of the Products. By using the Products,
          you agree that Novel AI Technologies, Inc. is not liable for any regulatory, underwriting, or
          claims decisions made based on the data.
        </li>
      </ul>

      <h2 className="font-bold text-xl mb-2">8. Changes to this Privacy Policy</h2>
      <p className="mb-4">
        We reserve the right to modify this Privacy Policy at any time. Any changes will be effective
        immediately upon posting the updated Policy on our website or within the Products. Your
        continued use of the Products constitutes your acceptance of any changes to this Policy.
      </p>

      <h2 className="font-bold text-xl mb-2">9. Contact Information</h2>
      <p className="mb-4">
        For any questions or concerns regarding this Privacy Policy, please contact us at:
        contact@mybeatshealth.com
      </p>

      <h2 className="font-bold text-xl mb-2">Conclusion</h2>
      <p className="mb-4">
        By accessing and using the Products, you acknowledge that you have read, understood, and
        agree to be bound by the terms of this Privacy Policy.
      </p>
    </div>
  );
}

export default InsurancePrivacy;
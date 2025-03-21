import Button from "app/shared-components/buttons/Button";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import Text from "app/shared-components/texts/Text";
import React from "react";
import ChartImage from "../../../../../assets/images/chart_NIST.png";
import InsuranceDashboardImage from "../../../../../assets/images/dashboard_Insurance.png";

import DetailedCard from "./DetailedCard";
import { useNavigate } from "react-router";

interface DetailedProps {
  scrollToContactUs: () => void;
}

function Detailed({ scrollToContactUs }: DetailedProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-80">
      <div className="flex flex-col md:flex-row md:space-x-32 space-y-32">
        <div className="flex-1">
          <FadeAnimatedContainer direction="left">
            <div className="flex flex-col space-y-20 ">
              <Text variant="caption">DATA-DRIVEN DECISION MAKING</Text>
              <Text variant="h2">
                Cut Costs, Not Coverage – Smarter Insights for Better Savings
              </Text>
              <Text variant="body2">
                Cardiovascular diseases account for the highest average workers’
                compensation claims and hospitalization costs in fire service in
                comparison to any other firefighter injury. AI-enabled health
                monitoring can save you millions!
              </Text>

              <Button onClick={scrollToContactUs} variant="contained">
                <span className="text-white">Let's Discuss More</span>
              </Button>
            </div>
          </FadeAnimatedContainer>
        </div>

        <div className="flex flex-1">
          <FadeAnimatedContainer direction="right">
            <DetailedCard imgUrl={ChartImage} />
          </FadeAnimatedContainer>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row md:space-x-40 space-y-32">
        <div className="flex flex-1 mt-32">
          <FadeAnimatedContainer direction="left">
            <DetailedCard imgUrl={InsuranceDashboardImage} />
          </FadeAnimatedContainer>
        </div>
        <div className="flex-1">
          <FadeAnimatedContainer direction="right">
            <div className="flex flex-col space-y-20">
              <Text variant="caption">DASHBOARD FOR INSURANCE COMPANIES</Text>
              <Text variant="h2">
                Unlock the Power of Data with our AI Dashboard
              </Text>
              <Text variant="body2">
                Our AI-powered dashboard transforms real-time wearable data of
                firefighters into actionable insurance insights and analytics.
                Traditionally, insurance companies rely on retrospective claims
                data and annual medical evaluations to assess their risks.
                However, this conventional approach fails to provide the
                proactive real-time insights needed for early intervention, risk
                mitigation, and predictive analytics.
              </Text>

              <Button onClick={() => navigate("/sign-in")} variant="contained">
                <span className="text-white">Get Started</span>
              </Button>
            </div>
          </FadeAnimatedContainer>
        </div>
      </div>
    </div>
  );
}

export default Detailed;

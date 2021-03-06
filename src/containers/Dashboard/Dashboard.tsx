import { useAccountData } from "src/hooks/useAccountData";
import { useAccountsContext } from "src/hooks/useAccounts";
import { useInitialData } from "src/hooks/useInitialData";
import { useLatestBlockHeight } from "src/hooks/useLatestBlockHeight";
import { useSiblingData } from "src/hooks/useSiblingData";
import { AccountBar } from "src/components/AccountBar/AccountBar";
import { useActiveAccount } from "./hooks/useActiveAccount";
import { usePolkadotJsContext } from "src/hooks/usePolkadotJs";
import { ContributionForm } from "src/components/AccountBar/ContributionForm";
import { useHandleCrowdloanContribute } from "./hooks/useHandleCrowdloanContribute";
import { useCallback, useMemo, useState } from "react";
import { calculateReimbursmentMultiplier } from "src/lib/calculateRewards";
import BigNumber from "bignumber.js";

import "./Dashboard.scss";
import { fromE10Precision } from "src/lib/utils";
import millify from "millify";

export const Dashboard = () => {
  const blockHeight = useLatestBlockHeight();
  const api = usePolkadotJsContext();

  const {
    activeAccount,
    loading: activeAccountLoading,
    setActiveAccountAddress,
  } = useActiveAccount();

  const {
    getAllAccounts,
    allAccounts,
    loading: accountsLoading,
    initiallyLoaded: accountsInitiallyLoaded,
  } = useAccountsContext();

  const {
    loading: initialDataLoading,
    incentive,
    ownParachain,
  } = useInitialData();

  const {
    loading: accountDataLoading,
    contributions,
    accountTotalRewards,
    accountTotalContribution,
  } = useAccountData(incentive?.totalRewardsDistributed);

  const {
    handleCrowdloanContribute,
    contributionStatus,
  } = useHandleCrowdloanContribute();

  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const { loading: siblingDataLoading, siblingParachain } = useSiblingData(
    incentive?.siblingParachain?.id
  );

  const reimbursmentMultiplier = useMemo(() => {
    if (!incentive) return;
    return calculateReimbursmentMultiplier(
      new BigNumber(incentive?.leadPercentageRate)
        .dividedBy(new BigNumber(10).pow(6))
        .toNumber()
    ).toFixed(2);
  }, [incentive]);

  const calculateTargetPercentage = useCallback(() => {
    if (siblingParachain?.fundsPledged && ownParachain?.fundsPledged) {
      return (
        (100 / parseFloat(fromE10Precision(siblingParachain?.fundsPledged))) *
        parseFloat(fromE10Precision(ownParachain?.fundsPledged))
      ).toFixed(2);
    } else return "0";
  }, [siblingParachain?.fundsPledged, ownParachain?.fundsPledged]);

  return (
    <div className="screen">
      <div className="screen__navigation">
        <a href="https://hydradx.io" rel="noreferrer" target="_blank">
          <div className="hydraLogo screen__navigation__icon"></div>
          <h1>Home</h1>
        </a>
        <a
          className="help"
          href="https://discord.gg/aQTtp8aRbk"
          rel="noreferrer"
          target="_blank"
        >
          Help
        </a>
        <a
          className="help"
          href="https://docs.hydradx.io/hydradx_crowdloan"
          rel="noreferrer"
          target="_blank"
        >
          Docs
        </a>
      </div>

      <div className="dashboard">
        <div className="dashboard__top">
          <AccountBar
            account={activeAccount}
            accounts={allAccounts}
            getAllAccounts={getAllAccounts}
            activeAccountLoading={activeAccountLoading}
            initiallyLoaded={accountsInitiallyLoaded}
            setActiveAccountAddress={setActiveAccountAddress}
            chainBlockHeight={blockHeight}
            processorBlockHeight={incentive?.blockHeight}
            apiReady={!!api}
            showAccountSelector={showAccountSelector}
            setShowAccountSelector={setShowAccountSelector}
          />
        </div>

        <div className="dashboard__bottom">
          {/* graph */}
          <div className="dashboard__bottom__graph">
            <h2>Status</h2>
            <div className="dashboard__botton__graph__status">
              {" "}
              {/* {parseFloat(calculateTargetPercentage()) > 100
                ? "leading the race for the target auction by " +
                  (parseFloat(calculateTargetPercentage()) - 100).toFixed(0) +
                  "%. " +
                  (parseFloat(calculateTargetPercentage()) > 115
                    ? "You will receive " +
                      (100 * parseFloat(reimbursmentMultiplier || "0.1 ") +
                        "% of rewards for your contributions at this moment")
                    : "We didn't secure a safe lead yet, you will still receive the highest rewards at this moment!")
                : "still catching up for the target auction. If you help us secure a slot, you will receive the highest rewards possible!"} */}
                We have won the race for our target auction, we are therefore not taking any more contributions. Thanks for all of your support!
                <br/><br/>
                Learn more {" "}
                <a
                    className='small-link'
                    href="https://docs.hydradx.io/hydradx_crowdloan"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {" "}
                     here
                  </a>.
                <div className="small-link-wrapper">
                  
                </div>
            </div>
            <div className="charts">
              <div className="target chart">
                <div
                  style={{ height: (parseFloat(calculateTargetPercentage()) > 100 ? 100 : calculateTargetPercentage()) + "%" }}
                  className="barChart"
                ></div>
                <div className="barChartNumber">
                  {millify(
                    parseFloat(
                      fromE10Precision(ownParachain?.fundsPledged || "0")
                    )
                  )}{" "}
                  /{" "}
                  {millify(
                    parseFloat(
                      // fromE10Precision(siblingParachain?.fundsPledged || "0")
                      // '1688307'
                      '2100000'
                    )
                  )}{" "}
                  DOT TARGET
                </div>
              </div>

              {/* <div className="reward chart">
                <div
                  style={{
                    height:
                      100 * parseFloat(reimbursmentMultiplier || "0.1") + "%",
                  }}
                  className="barChart"
                ></div>
                <div className="barChartNumber">
                  {100 * parseFloat(reimbursmentMultiplier || "0.1") + "%"}{" "}
                  REWARD
                </div>
              </div> */}
            </div>
          </div>
          {/* form */}
          <div className="dashboard__bottom__form">
            <ContributionForm
              totalContributionAmount={accountTotalContribution}
              totalRewards={accountTotalRewards}
              onContribute={handleCrowdloanContribute}
              apiReady={!!api}
              activeAccount={activeAccount}
              setShowAccountSelector={setShowAccountSelector}
              contributionStatus={contributionStatus}
              incentive={incentive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

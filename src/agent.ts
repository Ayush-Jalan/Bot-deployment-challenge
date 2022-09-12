import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType } from "forta-agent";
import { AGENT_CREATED_FUNCTION, NETHERMIND_ADDRESS, CONTRACT_ADDRESS } from "./uitls";

export const provideHandleTransaction = (deployer: string, contract: string, abi: string): HandleTransaction => {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const createAgentFunctions = txEvent.filterFunction(AGENT_CREATED_FUNCTION, CONTRACT_ADDRESS);

    createAgentFunctions.forEach((createdAgent) => {
      const { agentId, owner, metadata, chainIds } = createdAgent.args;
      if (owner.toLowerCase() === NETHERMIND_ADDRESS.toLowerCase()) {
        findings.push(
          Finding.fromObject({
            name: "Bot deployed",
            description: "New Bot deployed by Nethermind",
            alertId: "NETHERMIND-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            metadata: {
              agentId: agentId.toString(),
              metadata,
              chainIds: chainIds.toString(),
            },
          })
        );
      }
    });
    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(NETHERMIND_ADDRESS, CONTRACT_ADDRESS, AGENT_CREATED_FUNCTION),
};

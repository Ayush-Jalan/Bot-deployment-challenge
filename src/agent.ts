import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType } from "forta-agent";

export const AGENT_CREATED_FUNCTION =
  "function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds) public";
export const NETHERMIND_ADDRESS = "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8";
export const CONTRACT_ADDRESS = "0x61447385B019187daa48e91c55c02AF1F1f3F863";
let findingsCount = 0;

export const provideHandleTransaction = (): HandleTransaction => {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const createAgentFunctions = txEvent.filterFunction(AGENT_CREATED_FUNCTION, CONTRACT_ADDRESS);

    createAgentFunctions.forEach((createdAgent) => {
      const { agentId, owner, metadata, chainIds } = createdAgent.args;
      if (owner.toString().toLowerCase() === NETHERMIND_ADDRESS.toLowerCase()) {
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
  handleTransaction: provideHandleTransaction(),
};

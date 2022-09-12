import { FindingType, FindingSeverity, Finding, HandleTransaction} from "forta-agent";
import { provideHandleTransaction} from "./agent";
import { AGENT_CREATED_FUNCTION, NETHERMIND_ADDRESS, CONTRACT_ADDRESS } from "./uitls";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Interface } from "@ethersproject/abi";
import { BigNumber } from "ethers";

const MOCK_METADATA = {
  agentId: "123",
  metadata: "abc",
  chainIds: ["137"],
};

const MOCK_METADATA2 = {
  agentId: "12345",
  metadata: "abcde",
  chainIds: ["137"],
};

const MOCK_FINDING = (agentId: string, metadata: string, chainIds: string): Finding => {
  return Finding.fromObject({
    name: "Bot deployed",
    description: "New Bot deployed by Nethermind",
    alertId: "NETHERMIND-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      agentId: agentId,
      metadata: metadata,
      chainIds: chainIds,
    },
  });
};

const TEST_ADDRESS = createAddress("0x123abc");

describe("Bots deployment", () => {
  let handleTransaction: HandleTransaction;
  let proxy = new Interface([AGENT_CREATED_FUNCTION]);
  let findings: Finding[];
  let txEvent: TestTransactionEvent;

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(NETHERMIND_ADDRESS, CONTRACT_ADDRESS, AGENT_CREATED_FUNCTION);
  });

  it("returns empty findings if there are no bots deployed", async () => {
    txEvent = new TestTransactionEvent();
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty finding if the bot is deployed from a different address", async () => {
    txEvent = new TestTransactionEvent()
      .setFrom(TEST_ADDRESS)
      .setTo(CONTRACT_ADDRESS)
      .addTraces({
        to: CONTRACT_ADDRESS,
        from: TEST_ADDRESS,
        function: proxy.getFunction("createAgent"),
        arguments: [
          MOCK_METADATA.agentId,
          TEST_ADDRESS,
          MOCK_METADATA.metadata,
          [BigNumber.from(MOCK_METADATA.chainIds[0])],
        ],
      });
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if the bot is deployed from the deployer address", async () => {
    txEvent = new TestTransactionEvent()
      .setFrom(NETHERMIND_ADDRESS)
      .setTo(CONTRACT_ADDRESS)
      .addTraces({
        to: CONTRACT_ADDRESS,
        from: NETHERMIND_ADDRESS,
        function: proxy.getFunction("createAgent"),
        arguments: [
          MOCK_METADATA.agentId,
          NETHERMIND_ADDRESS,
          MOCK_METADATA.metadata,
          [BigNumber.from(MOCK_METADATA.chainIds[0])],
        ],
      });
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      MOCK_FINDING(MOCK_METADATA.agentId, MOCK_METADATA.metadata, MOCK_METADATA.chainIds[0]),
    ]);
  });

  it("returns findings if there are multiple calls of bot deployment", async () => {
    txEvent = new TestTransactionEvent()
      .setFrom(NETHERMIND_ADDRESS)
      .setTo(CONTRACT_ADDRESS)
      .addTraces({
        to: CONTRACT_ADDRESS,
        from: NETHERMIND_ADDRESS,
        function: proxy.getFunction("createAgent"),
        arguments: [
          MOCK_METADATA.agentId,
          NETHERMIND_ADDRESS,
          MOCK_METADATA.metadata,
          [BigNumber.from(MOCK_METADATA.chainIds[0])],
        ],
      })
      .addTraces({
        to: CONTRACT_ADDRESS,
        from: NETHERMIND_ADDRESS,
        function: proxy.getFunction("createAgent"),
        arguments: [
          MOCK_METADATA2.agentId,
          NETHERMIND_ADDRESS,
          MOCK_METADATA2.metadata,
          [BigNumber.from(MOCK_METADATA2.chainIds[0])],
        ],
      });
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      MOCK_FINDING(MOCK_METADATA.agentId, MOCK_METADATA.metadata, MOCK_METADATA.chainIds[0]),
      MOCK_FINDING(MOCK_METADATA2.agentId, MOCK_METADATA2.metadata, MOCK_METADATA2.chainIds[0]),
    ]);
  });
});

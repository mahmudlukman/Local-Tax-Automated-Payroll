import assert from "assert";
import { PaymentInstruction } from "../scripts/Nibss";
import { getFormatter, listFormatters } from "../scripts/bankExportFormat";

let passed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

const sampleInstructions: PaymentInstruction[] = [
  {
    employeeId: "EMP-0001",
    beneficiaryName: "Chinedu Okafor",
    accountNumber: "0123456789",
    bankCode: "058",
    bankName: "GTBank",
    amount: 436020,
    narration: "Salary 9/2026",
  },
  {
    employeeId: "EMP-0002",
    beneficiaryName: "Amaka, Nnamdi", // comma to exercise CSV escaping
    accountNumber: "9876543210",
    bankCode: "057",
    amount: 250000.5,
    narration: "Salary 9/2026",
  },
];

console.log("bankExportFormats");

test("generic formatter produces the expected header row", () => {
  const formatter = getFormatter("generic")!;
  const result = formatter.generate(sampleInstructions, "2026-09");
  const firstLine = result.content.split("\r\n")[0];
  assert.strictEqual(
    firstLine,
    "AccountNumber,BankCode,Amount,Narration,BeneficiaryName,EmployeeID",
  );
});

test("generic formatter formats amounts to 2 decimal places", () => {
  const formatter = getFormatter("generic")!;
  const result = formatter.generate(sampleInstructions, "2026-09");
  assert.ok(result.content.includes("436020.00"));
  assert.ok(result.content.includes("250000.50"));
});

test("fields containing commas are quoted", () => {
  const formatter = getFormatter("generic")!;
  const result = formatter.generate(sampleInstructions, "2026-09");
  assert.ok(result.content.includes('"Amaka, Nnamdi"'));
});

test("unknown format id returns undefined", () => {
  assert.strictEqual(getFormatter("access-bank"), undefined);
});

test("unverified formatters are flagged", () => {
  const formats = listFormatters();
  const gtbank = formats.find((f) => f.id === "gtbank");
  const generic = formats.find((f) => f.id === "generic");
  assert.strictEqual(gtbank?.verified, false);
  assert.strictEqual(generic?.verified, true);
});

console.log(`\n${passed} test(s) passed.`);
if (process.exitCode) {
  console.error("Some tests FAILED.");
} else {
  console.log("All tests passed.");
}

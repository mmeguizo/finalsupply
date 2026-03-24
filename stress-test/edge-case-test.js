/**
 * Edge Case Tests for:
 *  1. Auto IAR prevention when adding PO with items
 *  2. Split quantity validation (total must equal original)
 *  3. Split edge cases (zero qty, negative, exceeding, empty splits)
 *
 * Usage:  node edge-case-test.js
 * Requires the API server running on localhost:4000
 */

import http from 'http';
import { CONFIG } from './config.js';

const API = `${CONFIG.API_URL}${CONFIG.GRAPHQL_ENDPOINT}`;
const url = new URL(CONFIG.API_URL);

let sessionCookie = null;
let passed = 0;
let failed = 0;
const results = [];

// ─── helpers ────────────────────────────────────────────────────────
function makeRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: CONFIG.GRAPHQL_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      },
      timeout: 30000,
    };
    const req = http.request(options, (res) => {
      let data = '';
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
      }
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ errors: [{ message: `Parse error: ${data.slice(0, 200)}` }] });
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.write(postData);
    req.end();
  });
}

function record(name, pass, detail = '') {
  if (pass) {
    passed++;
    results.push({ name, status: '✅ PASS', detail });
  } else {
    failed++;
    results.push({ name, status: '❌ FAIL', detail });
  }
}

// ─── auth ───────────────────────────────────────────────────────────
async function login() {
  const res = await makeRequest(
    `mutation Login($input: LoginInput!) { login(input: $input) { id email name } }`,
    { input: { email: CONFIG.TEST_USER.email, password: CONFIG.TEST_USER.password } }
  );
  if (res.errors) {
    // try signup
    const signup = await makeRequest(
      `mutation SignUp($input: SignUpInput!) { signUp(input: $input) { id email name } }`,
      {
        input: {
          email: CONFIG.TEST_USER.email,
          password: CONFIG.TEST_USER.password,
          name: CONFIG.TEST_USER.name,
          gender: CONFIG.TEST_USER.gender,
        },
      }
    );
    if (signup.errors) {
      console.error('Auth failed:', signup.errors[0].message);
      process.exit(1);
    }
  }
  console.log('🔐 Authenticated\n');
}

// ─── Cleanup helper ─────────────────────────────────────────────────
async function deletePO(poId) {
  await makeRequest(
    `mutation DeletePO($id: Int!) { deletePurchaseOrder(id: $id) { id } }`,
    { id: poId }
  );
}

// ─── Default PO fields for required columns ─────────────────────────
const defaultPOFields = {
  modeOfProcurement: 'Direct Contracting',
  dateOfDelivery: '2026-03-15 00:00:00',
  dateOfPayment: '2026-03-20 00:00:00',
  deliveryTerms: 'FOB',
  paymentTerms: 'Net 30',
  amount: 0, // will be overridden
};

// ═══════════════════════════════════════════════════════════════════
// TEST GROUP 1: Auto IAR prevention when adding PO
// ═══════════════════════════════════════════════════════════════════

async function testNoIAROnNewPO() {
  console.log('━━━ GROUP 1: Auto IAR prevention on new PO ━━━\n');

  // 1a. Add PO with items that have currentInput=0 → should NOT create IAR
  const uniquePO = `EDGE-TEST-${Date.now()}`;
  const res = await makeRequest(
    `mutation AddPO($input: PurchaseOrderInput!) {
      addPurchaseOrder(input: $input) {
        id poNumber
        items { id itemName actualQuantityReceived }
      }
    }`,
    {
      input: {
        ...defaultPOFields,
        poNumber: uniquePO,
        supplier: 'Edge Test Supplier',
        placeOfDelivery: 'Test',
        campus: 'Talisay',
        amount: 500,
        items: [
          {
            id: 'temp',
            itemName: 'Test Item 1',
            description: 'Test Description',
            unit: 'pcs',
            quantity: 5,
            unitCost: 100,
            amount: 500,
            currentInput: 0,
            tag: 'none',
            inventoryNumber: 'none',
          },
        ],
      },
    }
  );

  if (res.errors) {
    record('1a. Add PO with items (currentInput=0)', false, res.errors[0].message);
    return;
  }

  const po = res.data.addPurchaseOrder;
  const item = po.items?.[0];
  const aqr = item?.actualQuantityReceived || 0;
  record(
    '1a. Add PO with items (currentInput=0) → no IAR',
    aqr === 0,
    `actualQuantityReceived=${aqr} (expected 0)`
  );

  // Check that no IAR rows exist for this item
  const iarCheck = await makeRequest(
    `query { inspectionAcceptanceReport { id purchaseOrderId } }`
  );
  const iarsForPO = (iarCheck.data?.inspectionAcceptanceReport || []).filter(
    (iar) => String(iar.purchaseOrderId) === String(po.id)
  );
  record(
    '1b. No IAR records created for new PO',
    iarsForPO.length === 0,
    `Found ${iarsForPO.length} IAR(s) for PO ${po.id}`
  );

  // 1c. Update the PO adding a new temp item with currentInput stripped
  const updateRes = await makeRequest(
    `mutation UpdatePO($input: UpdatePurchaseOrderInput!) {
      updatePurchaseOrder(input: $input) {
        id items { id itemName actualQuantityReceived }
      }
    }`,
    {
      input: {
        id: parseInt(po.id),
        poNumber: uniquePO,
        supplier: 'Edge Test Supplier',
        placeOfDelivery: 'Test',
        items: [
          // Existing item (keep as is)
          {
            id: item.id,
            itemName: 'Test Item 1',
            description: 'Test Description',
            unit: 'pcs',
            quantity: 5,
            unitCost: 100,
            amount: 500,
            currentInput: 0,
            tag: 'none',
            inventoryNumber: 'none',
          },
          // New temp item — no currentInput (simulates fix)
          {
            id: 'temp',
            itemName: 'Test Item 2 - Added via Edit',
            description: 'Should not create IAR',
            unit: 'pcs',
            quantity: 3,
            unitCost: 200,
            amount: 600,
            tag: 'none',
            inventoryNumber: 'none',
          },
        ],
      },
    }
  );

  if (updateRes.errors) {
    record('1c. Edit PO: add temp item without currentInput', false, updateRes.errors[0].message);
  } else {
    const updatedItems = updateRes.data.updatePurchaseOrder.items;
    const newItem = updatedItems.find((i) => i.itemName === 'Test Item 2 - Added via Edit');
    const newAqr = newItem?.actualQuantityReceived || 0;
    record(
      '1c. Edit PO: add temp item without currentInput → no IAR',
      newAqr === 0,
      `actualQuantityReceived=${newAqr} (expected 0)`
    );
  }

  // Cleanup
  await deletePO(parseInt(po.id));
}

// ═══════════════════════════════════════════════════════════════════
// TEST GROUP 2: Split quantity validation
// ═══════════════════════════════════════════════════════════════════

async function createTestPOWithIAR() {
  // Create a PO, then generate IAR for it so we have items to split
  const uniquePO = `SPLIT-TEST-${Date.now()}`;
  const poRes = await makeRequest(
    `mutation AddPO($input: PurchaseOrderInput!) {
      addPurchaseOrder(input: $input) {
        id poNumber
        items { id itemName quantity }
      }
    }`,
    {
      input: {
        ...defaultPOFields,
        poNumber: uniquePO,
        supplier: 'Split Test Supplier',
        placeOfDelivery: 'Test',
        campus: 'Talisay',
        amount: 4000,
        items: [
          {
            id: 'temp',
            itemName: 'Splittable Item',
            description: 'Item to split',
            unit: 'pcs',
            quantity: 4,
            unitCost: 1000,
            amount: 4000,
            tag: 'none',
            inventoryNumber: 'none',
          },
        ],
      },
    }
  );

  if (poRes.errors) {
    console.log('  ⚠ Could not create test PO:', poRes.errors[0].message);
    return null;
  }

  const po = poRes.data.addPurchaseOrder;
  const poItemId = parseInt(po.items[0].id);

  // Generate IAR with category=ICS, tag=high, received=2
  const iarRes = await makeRequest(
    `mutation GenIAR($purchaseOrderId: Int!, $items: [GenerateIARItemInput!]!, $invoice: String) {
      generateIARFromPO(purchaseOrderId: $purchaseOrderId, items: $items, invoice: $invoice) {
        success iarId message
      }
    }`,
    {
      purchaseOrderId: parseInt(po.id),
      items: [
        {
          purchaseOrderItemId: poItemId,
          category: 'inventory custodian slip',
          tag: 'high',
          received: 2,
        },
      ],
      invoice: 'TEST-INV-001',
    }
  );

  if (iarRes.errors) {
    console.log('  ⚠ Could not generate IAR:', iarRes.errors[0].message);
    await deletePO(parseInt(po.id));
    return null;
  }

  // Find the IAR items
  const iarItemsRes = await makeRequest(
    `query { inspectionAcceptanceReport { id purchaseOrderId actualQuantityReceived description tag category } }`
  );
  const iarItems = (iarItemsRes.data?.inspectionAcceptanceReport || []).filter(
    (iar) => String(iar.purchaseOrderId) === String(po.id)
  );

  if (iarItems.length === 0) {
    console.log('  ⚠ No IAR items found for test PO');
    await deletePO(parseInt(po.id));
    return null;
  }

  return { poId: parseInt(po.id), iarItemId: iarItems[0].id, actualQty: iarItems[0].actualQuantityReceived };
}

async function testSplitValidation() {
  console.log('\n━━━ GROUP 2: Split quantity validation (ICS) ━━━\n');

  const testData = await createTestPOWithIAR();
  if (!testData) {
    record('2. Setup: Create PO + IAR for split testing', false, 'Could not create test data');
    return;
  }

  const { poId, iarItemId, actualQty } = testData;
  console.log(`  Test data: PO=${poId}, IAR Item=${iarItemId}, Qty=${actualQty}\n`);

  const makeSplit = (itemId, splits) => ({
    input: {
      itemSplits: [
        {
          itemId: String(itemId),
          splits: splits.map((s) => ({
            quantity: s.qty,
            department: 'Test Dept',
            receivedFrom: 'Test Person',
            receivedFromPosition: 'Tester',
            receivedBy: 'Test Receiver',
            receivedByPosition: 'Staff',
          })),
        },
      ],
    },
  });

  const splitMutation = `
    mutation SplitICS($input: SplitAndAssignICSInput!) {
      splitAndAssignICS(input: $input) { id actualQuantityReceived }
    }
  `;

  // 2a. Split total EXCEEDS original (e.g. qty=2, split into 3+1=4) → should fail
  const test2a = await makeRequest(splitMutation, makeSplit(iarItemId, [{ qty: 3 }, { qty: 1 }]));
  record(
    '2a. Split exceeding original qty (3+1=4 vs original 2)',
    !!test2a.errors,
    test2a.errors ? test2a.errors[0].message : 'ERROR: No error thrown!'
  );

  // 2b. Split total LESS THAN original (e.g. qty=2, split into 1) → should fail
  const test2b = await makeRequest(splitMutation, makeSplit(iarItemId, [{ qty: 1 }]));
  record(
    '2b. Split less than original qty (1 vs original 2)',
    !!test2b.errors,
    test2b.errors ? test2b.errors[0].message : 'ERROR: No error thrown!'
  );

  // 2c. Split with zero quantity → should fail
  const test2c = await makeRequest(splitMutation, makeSplit(iarItemId, [{ qty: 0 }, { qty: 2 }]));
  record(
    '2c. Split with zero quantity in a row',
    !!test2c.errors,
    test2c.errors ? test2c.errors[0].message : 'ERROR: No error thrown!'
  );

  // 2d. Split with negative quantity → should fail
  const test2d = await makeRequest(splitMutation, makeSplit(iarItemId, [{ qty: -1 }, { qty: 3 }]));
  record(
    '2d. Split with negative quantity',
    !!test2d.errors,
    test2d.errors ? test2d.errors[0].message : 'ERROR: No error thrown!'
  );

  // 2e. Empty splits array → should fail
  const test2e = await makeRequest(splitMutation, makeSplit(iarItemId, []));
  record(
    '2e. Empty splits array',
    !!test2e.errors,
    test2e.errors ? test2e.errors[0].message : 'ERROR: No error thrown!'
  );

  // 2f. Split with non-existent item ID → should fail
  const test2f = await makeRequest(splitMutation, makeSplit(999999, [{ qty: 1 }, { qty: 1 }]));
  record(
    '2f. Split with non-existent item ID',
    !!test2f.errors,
    test2f.errors ? test2f.errors[0].message : 'ERROR: No error thrown!'
  );

  // 2g. Valid split (1+1=2) → should succeed
  const test2g = await makeRequest(splitMutation, makeSplit(iarItemId, [{ qty: 1 }, { qty: 1 }]));
  record(
    '2g. Valid split (1+1=2, matches original)',
    !test2g.errors,
    test2g.errors ? test2g.errors[0].message : 'Split succeeded as expected'
  );

  // Cleanup
  await deletePO(poId);
}

// ═══════════════════════════════════════════════════════════════════
// TEST GROUP 3: Split validation on PAR
// ═══════════════════════════════════════════════════════════════════

async function testSplitValidationPAR() {
  console.log('\n━━━ GROUP 3: Split quantity validation (PAR) ━━━\n');

  // Create PO + IAR with PAR category
  const uniquePO = `PAR-SPLIT-${Date.now()}`;
  const poRes = await makeRequest(
    `mutation AddPO($input: PurchaseOrderInput!) {
      addPurchaseOrder(input: $input) {
        id items { id }
      }
    }`,
    {
      input: {
        ...defaultPOFields,
        poNumber: uniquePO,
        supplier: 'PAR Test Supplier',
        placeOfDelivery: 'Test',
        campus: 'Talisay',
        amount: 1500,
        items: [
          {
            id: 'temp',
            itemName: 'PAR Splittable',
            description: 'PAR item',
            unit: 'pcs',
            quantity: 3,
            unitCost: 500,
            amount: 1500,
            tag: 'none',
            inventoryNumber: 'none',
          },
        ],
      },
    }
  );

  if (poRes.errors) {
    record('3. Setup PAR test PO', false, poRes.errors[0].message);
    return;
  }

  const po = poRes.data.addPurchaseOrder;
  const poItemId = parseInt(po.items[0].id);

  const iarRes = await makeRequest(
    `mutation GenIAR($purchaseOrderId: Int!, $items: [GenerateIARItemInput!]!, $invoice: String) {
      generateIARFromPO(purchaseOrderId: $purchaseOrderId, items: $items, invoice: $invoice) {
        success iarId message
      }
    }`,
    {
      purchaseOrderId: parseInt(po.id),
      items: [
        {
          purchaseOrderItemId: poItemId,
          category: 'property acknowledgement reciept',
          tag: 'none',
          received: 3,
        },
      ],
      invoice: 'PAR-INV-001',
    }
  );

  if (iarRes.errors) {
    record('3. Setup PAR IAR', false, iarRes.errors[0].message);
    await deletePO(parseInt(po.id));
    return;
  }

  // Find PAR IAR items
  const iarItemsRes = await makeRequest(
    `query { inspectionAcceptanceReport { id purchaseOrderId actualQuantityReceived category } }`
  );
  const parItems = (iarItemsRes.data?.inspectionAcceptanceReport || []).filter(
    (iar) =>
      String(iar.purchaseOrderId) === String(po.id) &&
      iar.category === 'property acknowledgement reciept'
  );

  if (parItems.length === 0) {
    record('3. Setup PAR items', false, 'No PAR IAR items found');
    await deletePO(parseInt(po.id));
    return;
  }

  const parItemId = parItems[0].id;
  const originalQty = parItems[0].actualQuantityReceived;

  const splitMutation = `
    mutation SplitPAR($input: SplitAndAssignPARInput!) {
      splitAndAssignPAR(input: $input) { id actualQuantityReceived }
    }
  `;

  const makePARSplit = (itemId, splits) => ({
    input: {
      itemSplits: [
        {
          itemId: String(itemId),
          splits: splits.map((s) => ({
            quantity: s.qty,
            department: 'Test Dept',
            receivedFrom: 'Test Person',
            receivedFromPosition: 'Tester',
            receivedBy: 'Test Receiver',
            receivedByPosition: 'Staff',
          })),
        },
      ],
    },
  });

  // 3a. PAR: Split exceeding (2+2=4 vs 3)
  const test3a = await makeRequest(
    splitMutation,
    makePARSplit(parItemId, [{ qty: 2 }, { qty: 2 }])
  );
  record(
    '3a. PAR: Split exceeding original (2+2=4 vs 3)',
    !!test3a.errors,
    test3a.errors ? test3a.errors[0].message : 'ERROR: No error thrown!'
  );

  // 3b. PAR: Valid split (1+1+1=3)
  const test3b = await makeRequest(
    splitMutation,
    makePARSplit(parItemId, [{ qty: 1 }, { qty: 1 }, { qty: 1 }])
  );
  record(
    '3b. PAR: Valid split (1+1+1=3)',
    !test3b.errors,
    test3b.errors ? test3b.errors[0].message : `Split succeeded (original qty=${originalQty})`
  );

  await deletePO(parseInt(po.id));
}

// ═══════════════════════════════════════════════════════════════════
// TEST GROUP 4: Split validation on RIS
// ═══════════════════════════════════════════════════════════════════

async function testSplitValidationRIS() {
  console.log('\n━━━ GROUP 4: Split quantity validation (RIS) ━━━\n');

  const uniquePO = `RIS-SPLIT-${Date.now()}`;
  const poRes = await makeRequest(
    `mutation AddPO($input: PurchaseOrderInput!) {
      addPurchaseOrder(input: $input) {
        id items { id }
      }
    }`,
    {
      input: {
        ...defaultPOFields,
        poNumber: uniquePO,
        supplier: 'RIS Test Supplier',
        placeOfDelivery: 'Test',
        campus: 'Talisay',
        amount: 600,
        items: [
          {
            id: 'temp',
            itemName: 'RIS Splittable',
            description: 'RIS item',
            unit: 'pcs',
            quantity: 2,
            unitCost: 300,
            amount: 600,
            tag: 'none',
            inventoryNumber: 'none',
          },
        ],
      },
    }
  );

  if (poRes.errors) {
    record('4. Setup RIS test PO', false, poRes.errors[0].message);
    return;
  }

  const po = poRes.data.addPurchaseOrder;
  const poItemId = parseInt(po.items[0].id);

  const iarRes = await makeRequest(
    `mutation GenIAR($purchaseOrderId: Int!, $items: [GenerateIARItemInput!]!, $invoice: String) {
      generateIARFromPO(purchaseOrderId: $purchaseOrderId, items: $items, invoice: $invoice) {
        success iarId message
      }
    }`,
    {
      purchaseOrderId: parseInt(po.id),
      items: [
        {
          purchaseOrderItemId: poItemId,
          category: 'requisition issue slip',
          tag: 'none',
          received: 2,
        },
      ],
      invoice: 'RIS-INV-001',
    }
  );

  if (iarRes.errors) {
    record('4. Setup RIS IAR', false, iarRes.errors[0].message);
    await deletePO(parseInt(po.id));
    return;
  }

  // For RIS, the split resolver uses the RIS model, not the IAR model.
  // We need to find the RIS item by querying the inspectionAcceptanceReport
  // since generateIARFromPO creates records in the IAR table
  const iarItemsRes = await makeRequest(
    `query { inspectionAcceptanceReport { id purchaseOrderId actualQuantityReceived category } }`
  );
  const risItems = (iarItemsRes.data?.inspectionAcceptanceReport || []).filter(
    (iar) =>
      String(iar.purchaseOrderId) === String(po.id) &&
      iar.category === 'requisition issue slip'
  );

  if (risItems.length === 0) {
    record('4. Setup RIS items', false, 'No RIS IAR items found');
    await deletePO(parseInt(po.id));
    return;
  }

  const risItemId = risItems[0].id;

  const splitMutation = `
    mutation SplitRIS($input: SplitAndAssignRISInput!) {
      splitAndAssignRIS(input: $input) { id actualQuantityReceived }
    }
  `;

  const makeRISSplit = (itemId, splits) => ({
    input: {
      itemSplits: [
        {
          itemId: String(itemId),
          splits: splits.map((s) => ({
            quantity: s.qty,
            department: 'Test Dept',
            receivedFrom: 'Test Person',
            receivedFromPosition: 'Tester',
            receivedBy: 'Test Receiver',
            receivedByPosition: 'Staff',
          })),
        },
      ],
    },
  });

  // 4a. RIS: Split exceeding (3+1=4 vs 2) — the user's exact scenario
  const test4a = await makeRequest(
    splitMutation,
    makeRISSplit(risItemId, [{ qty: 3 }, { qty: 1 }])
  );
  record(
    '4a. RIS: Split 3+1=4 vs original 2 (user scenario)',
    !!test4a.errors,
    test4a.errors ? test4a.errors[0].message : 'ERROR: No error thrown!'
  );

  // 4b. RIS: Single split equal to total (just 2) — should succeed
  const test4b = await makeRequest(
    splitMutation,
    makeRISSplit(risItemId, [{ qty: 1 }, { qty: 1 }])
  );
  record(
    '4b. RIS: Valid split (1+1=2)',
    !test4b.errors,
    test4b.errors ? test4b.errors[0].message : 'Split succeeded'
  );

  await deletePO(parseInt(po.id));
}

// ═══════════════════════════════════════════════════════════════════
// TEST GROUP 5: Frontend-simulated edge cases
// ═══════════════════════════════════════════════════════════════════

async function testFrontendEdgeCases() {
  console.log('\n━━━ GROUP 5: Frontend-simulated edge cases ━━━\n');

  // 5a. Add PO with currentInput > 0 (backend should still NOT create IAR for addPurchaseOrder)
  const uniquePO = `FE-EDGE-${Date.now()}`;
  const res = await makeRequest(
    `mutation AddPO($input: PurchaseOrderInput!) {
      addPurchaseOrder(input: $input) {
        id items { id actualQuantityReceived }
      }
    }`,
    {
      input: {
        ...defaultPOFields,
        poNumber: uniquePO,
        supplier: 'FE Edge Supplier',
        placeOfDelivery: 'Test',
        campus: 'Talisay',
        amount: 500,
        items: [
          {
            id: 'temp',
            itemName: 'FE Edge Item',
            description: 'Test',
            unit: 'pcs',
            quantity: 10,
            unitCost: 50,
            amount: 500,
            currentInput: 5, // Simulates if frontend accidentally sends non-zero
            tag: 'none',
            inventoryNumber: 'none',
          },
        ],
      },
    }
  );

  if (res.errors) {
    record('5a. Add PO with currentInput=5 (backend ignores)', false, res.errors[0].message);
    return;
  }

  const po = res.data.addPurchaseOrder;
  const aqr = po.items[0]?.actualQuantityReceived || 0;
  record(
    '5a. Add PO with currentInput=5 → backend still sets AQR=0',
    aqr === 0,
    `actualQuantityReceived=${aqr} (expected 0, backend always hardcodes 0 for addPO)`
  );

  // Check no IARs created
  const iarCheck = await makeRequest(
    `query { inspectionAcceptanceReport { id purchaseOrderId } }`
  );
  const iars = (iarCheck.data?.inspectionAcceptanceReport || []).filter(
    (iar) => String(iar.purchaseOrderId) === String(po.id)
  );
  record(
    '5b. No IAR records even with currentInput=5 on addPO',
    iars.length === 0,
    `Found ${iars.length} IAR(s)`
  );

  await deletePO(parseInt(po.id));
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     EDGE CASE TESTS — IAR & SPLIT FIXES        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  await login();

  await testNoIAROnNewPO();
  await testSplitValidation();
  await testSplitValidationPAR();
  await testSplitValidationRIS();
  await testFrontendEdgeCases();

  // ── Report ──
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                  TEST RESULTS                   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  for (const r of results) {
    console.log(`  ${r.status}  ${r.name}`);
    if (r.detail) console.log(`         ${r.detail}`);
  }

  console.log(`\n  ────────────────────────────────────────`);
  console.log(`  Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log(`  ────────────────────────────────────────\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

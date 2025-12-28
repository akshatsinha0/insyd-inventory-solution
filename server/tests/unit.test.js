/*
 * 1.) Unit Tests for Business Logic.
 * 2.) Tested utility functions and data validation.
 * 3.) Validated ABC categorization and status mappings.
 */

describe('ABC Categorization Logic', () => {
  const categorizeByValue = (unitPrice, annualVolume) => {
    const annualValue = unitPrice * annualVolume;
    if (annualValue >= 1000000) return 'A';
    if (annualValue >= 100000) return 'B';
    return 'C';
  };

  test('High value items should be Category A', () => {
    expect(categorizeByValue(15000, 100)).toBe('A');
    expect(categorizeByValue(22000, 50)).toBe('A');
  });

  test('Medium value items should be Category B', () => {
    expect(categorizeByValue(1200, 200)).toBe('B');
    expect(categorizeByValue(500, 500)).toBe('B');
  });

  test('Low value items should be Category C', () => {
    expect(categorizeByValue(50, 100)).toBe('C');
    expect(categorizeByValue(100, 50)).toBe('C');
  });
});

describe('Inventory Calculations', () => {
  const calculateAvailableQuantity = (quantity, allocatedQuantity) => {
    return quantity - allocatedQuantity;
  };

  const isAtReorderLevel = (quantity, reorderLevel, safetyStock) => {
    return quantity <= (reorderLevel + safetyStock);
  };

  const isOverstocked = (quantity, reorderLevel, safetyStock) => {
    return quantity > 2 * (reorderLevel + safetyStock);
  };

  test('Available quantity should be total minus allocated', () => {
    expect(calculateAvailableQuantity(100, 20)).toBe(80);
    expect(calculateAvailableQuantity(50, 50)).toBe(0);
    expect(calculateAvailableQuantity(100, 0)).toBe(100);
  });

  test('Should detect reorder level correctly', () => {
    expect(isAtReorderLevel(70, 50, 20)).toBe(true);
    expect(isAtReorderLevel(100, 50, 20)).toBe(false);
    expect(isAtReorderLevel(50, 50, 20)).toBe(true);
  });

  test('Should detect overstocked correctly', () => {
    expect(isOverstocked(200, 50, 20)).toBe(true);
    expect(isOverstocked(100, 50, 20)).toBe(false);
    expect(isOverstocked(141, 50, 20)).toBe(true);
  });
});

describe('Transaction Type Validation', () => {
  const validTypes = ['RECEIVE', 'ALLOCATE', 'DEALLOCATE', 'PICK', 'SHIP', 'ADJUST', 'TRANSFER', 'RETURN'];

  const isValidTransactionType = (type) => {
    return validTypes.includes(type);
  };

  test('Should validate correct transaction types', () => {
    expect(isValidTransactionType('RECEIVE')).toBe(true);
    expect(isValidTransactionType('ALLOCATE')).toBe(true);
    expect(isValidTransactionType('SHIP')).toBe(true);
    expect(isValidTransactionType('ADJUST')).toBe(true);
  });

  test('Should reject invalid transaction types', () => {
    expect(isValidTransactionType('INVALID')).toBe(false);
    expect(isValidTransactionType('receive')).toBe(false);
    expect(isValidTransactionType('')).toBe(false);
  });
});

describe('Shipment Status Validation', () => {
  const validStatuses = ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  const isValidShipmentStatus = (status) => {
    return validStatuses.includes(status);
  };

  const canTransitionTo = (currentStatus, newStatus) => {
    const transitions = {
      'DISPATCHED': ['IN_TRANSIT', 'CANCELLED'],
      'IN_TRANSIT': ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    };
    return transitions[currentStatus]?.includes(newStatus) || false;
  };

  test('Should validate correct shipment statuses', () => {
    expect(isValidShipmentStatus('DISPATCHED')).toBe(true);
    expect(isValidShipmentStatus('IN_TRANSIT')).toBe(true);
    expect(isValidShipmentStatus('DELIVERED')).toBe(true);
  });

  test('Should reject invalid shipment statuses', () => {
    expect(isValidShipmentStatus('PENDING')).toBe(false);
    expect(isValidShipmentStatus('in_transit')).toBe(false);
  });

  test('Should validate status transitions', () => {
    expect(canTransitionTo('DISPATCHED', 'IN_TRANSIT')).toBe(true);
    expect(canTransitionTo('IN_TRANSIT', 'DELIVERED')).toBe(true);
    expect(canTransitionTo('DELIVERED', 'DISPATCHED')).toBe(false);
  });
});

describe('3 Way Match Logic', () => {
  const performThreeWayMatch = (poTotal, grnTotal, invoiceTotal, tolerance = 0.01) => {
    const poGrnVariance = Math.abs(poTotal - grnTotal);
    const grnInvoiceVariance = Math.abs(grnTotal - invoiceTotal);
    const poInvoiceVariance = Math.abs(poTotal - invoiceTotal);
    
    const maxVariance = Math.max(poGrnVariance, grnInvoiceVariance, poInvoiceVariance);
    
    if (maxVariance <= tolerance) {
      return { status: 'MATCHED', variance: 0 };
    }
    return { status: 'DISCREPANCY', variance: maxVariance };
  };

  test('Should match when all totals are equal', () => {
    const result = performThreeWayMatch(650000, 650000, 650000);
    expect(result.status).toBe('MATCHED');
    expect(result.variance).toBe(0);
  });

  test('Should match within tolerance', () => {
    const result = performThreeWayMatch(650000, 650000.005, 650000);
    expect(result.status).toBe('MATCHED');
  });

  test('Should detect discrepancy when GRN differs', () => {
    const result = performThreeWayMatch(650000, 617500, 650000);
    expect(result.status).toBe('DISCREPANCY');
    expect(result.variance).toBe(32500);
  });

  test('Should detect discrepancy when invoice differs', () => {
    const result = performThreeWayMatch(650000, 650000, 700000);
    expect(result.status).toBe('DISCREPANCY');
    expect(result.variance).toBe(50000);
  });
});

describe('Bin Location Format Validation', () => {
  const isValidBinFormat = (binCode) => {
    const pattern = /^WH\d{2}-ASL\d{2}-RK\d{2}-BN\d{2}$/;
    return pattern.test(binCode);
  };

  const parseBinLocation = (binCode) => {
    const parts = binCode.split('-');
    if (parts.length !== 4) return null;
    return {
      warehouse: parts[0],
      aisle: parts[1],
      rack: parts[2],
      bin: parts[3]
    };
  };

  test('Should validate correct bin format', () => {
    expect(isValidBinFormat('WH01-ASL01-RK01-BN01')).toBe(true);
    expect(isValidBinFormat('WH02-ASL05-RK10-BN25')).toBe(true);
  });

  test('Should reject invalid bin format', () => {
    expect(isValidBinFormat('WH1-ASL1-RK1-BN1')).toBe(false);
    expect(isValidBinFormat('WH01-ASL01-RK01')).toBe(false);
    expect(isValidBinFormat('INVALID')).toBe(false);
  });

  test('Should parse bin location correctly', () => {
    const parsed = parseBinLocation('WH01-ASL02-RK03-BN04');
    expect(parsed.warehouse).toBe('WH01');
    expect(parsed.aisle).toBe('ASL02');
    expect(parsed.rack).toBe('RK03');
    expect(parsed.bin).toBe('BN04');
  });
});

describe('SKU Code Format Validation', () => {
  const isValidSkuFormat = (skuCode) => {
    const pattern = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;
    return pattern.test(skuCode);
  };

  test('Should validate correct SKU format', () => {
    expect(isValidSkuFormat('MAR-ITL-001')).toBe(true);
    expect(isValidSkuFormat('DWT-DRL-001')).toBe(true);
    expect(isValidSkuFormat('STL-JSW-002')).toBe(true);
  });

  test('Should reject invalid SKU format', () => {
    expect(isValidSkuFormat('MAR-ITL-1')).toBe(false);
    expect(isValidSkuFormat('marble-italian-001')).toBe(false);
    expect(isValidSkuFormat('INVALID')).toBe(false);
  });
});

describe('PO Number Generation', () => {
  const generatePONumber = (timestamp) => {
    return `PO-${timestamp}`;
  };

  const generateGRNNumber = (timestamp) => {
    return `GRN-${timestamp}`;
  };

  test('Should generate valid PO number', () => {
    const poNumber = generatePONumber(1735380000000);
    expect(poNumber).toBe('PO-1735380000000');
    expect(poNumber.startsWith('PO-')).toBe(true);
  });

  test('Should generate valid GRN number', () => {
    const grnNumber = generateGRNNumber(1735380100000);
    expect(grnNumber).toBe('GRN-1735380100000');
    expect(grnNumber.startsWith('GRN-')).toBe(true);
  });
});

// Test for Corrected Bow + Arrow ATK calculation
console.log('=== Corrected Bow + Arrow ATK Calculation Test ===');

// Test scenario from corrected design document
const testData = {
  baseStats: {
    level: 150,
    STR: 180,
    INT: 1,
    VIT: 1,
    AGI: 1,
    DEX: 220,
    CRT: 1,
    MEN: 1,
    TEC: 1
  },
  mainWeapon: {
    weaponType: '弓',
    ATK: 800,
    stability: 50,
    refinement: 10
  },
  subWeapon: {
    weaponType: '矢',
    ATK: 200,
    stability: 0,
    refinement: 0
  },
  bonuses: {
    WeaponATK_Rate: 20,  // 武器ATK% 20%
    WeaponATK: 80,       // 武器ATK固定値 80
    ATK_Rate: 25,        // ATK% 25%
    ATK: 150             // ATK固定値 150
  }
};

console.log('Input Data:');
console.log('- Main Weapon (Bow) ATK:', testData.mainWeapon.ATK);
console.log('- Sub Weapon (Arrow) ATK:', testData.subWeapon.ATK);
console.log('- Refinement:', testData.mainWeapon.refinement);
console.log('- Weapon ATK%:', testData.bonuses.WeaponATK_Rate + '%');
console.log('- Weapon ATK Fixed:', testData.bonuses.WeaponATK);

console.log('\nCorrected Calculation Steps:');

// 0. Bow + Arrow combination check
const isBowArrowCombo = (testData.mainWeapon.weaponType === '弓' || testData.mainWeapon.weaponType === '自動弓') 
                       && testData.subWeapon.weaponType === '矢';
console.log('1. Is Bow + Arrow combo:', isBowArrowCombo);

// 1. Refined weapon ATK (main weapon only)
const refinedWeaponATK = Math.floor(
  testData.mainWeapon.ATK * (1 + testData.mainWeapon.refinement ** 2 / 100) + testData.mainWeapon.refinement
);
console.log('2. Refined Weapon ATK (main weapon only):', refinedWeaponATK);

// 2. Weapon ATK% bonus (main weapon only)
const weaponATKPercentBonus = Math.floor(testData.mainWeapon.ATK * testData.bonuses.WeaponATK_Rate / 100);
console.log('3. Weapon ATK% bonus (main weapon only):', weaponATKPercentBonus);

// 3. Total Weapon ATK (with arrow ATK as fixed bonus)
const arrowATK = isBowArrowCombo ? testData.subWeapon.ATK : 0;
const totalWeaponATK = refinedWeaponATK + weaponATKPercentBonus + testData.bonuses.WeaponATK + arrowATK;
console.log('4. Arrow ATK (added as fixed bonus):', arrowATK);
console.log('5. Total Weapon ATK:', totalWeaponATK);

// 4. Status ATK (Bow: STR × 1.0 + DEX × 3.0)
const statusATK = testData.baseStats.STR * 1.0 + testData.baseStats.DEX * 3.0;
console.log('6. Status ATK (STR×1.0 + DEX×3.0):', statusATK);

// 5. Base ATK
const baseATK = testData.baseStats.level + totalWeaponATK + statusATK;
console.log('7. Base ATK:', baseATK);

// 6. Final ATK
const finalATK = Math.floor(baseATK * (1 + testData.bonuses.ATK_Rate / 100)) + testData.bonuses.ATK;
console.log('8. Final ATK:', finalATK);

console.log('\nExpected from corrected design document:');
console.log('- Refined Weapon ATK: 1610 (800 × 2.0 + 10)');
console.log('- Weapon ATK% bonus: 160 (800 × 20/100)');
console.log('- Total Weapon ATK: 2050 (1610 + 160 + 80 + 200)');
console.log('- Status ATK: 840 (180×1 + 220×3)');
console.log('- Base ATK: 3040 (150 + 2050 + 840)');
console.log('- Final ATK: 3950 (INT(3040×1.25) + 150)');

console.log('\nPrevious (incorrect) vs Corrected:');
console.log('- Previous Total Weapon ATK: 2290');
console.log('- Corrected Total Weapon ATK: 2050');
console.log('- Previous Final ATK: 4250');
console.log('- Corrected Final ATK: 3950');
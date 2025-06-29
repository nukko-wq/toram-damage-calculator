// Test for Non-Bow weapons (should not add arrow ATK)
console.log('=== Non-Bow Weapon Test (Corrected Implementation) ===');

const testData = {
  mainWeapon: {
    weaponType: '片手剣',
    ATK: 1000,
    refinement: 10
  },
  subWeapon: {
    weaponType: '矢',
    ATK: 200,
    refinement: 0
  },
  bonuses: {
    WeaponATK_Rate: 20,
    WeaponATK: 80
  }
};

// Check calculation
const isBowArrowCombo = (testData.mainWeapon.weaponType === '弓' || testData.mainWeapon.weaponType === '自動弓') 
                       && testData.subWeapon.weaponType === '矢';

const arrowATK = isBowArrowCombo ? testData.subWeapon.ATK : 0;

const refinedWeaponATK = Math.floor(
  testData.mainWeapon.ATK * (1 + Math.pow(testData.mainWeapon.refinement, 2) / 100) + testData.mainWeapon.refinement
);

const weaponATKPercentBonus = Math.floor(testData.mainWeapon.ATK * testData.bonuses.WeaponATK_Rate / 100);
const totalWeaponATK = refinedWeaponATK + weaponATKPercentBonus + testData.bonuses.WeaponATK + arrowATK;

console.log('Input:');
console.log('- Main Weapon: 片手剣, ATK:', testData.mainWeapon.ATK);
console.log('- Sub Weapon: 矢, ATK:', testData.subWeapon.ATK);

console.log('\nResults:');
console.log('- Is Bow + Arrow combo:', isBowArrowCombo);
console.log('- Arrow ATK added:', arrowATK);
console.log('- Refined Weapon ATK:', refinedWeaponATK);
console.log('- Weapon ATK% bonus:', weaponATKPercentBonus);
console.log('- Total Weapon ATK:', totalWeaponATK);

console.log('\nExpected:');
console.log('- Should NOT be bow + arrow combo: false');
console.log('- Arrow ATK should be 0 (ignored)');
console.log('- Total Weapon ATK should not include arrow ATK');
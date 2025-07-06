/**
 * ダメージ差分計算のデバッグスクリプト
 */

// 最小限のテストケースを作成
console.log('🔍 DAMAGE DIFFERENCE DEBUG STARTED');

// テスト用のデータ構造
const testCurrentData = {
  crystals: {
    weapon1: null,
    weapon2: null,
    armor1: null,
    armor2: null,
    additional1: null,
    additional2: null,
    special1: null,
    special2: null,
  },
  baseStats: {
    STR: 200,
    level: 200,
  },
  mainWeapon: {
    ATK: 1000,
    weaponType: 'bow',
    stability: 85,
  },
  equipment: {},
  buffSkills: { skills: {} },
  food: { foods: {} },
  buffItems: { items: {} },
  register: { effects: [] },
  enemy: { selectedEnemyId: null },
};

const testSimulatedData = {
  ...testCurrentData,
  crystals: {
    ...testCurrentData.crystals,
    weapon1: '1c16cbd5-e043-4292-851d-e02a8aea721c', // ドン・プロフンド
  },
};

const testItem = {
  id: '1c16cbd5-e043-4292-851d-e02a8aea721c',
  name: 'ドン・プロフンド',
  type: 'crystal',
};

const testSlotInfo = {
  type: 'crystal',
  category: 'weapon',
  slot: 0, // weapon1スロット
};

console.log('📊 TEST DATA:', {
  currentCrystals: testCurrentData.crystals,
  simulatedCrystals: testSimulatedData.crystals,
  item: testItem,
  slotInfo: testSlotInfo,
});

// 実際の差分: 1,733,894 - 1,545,621 = 188,273
// 表示される差分: +1,209
console.log('🎯 Expected damage difference: 188,273');
console.log('🎯 Actual displayed difference: +1,209');
console.log('🚨 DISCREPANCY: 188,273 - 1,209 = 187,064');

console.log('🔍 POTENTIAL ISSUES TO INVESTIGATE:');
console.log('1. クリスタルシミュレーションが正しく動作しているか？');
console.log('2. calculateResults関数でクリスタル効果が正しく計算されているか？');
console.log('3. calculateDamageFromResults関数で正しいダメージが計算されているか？');
console.log('4. ダメージ計算の入力値に違いがあるか？');
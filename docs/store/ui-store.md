# UIStore設計書

**目的**: UI状態の管理

```typescript
interface UIStore {
  // === 状態 ===
  showSaveManager: boolean

  // === 操作 ===
  setShowSaveManager: (value: boolean) => void
}
```

**主要機能**:
- セーブデータ管理画面の表示状態
- 将来的なモーダル状態管理

